import { expect, test, type Page } from '@playwright/test'

function collectPageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

async function clippedInteractiveElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>(
      '[data-layout="focused-shell"]'
    )
    if (!panel) return ['missing-panel']

    const panelBounds = panel.getBoundingClientRect()
    const candidates = panel.querySelectorAll<HTMLElement>(
      'button, input, a[href], h1, [role="timer"]'
    )

    return Array.from(candidates).flatMap((element) => {
      const bounds = element.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return []

      const clipped =
        bounds.left < Math.max(0, panelBounds.left) - 1 ||
        bounds.right > Math.min(window.innerWidth, panelBounds.right) + 1
      return clipped
        ? [
            `${element.tagName.toLowerCase()}:${element.getAttribute('aria-label') ?? element.textContent?.trim() ?? ''}`,
          ]
        : []
    })
  })
}

test('uses the browser time zone independently of display language', async ({
  page,
}) => {
  const errors = collectPageErrors(page)
  const response = await page.goto('/en')

  await expect(page).toHaveTitle('Online Digital Clock | Real-time Local Time')
  await expect(page.getByText('Europe/London')).toBeVisible()
  await expect(page.getByRole('timer')).toBeVisible()
  await expect(page.locator('.clock-orbit-outer')).toBeVisible()
  const colonCenterDelta = await page
    .locator('.colon-pulse')
    .evaluate((colon) => {
      const bounds = colon.getBoundingClientRect()
      return Math.abs(bounds.x + bounds.width / 2 - window.innerWidth / 2)
    })
  expect(colonCenterDelta).toBeLessThanOrEqual(1)
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

  await expect(
    page.getByText(
      '開始、一時停止、再開に対応したシンプルなカウントダウンタイマーです。'
    )
  ).toHaveCount(0)
  await expect(
    page.getByText('Space：開始・一時停止 / R：リセット')
  ).toHaveCount(0)
  await expect(
    page.getByText('バックグラウンドでは完了音が遅れる場合があります')
  ).toHaveCount(0)
  await expect(page.getByText('時間を設定')).toHaveCount(0)
  await expect(page.getByText('タイマーを設定しました')).toHaveCount(0)

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

test('supports the stopwatch lifecycle within a mobile viewport', async ({
  page,
}) => {
  const errors = collectPageErrors(page)
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/ja/stopwatch')

  const display = page.getByRole('timer')
  await expect(page).toHaveTitle(/オンラインストップウォッチ/)
  await expect(display).toHaveAttribute(
    'aria-label',
    '経過時間 00 時間 00 分 00.0 秒'
  )

  const start = page.getByRole('button', { name: '開始' })
  const reset = page.getByRole('button', { name: 'リセット' })
  const [startBox, resetBox] = await Promise.all([
    start.boundingBox(),
    reset.boundingBox(),
  ])
  expect(startBox?.height).toBeGreaterThanOrEqual(44)
  expect(resetBox?.height).toBeGreaterThanOrEqual(44)

  await start.click()
  await expect(page.getByRole('button', { name: '一時停止' })).toBeEnabled()
  await expect
    .poll(() => display.getAttribute('aria-label'))
    .not.toBe('経過時間 00 時間 00 分 00.0 秒')

  await page.getByRole('button', { name: '一時停止' }).click()
  const pausedLabel = await display.getAttribute('aria-label')
  await page.waitForTimeout(250)
  await expect(display).toHaveAttribute('aria-label', pausedLabel ?? '')

  await reset.click()
  await expect(reset).toBeDisabled()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(320)
  const headingLineCount = await page
    .getByRole('heading', { name: 'ストップウォッチ' })
    .evaluate((heading) => {
      const style = getComputedStyle(heading)
      return (
        heading.getBoundingClientRect().height / parseFloat(style.lineHeight)
      )
    })
  expect(headingLineCount).toBeLessThan(1.5)
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
  const startTarget = await page
    .getByRole('button', { name: '開始' })
    .boundingBox()
  const resetTarget = await page
    .getByRole('button', { name: 'リセット' })
    .boundingBox()
  const soundTarget = await page
    .getByRole('button', { name: '完了音：オン' })
    .boundingBox()
  expect(stepTarget).not.toBeNull()
  expect(startTarget).not.toBeNull()
  expect(resetTarget).not.toBeNull()
  expect(soundTarget).not.toBeNull()
  expect(stepTarget?.width).toBeGreaterThanOrEqual(44)
  expect(stepTarget?.height).toBeGreaterThanOrEqual(44)
  expect(soundTarget?.width).toBeGreaterThanOrEqual(44)
  expect(soundTarget?.height).toBeGreaterThanOrEqual(44)
  expect((startTarget?.width ?? 0) / (resetTarget?.width ?? 1)).toBeCloseTo(
    1.618,
    1
  )
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)

  const scrollDistance = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  )
  expect(scrollDistance).toBeLessThanOrEqual(160)
})

test('keeps the timer running away from its route and restores sound preference', async ({
  page,
}) => {
  await page.goto('/ja/timer')
  await page.getByRole('button', { name: '完了音：オン' }).click()
  await page.getByLabel('分', { exact: true }).fill('0')
  await page.getByLabel('秒', { exact: true }).fill('2')
  await page.getByRole('button', { name: '開始' }).click()

  await page.getByRole('link', { name: 'ホームへ戻る' }).click()
  await page.waitForTimeout(2200)
  expect(
    await page.evaluate(() => {
      const stored = localStorage.getItem('clock-app:timer:v2')
      return stored ? JSON.parse(stored).timer.status : null
    })
  ).toBe('completed')
  await page.goto('/ja/timer')

  await expect(page.getByText('タイマーが終了しました').first()).toBeVisible()
  await expect(
    page.getByRole('button', { name: '完了音：オフ' })
  ).toHaveAttribute('aria-pressed', 'false')

  await page.reload()
  await expect(page.getByRole('button', { name: '完了音：オフ' })).toBeVisible()
})

