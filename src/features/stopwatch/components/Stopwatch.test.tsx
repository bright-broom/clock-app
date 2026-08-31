import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { IntlWrapper } from '@/test'

import { __resetStopwatchStore } from '../model/useStopwatch'

import { Stopwatch } from './Stopwatch'

describe('Stopwatch', () => {
  beforeEach(() => {
    __resetStopwatchStore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T01:30:45.000Z'))
  })

  afterEach(() => {
    __resetStopwatchStore()
    vi.useRealTimers()
  })

  function renderStopwatch() {
    return render(
      <IntlWrapper locale="ja">
        <Stopwatch />
      </IntlWrapper>
    )
  }

  it('renders an accessible zero state', () => {
    renderStopwatch()

    expect(screen.getByRole('timer')).toHaveTextContent('00:00:00.0')
    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      '経過時間 00 時間 00 分 00.0 秒'
    )
    expect(screen.getByRole('button', { name: '開始' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'リセット' })).toBeDisabled()
  })

  it('starts, pauses, resumes, and resets', () => {
    renderStopwatch()

    fireEvent.click(screen.getByRole('button', { name: '開始' }))
    act(() => vi.advanceTimersByTime(1_100))
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:01.1')

    fireEvent.click(screen.getByRole('button', { name: '一時停止' }))
    const pausedLabel = screen.getByRole('timer').getAttribute('aria-label')
    act(() => vi.advanceTimersByTime(5_000))
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', pausedLabel)

    fireEvent.click(screen.getByRole('button', { name: '再開' }))
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:01.6')

    fireEvent.click(screen.getByRole('button', { name: 'リセット' }))
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:00.0')
    expect(screen.getByRole('button', { name: 'リセット' })).toBeDisabled()
  })

  it('supports keyboard control without hijacking focused links', () => {
    render(
      <IntlWrapper locale="ja">
        <a href="https://example.com">外部リンク</a>
        <Stopwatch />
      </IntlWrapper>
    )

    const link = screen.getByRole('link', { name: '外部リンク' })
    link.focus()
    fireEvent.keyDown(link, { code: 'Space' })
    expect(screen.getByRole('button', { name: '開始' })).toBeEnabled()

    link.blur()
    fireEvent.keyDown(document, { code: 'Space' })
    expect(screen.getByRole('button', { name: '一時停止' })).toBeEnabled()

    fireEvent.keyDown(document, { key: 'r' })
    expect(screen.getByRole('button', { name: 'リセット' })).toBeDisabled()
  })
})
