import { describe, expect, it } from 'vitest'

import {
  createStopwatchState,
  nextStopwatchTickDelay,
  stopwatchReducer,
  toStopwatchParts,
} from './stopwatchMachine'

const NOW = 1_700_000_000_000

describe('stopwatchReducer', () => {
  it('starts, advances without tick-count drift, and pauses precisely', () => {
    let state = stopwatchReducer(createStopwatchState(), {
      type: 'start',
      now: NOW,
    })

    state = stopwatchReducer(state, { type: 'sync', now: NOW + 437 })
    state = stopwatchReducer(state, { type: 'sync', now: NOW + 1_618 })
    state = stopwatchReducer(state, { type: 'pause', now: NOW + 2_345 })

    expect(state).toEqual({
      status: 'paused',
      elapsedMs: 2_345,
      startedAt: null,
    })
  })

  it('resumes from the captured elapsed time', () => {
    let state = stopwatchReducer(createStopwatchState(), {
      type: 'start',
      now: NOW,
    })
    state = stopwatchReducer(state, { type: 'pause', now: NOW + 1_500 })
    state = stopwatchReducer(state, { type: 'start', now: NOW + 10_000 })
    state = stopwatchReducer(state, { type: 'sync', now: NOW + 10_750 })

    expect(state.elapsedMs).toBe(2_250)
    expect(state.status).toBe('running')
  })

  it('never subtracts elapsed time when the system clock moves backward', () => {
    let state = stopwatchReducer(createStopwatchState(), {
      type: 'start',
      now: NOW,
    })
    state = stopwatchReducer(state, { type: 'sync', now: NOW + 1_000 })
    state = stopwatchReducer(state, { type: 'sync', now: NOW - 10_000 })
    state = stopwatchReducer(state, { type: 'sync', now: NOW - 9_500 })

    expect(state.elapsedMs).toBe(1_500)
  })

  it('rejects invalid instants and keeps no-op snapshots stable', () => {
    const idle = createStopwatchState()

    expect(stopwatchReducer(idle, { type: 'start', now: Number.NaN })).toBe(
      idle
    )
    expect(stopwatchReducer(idle, { type: 'pause', now: NOW })).toBe(idle)
    expect(stopwatchReducer(idle, { type: 'reset' })).toBe(idle)
  })

  it('resets every active state to a fresh stopwatch', () => {
    const running = stopwatchReducer(createStopwatchState(), {
      type: 'start',
      now: NOW,
    })

    expect(stopwatchReducer(running, { type: 'reset' })).toEqual(
      createStopwatchState()
    )
  })
})

describe('stopwatch formatting and scheduling', () => {
  it('formats elapsed time with tenths and unbounded hours', () => {
    expect(toStopwatchParts(0)).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
      tenths: '0',
    })
    expect(toStopwatchParts(3_661_987)).toEqual({
      hours: '01',
      minutes: '01',
      seconds: '01',
      tenths: '9',
    })
    expect(toStopwatchParts(100 * 60 * 60 * 1000)).toMatchObject({
      hours: '100',
    })
  })

  it('aligns refreshes to the next tenth boundary', () => {
    expect(nextStopwatchTickDelay(0)).toBe(100)
    expect(nextStopwatchTickDelay(437)).toBe(63)
    expect(nextStopwatchTickDelay(500)).toBe(100)
    expect(nextStopwatchTickDelay(Number.NaN)).toBe(100)
  })
})
