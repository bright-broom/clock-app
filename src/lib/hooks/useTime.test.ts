import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetTimeStore, useTime } from './useTime'

describe('useTime', () => {
  beforeEach(() => {
    __resetTimeStore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 15, 10, 30, 45, 0))
  })

  afterEach(() => {
    __resetTimeStore()
    vi.useRealTimers()
  })

  it('returns time data on client', () => {
    const { result } = renderHook(() => useTime())

    expect(result.current).toMatchObject({
      hours: '10',
      minutes: '30',
      seconds: '45',
    })
    expect(result.current?.rawDate).toBeInstanceOf(Date)
  })

  it('updates when second changes', () => {
    const { result } = renderHook(() => useTime())

    expect(result.current?.seconds).toBe('45')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current?.seconds).toBe('46')
  })

  it('pads single digit values', () => {
    __resetTimeStore()
    vi.setSystemTime(new Date(2024, 0, 1, 5, 5, 5))
    const { result } = renderHook(() => useTime())

    expect(result.current?.hours).toBe('05')
    expect(result.current?.minutes).toBe('05')
    expect(result.current?.seconds).toBe('05')
  })

  it('provides raw Date object for locale-specific formatting', () => {
    const { result } = renderHook(() => useTime())

    expect(result.current?.rawDate.getFullYear()).toBe(2024)
    expect(result.current?.rawDate.getMonth()).toBe(0)
    expect(result.current?.rawDate.getDate()).toBe(15)
  })

  it('shares state between multiple hooks', () => {
    const { result: result1 } = renderHook(() => useTime())
    const { result: result2 } = renderHook(() => useTime())

    expect(result1.current?.hours).toEqual(result2.current?.hours)
    expect(result1.current?.minutes).toEqual(result2.current?.minutes)
    expect(result1.current?.seconds).toEqual(result2.current?.seconds)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result1.current?.seconds).toBe('46')
    expect(result2.current?.seconds).toBe('46')
  })
})