test('keeps every localized timer control inside a 320px viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })

  for (const locale of ['ja', 'en', 'es', 'pt', 'fr', 'de', 'hi']) {
    await page.goto(`/${locale}/timer`)
    await expect(page.getByRole('timer')).toBeVisible()
    expect(await clippedInteractiveElements(page), locale).toEqual([])
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      locale
    ).toBeLessThanOrEqual(320)
  }
})

test('uses a golden-ratio shell on wide tool pages', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/ja/world-clock')

  const supporting = page.locator('[data-layout-region="supporting"]')
  const primary = page.locator('[data-layout-region="primary"]')
  const [supportingBox, primaryBox] = await Promise.all([
    supporting.boundingBox(),
    primary.boundingBox(),
  ])

  expect(supportingBox).not.toBeNull()
  expect(primaryBox).not.toBeNull()

  const totalWidth = (supportingBox?.width ?? 0) + (primaryBox?.width ?? 0)
  expect((primaryBox?.width ?? 0) / totalWidth).toBeCloseTo(0.618, 2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    1440
  )

  await page.goto('/ja/timer')
  const timerBounds = await page.evaluate(() => {
    const dial = document.querySelector('.timer-dial')?.getBoundingClientRect()
    const value = document
      .querySelector('.timer-dial-value')
      ?.getBoundingClientRect()
    const display = document
      .querySelector('[data-timer-region="display"]')
      ?.getBoundingClientRect()
    const controls = document
      .querySelector('[data-timer-region="controls"]')
      ?.getBoundingClientRect()

    return dial && value && display && controls
      ? {
          dial: { left: dial.left, right: dial.right },
          value: { left: value.left, right: value.right },
          displayWidth: display.width,
          controlsWidth: controls.width,
        }
      : null
  })

  expect(timerBounds).not.toBeNull()
  expect(timerBounds?.value.left).toBeGreaterThanOrEqual(
    timerBounds?.dial.left ?? 0
  )
  expect(timerBounds?.value.right).toBeLessThanOrEqual(
    timerBounds?.dial.right ?? 0
  )
  expect(
    (timerBounds?.displayWidth ?? 0) /
      ((timerBounds?.displayWidth ?? 0) + (timerBounds?.controlsWidth ?? 1))
  ).toBeCloseTo(0.382, 2)
})

test('switches and restores the CorpIT color theme', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/ja')

  const root = page.locator('html')
  const switcher = page.locator('[data-color-theme-control]')
  await expect(root).toHaveAttribute('data-color-theme', 'minimal')
  await expect(switcher).toHaveAccessibleName(
    'カラーテーマ：モノクロ。CorpITに変更'
  )

  await switcher.click()
  await expect(root).toHaveAttribute('data-color-theme', 'corpit')
  await expect(switcher).toHaveAccessibleName(
    'カラーテーマ：CorpIT。モノクロに変更'
  )
  expect(
    await page.evaluate(() => localStorage.getItem('clock-app:color-theme'))
  ).toBe('corpit')

  await page.reload()
  await expect(root).toHaveAttribute('data-color-theme', 'corpit')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: /カラーテーマ/ })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(root).toHaveAttribute('data-color-theme', 'minimal')
  expect(errors).toEqual([])
})

test('keeps the CorpIT stopwatch state indicator above 3:1 contrast', async ({
  page,
}) => {
  await page.goto('/ja/stopwatch')
  await page.locator('[data-color-theme-control]').click()
  await page.getByRole('button', { name: '開始' }).click()

  const measureContrast = () =>
    page.locator('[data-stopwatch-dial]').evaluate((dial) => {
      const parseColor = (value: string): [number, number, number, number] => {
        const parts = value.match(/[\d.]+/g)?.map(Number) ?? []
        return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1]
      }
      const composite = (
        foreground: [number, number, number, number],
        background: [number, number, number, number]
      ): [number, number, number, number] => {
        const alpha = foreground[3]
        return [
          foreground[0] * alpha + background[0] * (1 - alpha),
          foreground[1] * alpha + background[1] * (1 - alpha),
          foreground[2] * alpha + background[2] * (1 - alpha),
          1,
        ]
      }
      const luminance = (color: [number, number, number, number]) => {
        const channels = color.slice(0, 3).map((channel) => {
          const normalized = channel / 255
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4
        })
        return (
          (channels[0] ?? 0) * 0.2126 +
          (channels[1] ?? 0) * 0.7152 +
          (channels[2] ?? 0) * 0.0722
        )
      }

      const rootBackground = parseColor(
        getComputedStyle(document.querySelector('main') ?? document.body)
          .backgroundColor
      )
      const panel = dial.closest('[data-layout]')
      const panelBackground = panel
        ? composite(
            parseColor(getComputedStyle(panel).backgroundColor),
            rootBackground
          )
        : rootBackground
      const dialStyle = getComputedStyle(dial)
      const background = composite(
        parseColor(dialStyle.backgroundColor),
        panelBackground
      )
      const border = parseColor(dialStyle.borderTopColor)
      const values = [luminance(background), luminance(border)].sort(
        (left, right) => right - left
      )
      return ((values[0] ?? 0) + 0.05) / ((values[1] ?? 0) + 0.05)
    })

  const darkContrast = await measureContrast()
  expect(darkContrast).toBeGreaterThanOrEqual(3)

  await page.evaluate(() => document.documentElement.classList.add('light'))
  await page.waitForTimeout(300)
  const lightContrast = await measureContrast()
  expect(lightContrast).toBeGreaterThanOrEqual(3)
})
