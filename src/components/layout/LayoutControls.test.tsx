import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { IntlWrapper } from '@/test'

import { HomeUtilityMenu } from './HomeUtilityMenu'

const navigation = vi.hoisted(() => ({
  pathname: '/ja',
  push: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}))

describe('HomeUtilityMenu', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.dataset.colorTheme = 'minimal'
  })

  it('exposes its expanded state and focuses the first tool', () => {
    render(
      <IntlWrapper locale="ja">
        <HomeUtilityMenu />
      </IntlWrapper>
    )

    const trigger = screen.getByRole('button', { name: 'メニューを開く' })
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'タイマー' })).toHaveFocus()
    expect(screen.getByRole('link', { name: 'タイマー' })).toHaveAttribute(
      'href',
      '/ja/timer'
    )
    expect(
      screen.getByRole('link', { name: 'ストップウォッチ' })
    ).toHaveAttribute('href', '/ja/stopwatch')
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
      screen.queryByRole('link', { name: 'タイマー' })
    ).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('keeps the language and tools popovers mutually exclusive', () => {
    render(
      <IntlWrapper locale="ja">
        <HomeUtilityMenu />
      </IntlWrapper>
    )

    fireEvent.click(screen.getByRole('button', { name: '言語: 日本語' }))
    expect(screen.getAllByRole('option')).toHaveLength(7)
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))

    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '世界時計' })).toBeInTheDocument()
  })

  it('supports listbox keyboard navigation and locale selection', () => {
    navigation.push.mockClear()
    render(
      <IntlWrapper locale="ja">
        <HomeUtilityMenu />
      </IntlWrapper>
    )

    fireEvent.keyDown(screen.getByRole('button', { name: '言語: 日本語' }), {
      key: 'ArrowDown',
    })
    expect(screen.getAllByRole('option')).toHaveLength(7)
    expect(screen.getByRole('option', { name: '日本語 ja' })).toHaveFocus()

    fireEvent.keyDown(screen.getByRole('listbox', { name: '言語' }), {
      key: 'ArrowDown',
    })
    expect(screen.getByRole('option', { name: '英語 en' })).toHaveFocus()

    fireEvent.click(screen.getByRole('option', { name: '英語 en' }))

    expect(navigation.push).toHaveBeenCalledWith('/en')
  })

  it('changes and persists the global color theme', () => {
    render(
      <IntlWrapper locale="ja">
        <HomeUtilityMenu />
      </IntlWrapper>
    )

    const switcher = screen.getByRole('button', {
      name: 'カラーテーマ：モノクロ。CorpITに変更',
    })
    fireEvent.click(switcher)

    expect(document.documentElement.dataset.colorTheme).toBe('corpit')
    expect(window.localStorage.getItem('clock-app:color-theme')).toBe('corpit')
    expect(switcher).toHaveAccessibleName(
      'カラーテーマ：CorpIT。モノクロに変更'
    )
  })
})
