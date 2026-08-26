import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetCurrentTimeStore } from '@/lib/time/currentTime'
import { IntlWrapper } from '@/test'

import { Clock } from './Clock'

vi.mock('@/lib/time/browserTimeZone', () => ({
  getBrowserTimeZone: () => 'Asia/Tokyo',
}))

describe('Clock', () => {
  const fixedInstant = new Date('2024-01-15T01:30:45.000Z')

  beforeEach(() => {
    __resetCurrentTimeStore()
    vi.useFakeTimers()
    vi.setSystemTime(fixedInstant)
  })

  afterEach(() => {
    __resetCurrentTimeStore()
    vi.useRealTimers()
  })

  describe('Japanese locale', () => {
    it('renders the current time', () => {
      render(
        <IntlWrapper locale="ja">
          <Clock />
        </IntlWrapper>
      )

      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
      expect(screen.getByText('45')).toBeInTheDocument()
    })

    it('renders the current date in Japanese format', () => {
      render(
        <IntlWrapper locale="ja">
          <Clock />
        </IntlWrapper>
      )

      const expectedDate = new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }).format(fixedInstant)

      expect(screen.getByText(expectedDate)).toBeInTheDocument()
    })

    it('has accessible labels in Japanese', () => {
      render(
        <IntlWrapper locale="ja">
          <Clock />
        </IntlWrapper>
      )

      const timer = screen.getByRole('timer')
      expect(timer).toHaveAttribute('aria-label', '現在時刻 10時30分45秒')
    })
  })

  describe('English locale', () => {
    it('renders the current date in English format', () => {
      render(
        <IntlWrapper locale="en">
          <Clock />
        </IntlWrapper>
      )

      expect(screen.getByText('Mon, January 15, 2024')).toBeInTheDocument()
    })

    it('has accessible labels in English', () => {
      render(
        <IntlWrapper locale="en">
          <Clock />
        </IntlWrapper>
      )

      const timer = screen.getByRole('timer')
      expect(timer).toHaveAttribute(
        'aria-label',
        'Current time: 10 hours 30 minutes 45 seconds'
      )
    })
  })

  it('updates time when second changes', () => {
    render(
      <IntlWrapper locale="ja">
        <Clock />
      </IntlWrapper>
    )

    expect(screen.getByText('45')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('46')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <IntlWrapper locale="ja">
        <Clock />
      </IntlWrapper>
    )

    expect(screen.getByRole('timer')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
