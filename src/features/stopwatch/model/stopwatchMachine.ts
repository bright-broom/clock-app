/**
 * Pure stopwatch state machine.
 *
 * Browser timers only request a refresh. Elapsed time is always derived from
 * the monotonic instant supplied by the driver, so delayed or throttled ticks
 * do not accumulate drift and system-clock adjustments cannot change elapsed
 * time.
 */

export type StopwatchStatus = 'idle' | 'running' | 'paused'

export type StopwatchState = {
  status: StopwatchStatus
  /** Elapsed milliseconds captured at `startedAt`. */
  elapsedMs: number
  /** Monotonic instant used as the next delta origin while running. */
  startedAt: number | null
}

export type StopwatchAction =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'reset' }
  | { type: 'sync'; now: number }

export const STOPWATCH_TICK_MS = 100

export type StopwatchParts = {
  hours: string
  minutes: string
  seconds: string
  tenths: string
}

export function createStopwatchState(): StopwatchState {
  return {
    status: 'idle',
    elapsedMs: 0,
    startedAt: null,
  }
}

function normalizeInstant(now: number): number | null {
  return Number.isFinite(now) ? Math.trunc(now) : null
}

function advanceRunning(state: StopwatchState, now: number): StopwatchState {
  if (state.status !== 'running' || state.startedAt === null) {
    return state
  }

  const normalizedNow = normalizeInstant(now)
  if (normalizedNow === null || normalizedNow === state.startedAt) {
    return state
  }

  const delta = Math.max(0, normalizedNow - state.startedAt)
  return {
    ...state,
    elapsedMs: Math.min(Number.MAX_SAFE_INTEGER, state.elapsedMs + delta),
    startedAt: normalizedNow,
  }
}

export function stopwatchReducer(
  state: StopwatchState,
  action: StopwatchAction
): StopwatchState {
  switch (action.type) {
    case 'start': {
      if (state.status === 'running') {
        return state
      }

      const now = normalizeInstant(action.now)
      return now === null
        ? state
        : { ...state, status: 'running', startedAt: now }
    }

    case 'pause': {
      if (state.status !== 'running') {
        return state
      }

      const advanced = advanceRunning(state, action.now)
      return advanced === state && !Number.isFinite(action.now)
        ? state
        : { ...advanced, status: 'paused', startedAt: null }
    }

    case 'reset':
      return state.status === 'idle' && state.elapsedMs === 0
        ? state
        : createStopwatchState()

    case 'sync':
      return advanceRunning(state, action.now)
  }
}

export function nextStopwatchTickDelay(elapsedMs: number): number {
  const normalized = Number.isFinite(elapsedMs)
    ? Math.max(0, Math.trunc(elapsedMs))
    : 0
  const remainder = normalized % STOPWATCH_TICK_MS

  return remainder === 0 ? STOPWATCH_TICK_MS : STOPWATCH_TICK_MS - remainder
}

export function toStopwatchParts(elapsedMs: number): StopwatchParts {
  const normalized = Number.isFinite(elapsedMs)
    ? Math.max(0, Math.trunc(elapsedMs))
    : 0
  const totalTenths = Math.floor(normalized / STOPWATCH_TICK_MS)

  return {
    hours: String(Math.floor(totalTenths / 36_000)).padStart(2, '0'),
    minutes: String(Math.floor((totalTenths % 36_000) / 600)).padStart(2, '0'),
    seconds: String(Math.floor((totalTenths % 600) / 10)).padStart(2, '0'),
    tenths: String(totalTenths % 10),
  }
}
