import { describe, expect, it } from 'vitest'

import {
  clampDuration,
  createTimerState,
  MAX_DURATION_MS,
  nextTickDelay,
  parsePersistedTimer,
  timerReducer,
  toDisplaySeconds,
  toPersistedTimer,
  toTimerParts,
  type TimerState,
} from './timerMachine'

const NOW = 1_700_000_000_000
const ONE_HOUR = 60 * 60 * 1000

function running(durationMs: number, now = NOW): TimerState {
  return timerReducer(createTimerState(durationMs), { type: 'start', now })
}

describe('clampDuration', () => {
  it('rounds to whole seconds', () => {
    expect(clampDuration(4400)).toBe(4000)
    expect(clampDuration(4600)).toBe(5000)
  })

  it('allows zero so the picker can be cleared', () => {
    expect(clampDuration(0)).toBe(0)
    expect(clampDuration(-1000)).toBe(0)
  })

  it('rejects non-finite input', () => {
    expect(clampDuration(Number.NaN)).toBe(0)
    expect(clampDuration(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('caps at the maximum supported duration', () => {
    expect(clampDuration(MAX_DURATION_MS + 60_000)).toBe(MAX_DURATION_MS)
  })
})

describe('toDisplaySeconds', () => {
  it('rounds up so the first second is shown in full', () => {
    expect(toDisplaySeconds(5000)).toBe(5)
    expect(toDisplaySeconds(4999)).toBe(5)
    expect(toDisplaySeconds(4001)).toBe(5)
    expect(toDisplaySeconds(4000)).toBe(4)
  })

  it('reaches zero only at completion', () => {
    expect(toDisplaySeconds(1)).toBe(1)
    expect(toDisplaySeconds(0)).toBe(0)
    expect(toDisplaySeconds(-500)).toBe(0)
  })
})

describe('toTimerParts', () => {
  it('formats zero-padded hours, minutes and seconds', () => {
    expect(toTimerParts(0)).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
    })
    expect(toTimerParts(65_000)).toEqual({
      hours: '00',
      minutes: '01',
      seconds: '05',
    })
    expect(toTimerParts(ONE_HOUR)).toEqual({
      hours: '01',
      minutes: '00',
      seconds: '00',
    })
    expect(toTimerParts(MAX_DURATION_MS)).toEqual({
      hours: '24',
      minutes: '00',
      seconds: '00',
    })
  })
})

describe('nextTickDelay', () => {
  it('aligns to the remainder so ticks track endsAt', () => {
    expect(nextTickDelay(4320)).toBe(320)
    expect(nextTickDelay(1)).toBe(1)
  })

  it('uses a full second when already aligned', () => {
    expect(nextTickDelay(5000)).toBe(1000)
  })

  it('returns zero once the deadline has passed', () => {
    expect(nextTickDelay(0)).toBe(0)
    expect(nextTickDelay(-250)).toBe(0)
  })
})

describe('createTimerState', () => {
  it('defaults to fifteen minutes', () => {
    expect(createTimerState()).toEqual({
      status: 'idle',
      durationMs: 15 * 60 * 1000,
      endsAt: null,
      remainingMs: 15 * 60 * 1000,
    })
  })

  it('starts idle with remaining equal to the duration', () => {
    expect(createTimerState(60_000)).toEqual({
      status: 'idle',
      durationMs: 60_000,
      endsAt: null,
      remainingMs: 60_000,
    })
  })
})

describe('timerReducer: setDuration', () => {
  it('replaces the duration and remaining time while idle', () => {
    const next = timerReducer(createTimerState(60_000), {
      type: 'setDuration',
      ms: 90_000,
    })

    expect(next).toMatchObject({
      status: 'idle',
      durationMs: 90_000,
      remainingMs: 90_000,
    })
  })

  it('is ignored while running', () => {
    const state = running(60_000)
    const next = timerReducer(state, { type: 'setDuration', ms: 90_000 })

    expect(next).toBe(state)
  })

  it('returns to idle from paused', () => {
    const paused = timerReducer(running(60_000), {
      type: 'pause',
      now: NOW + 10_000,
    })
    const next = timerReducer(paused, { type: 'setDuration', ms: 30_000 })

    expect(next).toMatchObject({
      status: 'idle',
      durationMs: 30_000,
      remainingMs: 30_000,
    })
  })

  it('keeps the snapshot stable when nothing changes', () => {
    const state = createTimerState(60_000)

    expect(timerReducer(state, { type: 'setDuration', ms: 60_000 })).toBe(state)
  })
})

describe('timerReducer: start', () => {
  it('derives a deadline from the current instant', () => {
    expect(running(60_000)).toEqual({
      status: 'running',
      durationMs: 60_000,
      endsAt: NOW + 60_000,
      remainingMs: 60_000,
    })
  })

  it('is a no-op with no duration set', () => {
    const state = createTimerState(0)

    expect(timerReducer(state, { type: 'start', now: NOW })).toBe(state)
  })

  it('is idempotent while running', () => {
    const state = running(60_000)

    expect(timerReducer(state, { type: 'start', now: NOW + 5000 })).toBe(state)
  })

  it('resumes only the remainder from paused', () => {
    const paused = timerReducer(running(60_000), {
      type: 'pause',
      now: NOW + 18_500,
    })
    const resumed = timerReducer(paused, { type: 'start', now: NOW + 999_999 })

    expect(resumed).toMatchObject({
      status: 'running',
      endsAt: NOW + 999_999 + 41_500,
      remainingMs: 41_500,
    })
  })

  it('replays the full duration from completed', () => {
    const completed = timerReducer(running(60_000), {
      type: 'sync',
      now: NOW + 60_000,
    })
    const replayed = timerReducer(completed, {
      type: 'start',
      now: NOW + 70_000,
    })

    expect(replayed).toMatchObject({
      status: 'running',
      endsAt: NOW + 70_000 + 60_000,
      remainingMs: 60_000,
    })
  })
})

describe('timerReducer: pause', () => {
  it('captures the sub-second remainder so resuming stays precise', () => {
    const next = timerReducer(running(60_000), {
      type: 'pause',
      now: NOW + 18_437,
    })

    expect(next).toEqual({
      status: 'paused',
      durationMs: 60_000,
      endsAt: null,
      remainingMs: 41_563,
    })
  })

  it('completes when paused exactly at the deadline', () => {
    const next = timerReducer(running(60_000), {
      type: 'pause',
      now: NOW + 60_000,
    })

    expect(next).toMatchObject({ status: 'completed', remainingMs: 0 })
  })

  it('is a no-op when not running', () => {
    const state = createTimerState(60_000)

    expect(timerReducer(state, { type: 'pause', now: NOW })).toBe(state)
  })
})

describe('timerReducer: reset', () => {
  it('restores the configured duration', () => {
    const next = timerReducer(running(60_000), { type: 'reset' })

    expect(next).toEqual({
      status: 'idle',
      durationMs: 60_000,
      endsAt: null,
      remainingMs: 60_000,
    })
  })

  it('keeps the snapshot stable when already idle and untouched', () => {
    const state = createTimerState(60_000)

    expect(timerReducer(state, { type: 'reset' })).toBe(state)
  })
})

describe('timerReducer: sync', () => {
  it('does not drift over an hour of elapsed time', () => {
    const state = running(ONE_HOUR)
    const next = timerReducer(state, {
      type: 'sync',
      now: NOW + ONE_HOUR - 1000,
    })

    expect(next.remainingMs).toBe(1000)
    expect(next.endsAt).toBe(NOW + ONE_HOUR)
  })

  it('recomputes from endsAt regardless of how many syncs occurred', () => {
    let state = running(ONE_HOUR)

    for (let elapsed = 137; elapsed < ONE_HOUR; elapsed += 1137) {
      state = timerReducer(state, { type: 'sync', now: NOW + elapsed })
    }

    const final = timerReducer(state, {
      type: 'sync',
      now: NOW + ONE_HOUR - 5000,
    })

    expect(final.remainingMs).toBe(5000)
  })

  it('keeps the snapshot stable within the same displayed second', () => {
    const state = running(60_000)

    expect(timerReducer(state, { type: 'sync', now: NOW + 400 })).toBe(state)
  })

  it('produces a new snapshot when the displayed second changes', () => {
    const state = running(60_000)
    const next = timerReducer(state, { type: 'sync', now: NOW + 1000 })

    expect(next).not.toBe(state)
    expect(next.remainingMs).toBe(59_000)
  })

  it('completes once the deadline has passed', () => {
    const next = timerReducer(running(60_000), {
      type: 'sync',
      now: NOW + 60_001,
    })

    expect(next).toEqual({
      status: 'completed',
      durationMs: 60_000,
      endsAt: null,
      remainingMs: 0,
    })
  })

  it('completes after a long gap with the tab hidden', () => {
    const next = timerReducer(running(60_000), {
      type: 'sync',
      now: NOW + 6 * ONE_HOUR,
    })

    expect(next.status).toBe('completed')
  })

  it('is a no-op when not running', () => {
    const state = timerReducer(running(60_000), {
      type: 'pause',
      now: NOW + 1000,
    })

    expect(timerReducer(state, { type: 'sync', now: NOW + 90_000 })).toBe(state)
  })
})

describe('toPersistedTimer', () => {
  it('stores the deadline of a running countdown', () => {
    expect(toPersistedTimer(running(60_000))).toEqual({
      status: 'running',
      durationMs: 60_000,
      endsAt: NOW + 60_000,
    })
  })

  it('stores the remainder of a paused countdown', () => {
    const paused = timerReducer(running(60_000), {
      type: 'pause',
      now: NOW + 20_000,
    })

    expect(toPersistedTimer(paused)).toEqual({
      status: 'paused',
      durationMs: 60_000,
      endsAt: 40_000,
    })
  })
})

describe('parsePersistedTimer', () => {
  it('round-trips a running countdown', () => {
    const persisted = toPersistedTimer(running(60_000))

    expect(parsePersistedTimer(persisted, NOW + 20_000)).toEqual({
      status: 'running',
      durationMs: 60_000,
      endsAt: NOW + 60_000,
      remainingMs: 40_000,
    })
  })

  it('round-trips a paused countdown', () => {
    const paused = timerReducer(running(60_000), {
      type: 'pause',
      now: NOW + 20_000,
    })

    expect(
      parsePersistedTimer(toPersistedTimer(paused), NOW + ONE_HOUR)
    ).toEqual({
      status: 'paused',
      durationMs: 60_000,
      endsAt: null,
      remainingMs: 40_000,
    })
  })

  it('completes a countdown whose deadline passed while away', () => {
    const persisted = toPersistedTimer(running(60_000))

    expect(parsePersistedTimer(persisted, NOW + 60_001)).toMatchObject({
      status: 'completed',
      remainingMs: 0,
    })
  })

  it('restores idle and completed states', () => {
    expect(
      parsePersistedTimer(
        { status: 'idle', durationMs: 60_000, endsAt: null },
        NOW
      )
    ).toEqual(createTimerState(60_000))

    expect(
      parsePersistedTimer(
        { status: 'completed', durationMs: 60_000, endsAt: null },
        NOW
      )
    ).toMatchObject({ status: 'completed', remainingMs: 0 })
  })

  it('discards a deadline further out than the duration', () => {
    // System clock moved backwards: the countdown would never finish.
    const persisted = { status: 'running', durationMs: 60_000, endsAt: NOW }

    expect(parsePersistedTimer(persisted, NOW - ONE_HOUR)).toBeNull()
  })

  it('discards a paused remainder larger than the duration', () => {
    expect(
      parsePersistedTimer(
        { status: 'paused', durationMs: 60_000, endsAt: 90_000 },
        NOW
      )
    ).toBeNull()
  })

  it('discards malformed payloads', () => {
    expect(parsePersistedTimer(null, NOW)).toBeNull()
    expect(parsePersistedTimer('running', NOW)).toBeNull()
    expect(parsePersistedTimer({}, NOW)).toBeNull()
    expect(
      parsePersistedTimer({ status: 'sprinting', durationMs: 60_000 }, NOW)
    ).toBeNull()
    expect(
      parsePersistedTimer({ status: 'running', durationMs: 0 }, NOW)
    ).toBeNull()
    expect(
      parsePersistedTimer({ status: 'running', durationMs: 60_000 }, NOW)
    ).toBeNull()
    expect(
      parsePersistedTimer(
        { status: 'running', durationMs: 60_000, endsAt: 'soon' },
        NOW
      )
    ).toBeNull()
  })
})
