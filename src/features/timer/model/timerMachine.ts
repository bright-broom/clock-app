/**
 * Pure countdown state machine.
 *
 * Deliberately free of timers, DOM and `Date.now()`: every action that depends
 * on the current instant receives `now` as an argument. The driver
 * (`useTimer`) owns all side effects, which keeps the time
 * arithmetic here fully unit-testable.
 *
 * Drift model: while running, `endsAt` (epoch ms) is the single source of
 * truth and `remainingMs` is always recomputed from it - never decremented.
 * Epoch time is used instead of `performance.now()` so the countdown stays
 * correct across device sleep; the trade-off is that a system clock change
 * (NTP correction, manual adjustment) shifts the countdown. That is accepted:
 * this is a UI timer with second-level accuracy, not a precision instrument.
 */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export type TimerState = {
  status: TimerStatus
  /** Configured countdown length. Survives `reset`. */
  durationMs: number
  /** Epoch ms at which the countdown completes. Non-null only while running. */
  endsAt: number | null
  /** Remaining ms as of the last `sync`. Derived from `endsAt` while running. */
  remainingMs: number
}

export type TimerAction =
  | { type: 'setDuration'; ms: number }
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'reset' }
  /** Re-evaluate against the wall clock: used by the tick loop and on refocus. */
  | { type: 'sync'; now: number }

export const MAX_DURATION_MS = 24 * 60 * 60 * 1000

export const DEFAULT_DURATION_MS = 5 * 60 * 1000

/**
 * Normalizes a requested duration to whole seconds within the supported range.
 * Zero is allowed so the duration picker can be cleared; `start` is a no-op
 * while the duration is zero.
 */
export function clampDuration(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) {
    return 0
  }

  return Math.min(MAX_DURATION_MS, Math.round(ms / 1000) * 1000)
}

/**
 * Seconds to display for a remaining duration. Rounds up so a 5s countdown
 * shows "5" for a full second and reaches "0" exactly at completion.
 */
export function toDisplaySeconds(remainingMs: number): number {
  return Math.ceil(Math.max(0, remainingMs) / 1000)
}

export type TimerParts = {
  hours: string
  minutes: string
  seconds: string
}

export function toTimerParts(remainingMs: number): TimerParts {
  const totalSeconds = toDisplaySeconds(remainingMs)

  return {
    hours: padZero(Math.floor(totalSeconds / 3600)),
    minutes: padZero(Math.floor((totalSeconds % 3600) / 60)),
    seconds: padZero(totalSeconds % 60),
  }
}

/**
 * Delay until the displayed second changes. Aligning to the remainder keeps
 * the countdown visually in step with `endsAt` instead of accumulating the
 * scheduling latency of each tick.
 */
export function nextTickDelay(remainingMs: number): number {
  if (remainingMs <= 0) {
    return 0
  }

  return remainingMs % 1000 || 1000
}

export function createTimerState(
  durationMs: number = DEFAULT_DURATION_MS
): TimerState {
  const duration = clampDuration(durationMs)

  return {
    status: 'idle',
    durationMs: duration,
    endsAt: null,
    remainingMs: duration,
  }
}

export function timerReducer(
  state: TimerState,
  action: TimerAction
): TimerState {
  switch (action.type) {
    case 'setDuration': {
      // Ignored mid-countdown; the picker is disabled while running.
      if (state.status === 'running') {
        return state
      }

      const durationMs = clampDuration(action.ms)

      if (state.status === 'idle' && durationMs === state.durationMs) {
        return state
      }

      return createTimerState(durationMs)
    }

    case 'start': {
      if (state.status === 'running') {
        return state
      }

      // `paused` resumes what is left; `idle` and `completed` run the full
      // duration, so pressing start on a finished timer replays it.
      const target =
        state.status === 'paused' ? state.remainingMs : state.durationMs

      if (target <= 0) {
        return state
      }

      return {
        ...state,
        status: 'running',
        endsAt: action.now + target,
        remainingMs: target,
      }
    }

    case 'pause': {
      if (state.status !== 'running' || state.endsAt === null) {
        return state
      }

      const remainingMs = Math.max(0, state.endsAt - action.now)

      if (remainingMs === 0) {
        return toCompleted(state)
      }

      return { ...state, status: 'paused', endsAt: null, remainingMs }
    }

    case 'reset': {
      if (state.status === 'idle' && state.remainingMs === state.durationMs) {
        return state
      }

      return createTimerState(state.durationMs)
    }

    case 'sync': {
      if (state.status !== 'running' || state.endsAt === null) {
        return state
      }

      const remainingMs = Math.max(0, state.endsAt - action.now)

      if (remainingMs === 0) {
        return toCompleted(state)
      }

      // Keep the snapshot referentially stable until the displayed second
      // changes, so extra syncs (refocus, visibility) do not re-render.
      if (
        toDisplaySeconds(remainingMs) === toDisplaySeconds(state.remainingMs)
      ) {
        return state
      }

      return { ...state, remainingMs }
    }
  }
}

export type PersistedTimer = {
  status: TimerStatus
  durationMs: number
  endsAt: number | null
}

export function toPersistedTimer(state: TimerState): PersistedTimer {
  return {
    status: state.status,
    durationMs: state.durationMs,
    // A paused countdown has no deadline, so its remainder is stored as one.
    endsAt: state.status === 'paused' ? state.remainingMs : state.endsAt,
  }
}

/**
 * Rebuilds state from persisted JSON, re-evaluated against `now`.
 * Returns `null` for anything unrecognized or implausible so the caller can
 * fall back to a fresh timer instead of trusting client storage.
 */
export function parsePersistedTimer(
  raw: unknown,
  now: number
): TimerState | null {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }

  const candidate = raw as Record<string, unknown>
  const status = candidate.status
  const durationMs = clampDuration(
    typeof candidate.durationMs === 'number' ? candidate.durationMs : 0
  )

  if (!isTimerStatus(status) || durationMs === 0) {
    return null
  }

  const base = createTimerState(durationMs)

  if (status === 'idle') {
    return base
  }

  if (status === 'completed') {
    return toCompleted(base)
  }

  const endsAt = candidate.endsAt

  if (typeof endsAt !== 'number' || !Number.isFinite(endsAt)) {
    return null
  }

  if (status === 'paused') {
    // Stored as a remainder rather than a deadline.
    if (endsAt <= 0 || endsAt > durationMs) {
      return null
    }

    return { ...base, status: 'paused', endsAt: null, remainingMs: endsAt }
  }

  const remainingMs = endsAt - now

  // Beyond the configured duration means the clock moved, not that time is
  // left: discard rather than restore a countdown that would never finish.
  if (remainingMs > durationMs) {
    return null
  }

  if (remainingMs <= 0) {
    return toCompleted(base)
  }

  return { ...base, status: 'running', endsAt, remainingMs }
}

function toCompleted(state: TimerState): TimerState {
  return { ...state, status: 'completed', endsAt: null, remainingMs: 0 }
}

function isTimerStatus(value: unknown): value is TimerStatus {
  return (
    value === 'idle' ||
    value === 'running' ||
    value === 'paused' ||
    value === 'completed'
  )
}

function padZero(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}
