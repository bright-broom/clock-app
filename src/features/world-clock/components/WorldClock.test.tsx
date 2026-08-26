import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetCurrentTimeStore } from '@/lib/time/currentTime'
import { IntlWrapper } from '@/test'

import { CityTimeCard } from './CityTimeCard'
import { WorldClockList } from './WorldClockList'

describe('world clock components', () => {
  beforeEach(() => {
    __resetCurrentTimeStore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T01:30:45.000Z'))
  })

  afterEach(() => {
    __resetCurrentTimeStore()
    vi.useRealTimers()
  })

  it('renders all city links from the shared time-zone catalog', () => {
    render(
      <IntlWrapper locale="ja">
        <WorldClockList locale="ja" />
      </IntlWrapper>
    )

    expect(screen.getByRole('link', { name: /東京/ })).toHaveAttribute(
      'href',
      '/ja/time-in/tokyo'
    )
    expect(screen.getAllByRole('timer')).toHaveLength(10)
    expect(screen.getByText('10:30:45')).toBeInTheDocument()
  })

  it('updates every city from the same second-aligned clock', () => {
    render(
      <IntlWrapper locale="ja">
        <WorldClockList locale="ja" />
      </IntlWrapper>
    )

    act(() => vi.advanceTimersByTime(1000))

    expect(screen.getByText('10:30:46')).toBeInTheDocument()
  })

  it('renders a city time and long-form date', () => {
    render(
      <IntlWrapper locale="en">
        <CityTimeCard locale="en" timeZone="America/New_York" />
      </IntlWrapper>
    )

    expect(screen.getByRole('timer')).toHaveTextContent('20:30:45')
    expect(screen.getByText('Sunday, January 14, 2024')).toBeInTheDocument()
  })
})
