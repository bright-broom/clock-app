import { expect, test, type Page } from '@playwright/test'

function collectPageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test('uses the browser time zone independently of display language', async ({
  page,
}) => {
  const errors = collectPageErrors(page)
  const response = await page.goto('/en')

  await expect(page).toHaveTitle('Online Digital Clock | Real-time Local Time')
  await expect(page.getByText('Europe/London')).toBeVisible()
  await expect(page.getByRole('timer')).toBeVisible()
  expect(response?.headers()['x-frame-options']).toBe('DENY')
  expect(response?.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'"
  )
  expect(errors).toEqual([])
})

test('supports the timer lifecycle without hijacking a focused link', async ({
  page,
}) => {
  const errors = collectPageErrors(page)
  await page.goto('/ja/timer')

  await page.getByRole('button', { name: '1 分' }).click()
  const backLink = page.getByRole('link', { name: 'ホームへ戻る' })
  await backLink.focus()
  await backLink.press('Space')
  await expect(page.getByRole('button', { name: '開始' })).toBeEnabled()

  await page.getByRole('button', { name: '開始' }).click()
  await expect(page.getByRole('button', { name: '一時停止' })).toBeEnabled()
  await page.getByRole('button', { name: '一時停止' }).click()
  await expect(page.getByRole('button', { name: '再開' })).toBeEnabled()
  await page.getByRole('button', { name: 'リセット' }).click()
  await expect(page.getByRole('button', { name: 'リセット' })).toBeDisabled()
  expect(errors).toEqual([])
})

test('preserves the current tool when switching languages', async ({
  page,
}) => {
  await page.goto('/ja/timer')

  await page.getByRole('button', { name: '言語: 日本語' }).click()
  await page.getByRole('option', { name: /英語/ }).click()

  await expect(page).toHaveURL(/\/en\/timer$/)
  await expect(page.getByRole('heading', { name: 'Timer' })).toBeVisible()
})

test('keeps the timer within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/ja/timer')

  await expect(page.getByRole('timer')).toBeVisible()
  await page.getByLabel('分', { exact: true }).fill('12')
  const increaseSeconds = page.getByRole('button', { name: '秒を増やす' })
  await increaseSeconds.click()
  await expect(page.getByRole('timer')).toHaveAttribute(
    'aria-label',
    '残り 00 時間 12 分 01 秒'
  )

  const stepTarget = await increaseSeconds.boundingBox()
  expect(stepTarget).not.toBeNull()
  expect(stepTarget?.width).toBeGreaterThanOrEqual(44)
  expect(stepTarget?.height).toBeGreaterThanOrEqual(44)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)

  const scrollDistance = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  )
  expect(scrollDistance).toBeLessThanOrEqual(160)
})
