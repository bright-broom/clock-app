import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetStopwatchStore, useStopwatch } from './useStopwatch'

const NOW = new Date(2024, 0, 15, 10, 0, 0, 0).getTime()

function startStopwatch() {
  const view = renderHook(() => useStopwatch())
  act(() => view.result.current.actions.start())
  return view
}

describe('useStopwatch', () => {
  beforeEach(() => {
    __resetStopwatchStore()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    __resetStopwatchStore()
    vi.useRealTimers()
  })

  it('starts idle and keeps stable action identity', () => {
    const { result, rerender } = renderHook(() => useStopwatch())
    const actions = result.current.actions

    expect(result.current.state).toEqual({
      status: 'idle',
      elapsedMs: 0,
      startedAt: null,
    })

    rerender()
    expect(result.current.actions).toBe(actions)
  })

  it('measures from a monotonic clock and pauses without drift', () => {
    const { result } = startStopwatch()

    act(() => vi.advanceTimersByTime(1_250))
    expect(result.current.state.elapsedMs).toBe(1_200)

    act(() => result.current.actions.pause())
    expect(result.current.state).toMatchObject({
      status: 'paused',
      elapsedMs: 1_250,
      startedAt: null,
    })

    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.state.elapsedMs).toBe(1_250)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('resumes and resets the same shared stopwatch', () => {
    const first = startStopwatch()
    const second = renderHook(() => useStopwatch())

    act(() => vi.advanceTimersByTime(500))
    act(() => first.result.current.actions.pause())
    act(() => second.result.current.actions.start())
    act(() => vi.advanceTimersByTime(500))

    expect(first.result.current.state.elapsedMs).toBe(1_000)
    expect(second.result.current.state).toBe(first.result.current.state)

    act(() => second.result.current.actions.reset())
    expect(first.result.current.state.status).toBe('idle')
    expect(first.result.current.state.elapsedMs).toBe(0)
  })

  it('stops background ticks and catches up when visible again', () => {
    const { result } = startStopwatch()
    const visibility = vi.spyOn(document, 'visibilityState', 'get')

    visibility.mockReturnValue('hidden')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(vi.getTimerCount()).toBe(0)

    vi.advanceTimersByTime(30_000)
    visibility.mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))

    expect(result.current.state.elapsedMs).toBe(30_000)
    visibility.mockRestore()
  })

  it('survives a route unmount and catches up on remount', () => {
    const view = startStopwatch()
    view.unmount()

    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(15_000)

    const remounted = renderHook(() => useStopwatch())
    expect(remounted.result.current.state).toMatchObject({
      status: 'running',
      elapsedMs: 15_000,
    })
  })

  it('ignores forward and backward system-clock adjustments', () => {
    const { result } = startStopwatch()

    act(() => {
      vi.setSystemTime(NOW + 60 * 60 * 1000)
      window.dispatchEvent(new Event('focus'))
    })
    expect(result.current.state.elapsedMs).toBe(0)

    act(() => vi.advanceTimersByTime(500))
    act(() => {
      vi.setSystemTime(NOW - 60 * 60 * 1000)
      window.dispatchEvent(new Event('focus'))
    })
    expect(result.current.state.elapsedMs).toBe(500)
  })
})
