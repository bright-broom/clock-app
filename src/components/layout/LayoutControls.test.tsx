import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { IntlWrapper } from '@/test'

import { HomeUtilityMenu } from './HomeUtilityMenu'
import { LanguageSwitcher } from './LanguageSwitcher'

const navigation = vi.hoisted(() => ({
  pathname: '/ja',
  push: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}))

describe('HomeUtilityMenu', () => {
  it('exposes its expanded state and focuses the first tool', () => {
    render(
      <IntlWrapper locale="ja">
        <HomeUtilityMenu />
      </IntlWrapper>
    )

    const trigger = screen.getByRole('button', { name: 'メニューを開く' })
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: '世界時計' })).toHaveFocus()
  })

  it('closes on Escape and restores focus to the trigger', () => {
    render(
      <IntlWrapper locale="ja">
        <HomeUtilityMenu />
      </IntlWrapper>
    )

    const trigger = screen.getByRole('button', { name: 'メニューを開く' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(
      screen.queryByRole('link', { name: '世界時計' })
    ).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('omits duplicate tool navigation on the home screen', () => {
    render(
      <IntlWrapper locale="ja">
        <HomeUtilityMenu showTools={false} />
      </IntlWrapper>
    )

    expect(
      screen.queryByRole('button', { name: 'メニューを開く' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '言語: 日本語' })
    ).toBeInTheDocument()
  })
})

describe('LanguageSwitcher', () => {
  it('offers every supported locale directly', () => {
    render(
      <IntlWrapper locale="ja">
        <LanguageSwitcher />
      </IntlWrapper>
    )

    fireEvent.click(screen.getByRole('button', { name: '言語: 日本語' }))

    expect(screen.getAllByRole('option')).toHaveLength(7)
    expect(screen.getByRole('option', { name: '日本語 ja' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('navigates directly to the selected locale', () => {
    navigation.push.mockClear()
    render(
      <IntlWrapper locale="ja">
        <LanguageSwitcher />
      </IntlWrapper>
    )

    fireEvent.click(screen.getByRole('button', { name: '言語: 日本語' }))
    fireEvent.click(screen.getByRole('option', { name: '英語 en' }))

    expect(navigation.push).toHaveBeenCalledWith('/en')
  })
})
