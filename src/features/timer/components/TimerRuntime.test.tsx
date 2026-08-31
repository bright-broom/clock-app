import { act, render, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetTimerStore, useTimer } from '../model/useTimer'
import { __resetTimerAlarmStore } from '../model/useTimerAlarm'

const coordinator = vi.hoisted(() => ({
  request: vi.fn(() => Promise.resolve('played' as const)),
}))

vi.mock('../model/timerAlarmCoordinator', () => ({
  requestTimerCompletionAlarm: coordinator.request,
}))

import { TimerRuntime } from './TimerRuntime'

const NOW = new Date('2024-01-15T01:30:45.000Z').getTime()

describe('TimerRuntime', () => {
  beforeEach(() => {
    __resetTimerStore()
    __resetTimerAlarmStore()
    window.localStorage.clear()
    coordinator.request.mockClear()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    __resetTimerStore()
    __resetTimerAlarmStore()
    window.localStorage.clear()
    vi.useRealTimers()
  })

  it('keeps a countdown alive after the timer screen unmounts', async () => {
    render(<TimerRuntime />)
    const timerScreen = renderHook(() => useTimer())

    act(() => {
      timerScreen.result.current.actions.setDuration(1000)
      timerScreen.result.current.actions.start()
    })
    timerScreen.unmount()

    await act(async () => {
      vi.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    expect(coordinator.request).toHaveBeenCalledWith(`v1:${NOW + 1000}`)
    expect(renderHook(() => useTimer()).result.current.state.status).toBe(
      'completed'
    )
  })

  it('does not replay an already completed persisted timer on mount', async () => {
    window.localStorage.setItem(
      'clock-app:timer:v2',
      JSON.stringify({
        version: 2,
        updatedAt: NOW,
        sourceId: 'prior-tab',
        timer: {
          status: 'completed',
          durationMs: 1000,
          endsAt: null,
        },
      })
    )

    render(<TimerRuntime />)
    await act(async () => Promise.resolve())

    expect(coordinator.request).not.toHaveBeenCalled()
  })
})
