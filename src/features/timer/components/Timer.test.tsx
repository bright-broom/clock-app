import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { IntlWrapper } from '@/test'

import { __resetTimerStore } from '../model/useTimer'

import { Timer } from './Timer'

describe('Timer', () => {
  beforeEach(() => {
    __resetTimerStore()
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T01:30:45.000Z'))
  })

  afterEach(() => {
    __resetTimerStore()
    window.localStorage.clear()
    vi.useRealTimers()
  })

  function renderTimer() {
    return render(
      <IntlWrapper locale="ja">
        <Timer />
      </IntlWrapper>
    )
  }

  it('renders the default duration and accessible controls', () => {
    renderTimer()

    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      '残り 00 時間 05 分 00 秒'
    )
    expect(screen.getByRole('button', { name: '開始' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'リセット' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: '完了音：オン' })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies a preset and counts down without drift', () => {
    renderTimer()
    fireEvent.click(screen.getByRole('button', { name: '1 分' }))
    fireEvent.click(screen.getByRole('button', { name: '開始' }))

    act(() => vi.advanceTimersByTime(1000))

    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      '残り 00 時間 00 分 59 秒'
    )
    expect(screen.getByRole('button', { name: '一時停止' })).toBeEnabled()
  })

  it('accepts direct numeric input and clamps each duration field', () => {
    renderTimer()
    const hours = screen.getByLabelText('時')
    const minutes = screen.getByLabelText('分')
    const seconds = screen.getByLabelText('秒')

    expect(hours).toHaveAttribute('inputmode', 'numeric')
    fireEvent.change(hours, { target: { value: '2' } })
    fireEvent.change(minutes, { target: { value: '30' } })
    fireEvent.change(seconds, { target: { value: '15' } })

    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      '残り 02 時間 30 分 15 秒'
    )

    fireEvent.change(minutes, { target: { value: '99' } })
    expect(minutes).toHaveValue(59)
    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      '残り 02 時間 59 分 15 秒'
    )
  })

  it('provides large step controls and keeps presets available', () => {
    renderTimer()

    expect(screen.getByRole('button', { name: '5 分' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: '分を増やす' }))
    expect(screen.getByLabelText('分')).toHaveValue(6)

    fireEvent.click(screen.getByRole('button', { name: '分を減らす' }))
    expect(screen.getByLabelText('分')).toHaveValue(5)

    fireEvent.click(screen.getByRole('button', { name: '10 分' }))
    expect(screen.getByLabelText('分')).toHaveValue(10)
    expect(screen.getByRole('button', { name: '10 分' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('disables direct and step input while running', () => {
    renderTimer()
    fireEvent.click(screen.getByRole('button', { name: '開始' }))

    expect(screen.getByLabelText('分')).toBeDisabled()
    expect(screen.getByRole('button', { name: '分を増やす' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '10 分' })).toBeDisabled()
  })

  it('pauses, resumes, and resets', () => {
    renderTimer()
    fireEvent.click(screen.getByRole('button', { name: '開始' }))
    act(() => vi.advanceTimersByTime(1000))
    fireEvent.click(screen.getByRole('button', { name: '一時停止' }))

    const pausedLabel = screen.getByRole('timer').getAttribute('aria-label')
    act(() => vi.advanceTimersByTime(10_000))
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', pausedLabel)

    fireEvent.click(screen.getByRole('button', { name: '再開' }))
    expect(screen.getByRole('button', { name: '一時停止' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'リセット' }))
    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      '残り 00 時間 05 分 00 秒'
    )
  })

  it('announces completion without making every second live', () => {
    renderTimer()
    fireEvent.change(screen.getByLabelText('分'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('秒'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: '開始' }))

    act(() => vi.advanceTimersByTime(1000))

    expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'off')
    expect(screen.getAllByText('タイマーが終了しました')).toHaveLength(2)
  })

  it('supports keyboard operation outside form controls', () => {
    renderTimer()

    fireEvent.keyDown(document, { code: 'Space' })
    expect(screen.getByRole('button', { name: '一時停止' })).toBeEnabled()

    fireEvent.keyDown(document, { key: 'r' })
    expect(screen.getByRole('button', { name: 'リセット' })).toBeDisabled()
  })

  it('does not intercept shortcuts while editing the duration', () => {
    renderTimer()
    const seconds = screen.getByLabelText('秒')

    fireEvent.keyDown(seconds, { code: 'Space' })

    expect(screen.getByRole('button', { name: '開始' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: '一時停止' })).toBeNull()
  })

  it('does not intercept Space while a link is focused', () => {
    render(
      <IntlWrapper locale="ja">
        <a href="https://example.com">外部リンク</a>
        <Timer />
      </IntlWrapper>
    )
    const link = screen.getByRole('link', { name: '外部リンク' })
    link.focus()

    fireEvent.keyDown(link, { code: 'Space' })

    expect(screen.getByRole('button', { name: '開始' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: '一時停止' })).toBeNull()
  })

  it('does not intercept modified shortcuts', () => {
    renderTimer()

    fireEvent.keyDown(document, { code: 'Space', metaKey: true })

    expect(screen.getByRole('button', { name: '開始' })).toBeEnabled()
  })
})
