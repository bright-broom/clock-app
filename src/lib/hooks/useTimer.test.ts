import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetTimerStore, useTimer } from './useTimer'

const NOW = new Date(2024, 0, 15, 10, 0, 0, 0).getTime()
const STORAGE_KEY = 'clock-app:timer:v1'

/**
 * Pending timers owned by the countdown loop. jsdom queues a task per
 * localStorage write to dispatch its `storage` event, so those are flushed
 * first to leave only the tick timeout in the count. A real leaked tick is
 * still counted: it is scheduled a full second out, or - in a runaway
 * reschedule loop - immediately queues its replacement.
 */
function pendingTickCount(): number {
  act(() => {
    vi.advanceTimersByTime(1)
  })

  return vi.getTimerCount()
}

function setupRunningTimer(durationMs: number) {
  const view = renderHook(() => useTimer())

  act(() => {
    view.result.current.actions.setDuration(durationMs)
  })
  act(() => {
    view.result.current.actions.start()
  })

  return view
}

describe('useTimer', () => {
  beforeEach(() => {
    __resetTimerStore()
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    __resetTimerStore()
    window.localStorage.clear()
    vi.useRealTimers()
  })

  it('starts idle with the default duration', () => {
    const { result } = renderHook(() => useTimer())

    expect(result.current.state).toEqual({
      status: 'idle',
      durationMs: 5 * 60 * 1000,
      endsAt: null,
      remainingMs: 5 * 60 * 1000,
    })
  })

  it('counts down once started', () => {
    const { result } = setupRunningTimer(10_000)

    expect(result.current.state.status).toBe('running')
    expect(result.current.state.remainingMs).toBe(10_000)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.state.remainingMs).toBe(9000)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.state.remainingMs).toBe(6000)
  })

  it('does not drift over an hour of ticking', () => {
    const { result } = setupRunningTimer(60 * 60 * 1000)

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000 - 1000)
    })

    expect(result.current.state.remainingMs).toBe(1000)
    expect(result.current.state.status).toBe('running')
  })

  it('realigns ticks to the remainder after resuming mid-second', () => {
    const { result } = setupRunningTimer(60_000)

    act(() => {
      vi.advanceTimersByTime(18_437)
    })
    act(() => {
      result.current.actions.pause()
    })

    expect(result.current.state).toMatchObject({
      status: 'paused',
      endsAt: null,
      remainingMs: 41_563,
    })

    act(() => {
      result.current.actions.start()
    })
    // The next tick lands on the aligned second, not a full second later.
    act(() => {
      vi.advanceTimersByTime(563)
    })

    expect(result.current.state.remainingMs).toBe(41_000)
  })

  it('stops ticking while paused', () => {
    const { result } = setupRunningTimer(60_000)

    act(() => {
      result.current.actions.pause()
    })

    expect(pendingTickCount()).toBe(0)

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(result.current.state.remainingMs).toBe(60_000)
  })

  it('completes when the deadline is reached', () => {
    const { result } = setupRunningTimer(3000)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.state).toMatchObject({
      status: 'completed',
      remainingMs: 0,
      endsAt: null,
    })
    expect(pendingTickCount()).toBe(0)
  })

  it('resets to the configured duration', () => {
    const { result } = setupRunningTimer(60_000)

    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    act(() => {
      result.current.actions.reset()
    })

    expect(result.current.state).toMatchObject({
      status: 'idle',
      durationMs: 60_000,
      remainingMs: 60_000,
    })
    expect(pendingTickCount()).toBe(0)
  })

  it('shares one countdown between subscribers', () => {
    const { result: first } = setupRunningTimer(60_000)
    const { result: second } = renderHook(() => useTimer())

    expect(second.current.state).toBe(first.current.state)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(first.current.state.remainingMs).toBe(59_000)
    expect(second.current.state.remainingMs).toBe(59_000)
  })

  it('keeps action identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useTimer())
    const actions = result.current.actions

    rerender()

    expect(result.current.actions).toBe(actions)
  })

  describe('catching up on throttled time', () => {
    it('re-syncs on visibilitychange without waiting for a tick', () => {
      const { result } = setupRunningTimer(60_000)

      // Frozen background tab: the clock advances but no timeout fires.
      act(() => {
        vi.setSystemTime(NOW + 45_000)
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(result.current.state.remainingMs).toBe(15_000)
    })

    it('completes on refocus when the deadline passed while hidden', () => {
      const { result } = setupRunningTimer(60_000)

      act(() => {
        vi.setSystemTime(NOW + 5 * 60 * 1000)
        window.dispatchEvent(new Event('focus'))
      })

      expect(result.current.state).toMatchObject({
        status: 'completed',
        remainingMs: 0,
      })
    })

    it('skips re-syncing while the document is hidden', () => {
      const { result } = setupRunningTimer(60_000)
      const visibility = vi
        .spyOn(document, 'visibilityState', 'get')
        .mockReturnValue('hidden')

      act(() => {
        vi.setSystemTime(NOW + 45_000)
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(result.current.state.remainingMs).toBe(60_000)

      visibility.mockRestore()
    })

    it('survives unmounting and catches up on remount', () => {
      const view = setupRunningTimer(60_000)

      view.unmount()

      expect(pendingTickCount()).toBe(0)

      vi.setSystemTime(NOW + 30_000)
      const { result } = renderHook(() => useTimer())

      expect(result.current.state).toMatchObject({
        status: 'running',
        remainingMs: 30_000,
      })
    })
  })

  describe('persistence', () => {
    it('writes the deadline when a countdown starts', () => {
      setupRunningTimer(60_000)

      expect(
        JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
      ).toEqual({
        status: 'running',
        durationMs: 60_000,
        endsAt: NOW + 60_000,
      })
    })

    it('does not write on every tick', () => {
      const setItem = vi.spyOn(window.localStorage, 'setItem')

      setupRunningTimer(60_000)
      const writesAfterStart = setItem.mock.calls.length

      act(() => {
        vi.advanceTimersByTime(10_000)
      })

      expect(setItem.mock.calls.length).toBe(writesAfterStart)

      setItem.mockRestore()
    })

    it('restores a running countdown on mount', () => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: 'running',
          durationMs: 60_000,
          endsAt: NOW + 25_000,
        })
      )

      const { result } = renderHook(() => useTimer())

      expect(result.current.state).toMatchObject({
        status: 'running',
        durationMs: 60_000,
        remainingMs: 25_000,
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.state.remainingMs).toBe(24_000)
    })

    it('restores as completed when the deadline passed while away', () => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: 'running',
          durationMs: 60_000,
          endsAt: NOW - 1000,
        })
      )

      const { result } = renderHook(() => useTimer())

      expect(result.current.state).toMatchObject({
        status: 'completed',
        remainingMs: 0,
      })
    })

    it('falls back to a fresh timer on unusable storage', () => {
      window.localStorage.setItem(STORAGE_KEY, '{not json')

      const { result } = renderHook(() => useTimer())

      expect(result.current.state.status).toBe('idle')
    })

    it('falls back to a fresh timer when storage throws', () => {
      const getItem = vi
        .spyOn(window.localStorage, 'getItem')
        .mockImplementation(() => {
          throw new Error('storage disabled')
        })

      const { result } = renderHook(() => useTimer())

      expect(result.current.state.status).toBe('idle')

      getItem.mockRestore()
    })

    it('keeps running when persisting fails', () => {
      const setItem = vi
        .spyOn(window.localStorage, 'setItem')
        .mockImplementation(() => {
          throw new Error('quota exceeded')
        })

      const { result } = setupRunningTimer(10_000)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.state.remainingMs).toBe(9000)

      setItem.mockRestore()
    })
  })
})
