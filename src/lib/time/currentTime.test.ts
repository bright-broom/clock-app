import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetCurrentTimeStore, useCurrentTime } from './currentTime'

describe('useCurrentTime', () => {
  const start = new Date('2024-01-15T01:30:45.250Z')

  beforeEach(() => {
    __resetCurrentTimeStore()
    vi.useFakeTimers()
    vi.setSystemTime(start)
  })

  afterEach(() => {
    __resetCurrentTimeStore()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns the current wall-clock time after subscribing', () => {
    const { result } = renderHook(() => useCurrentTime())

    expect(result.current?.getTime()).toBe(start.getTime())
  })

  it('aligns updates to the next second boundary', () => {
    const { result } = renderHook(() => useCurrentTime())

    act(() => vi.advanceTimersByTime(749))
    expect(result.current?.getMilliseconds()).toBe(250)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current?.toISOString()).toBe('2024-01-15T01:30:46.000Z')
  })

  it('shares one snapshot across subscribers', () => {
    const first = renderHook(() => useCurrentTime())
    const second = renderHook(() => useCurrentTime())

    expect(first.result.current).toBe(second.result.current)

    act(() => vi.advanceTimersByTime(750))

    expect(first.result.current).toBe(second.result.current)
  })

  it('stops ticking after the last subscriber unmounts', () => {
    const first = renderHook(() => useCurrentTime())
    const second = renderHook(() => useCurrentTime())

    first.unmount()
    expect(vi.getTimerCount()).toBe(1)

    second.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('pauses while hidden and catches up immediately when visible', () => {
    let visibilityState: DocumentVisibilityState = 'visible'
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
      () => visibilityState
    )
    const { result } = renderHook(() => useCurrentTime())

    visibilityState = 'hidden'
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(vi.getTimerCount()).toBe(0)

    vi.setSystemTime(new Date(start.getTime() + 30_000))
    visibilityState = 'visible'
    act(() => document.dispatchEvent(new Event('visibilitychange')))

    expect(result.current?.getTime()).toBe(start.getTime() + 30_000)
    expect(vi.getTimerCount()).toBe(1)
  })
})
