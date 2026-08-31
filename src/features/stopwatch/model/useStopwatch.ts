'use client'

import { useSyncExternalStore } from 'react'

import {
  createStopwatchState,
  nextStopwatchTickDelay,
  stopwatchReducer,
  type StopwatchAction,
  type StopwatchState,
} from './stopwatchMachine'

/**
 * Runtime-scoped stopwatch driver.
 *
 * The singleton survives Client-side route unmounts and catches up from a
 * monotonic clock when mounted again. A full page reload intentionally starts
 * a new stopwatch; browser persistence would require a separate cross-runtime
 * clock and data-lifecycle contract.
 */

const initialState = createStopwatchState()

let state: StopwatchState = initialState
let listeners = new Set<() => void>()
let timeoutId: ReturnType<typeof setTimeout> | null = null
let listening = false

function now(): number {
  return globalThis.performance?.now() ?? Date.now()
}

function clearTick() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function scheduleTick() {
  clearTick()

  if (
    state.status !== 'running' ||
    listeners.size === 0 ||
    (typeof document !== 'undefined' && document.visibilityState === 'hidden')
  ) {
    return
  }

  timeoutId = setTimeout(handleTick, nextStopwatchTickDelay(state.elapsedMs))
}

function handleTick() {
  timeoutId = null
  dispatch({ type: 'sync', now: now() })
}

function dispatch(action: StopwatchAction) {
  const next = stopwatchReducer(state, action)
  const changed = next !== state

  if (changed) {
    state = next
  }

  scheduleTick()

  if (changed) {
    listeners.forEach((listener) => listener())
  }
}

function resync() {
  if (
    typeof document !== 'undefined' &&
    document.visibilityState === 'hidden'
  ) {
    clearTick()
    return
  }

  dispatch({ type: 'sync', now: now() })
}

function addEventListeners() {
  if (listening || typeof window === 'undefined') {
    return
  }

  listening = true
  document.addEventListener('visibilitychange', resync)
  window.addEventListener('focus', resync)
  window.addEventListener('pageshow', resync)
}

function removeEventListeners() {
  if (!listening || typeof window === 'undefined') {
    return
  }

  listening = false
  document.removeEventListener('visibilitychange', resync)
  window.removeEventListener('focus', resync)
  window.removeEventListener('pageshow', resync)
}

function subscribe(listener: () => void): () => void {
  const isFirst = listeners.size === 0
  listeners.add(listener)

  if (isFirst) {
    addEventListeners()
    dispatch({ type: 'sync', now: now() })
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      clearTick()
      removeEventListeners()
    }
  }
}

function getSnapshot(): StopwatchState {
  return state
}

function getServerSnapshot(): StopwatchState {
  return initialState
}

export type StopwatchActions = {
  start: () => void
  pause: () => void
  reset: () => void
}

const actions: StopwatchActions = {
  start: () => dispatch({ type: 'start', now: now() }),
  pause: () => dispatch({ type: 'pause', now: now() }),
  reset: () => dispatch({ type: 'reset' }),
}

export function useStopwatch(): {
  state: StopwatchState
  actions: StopwatchActions
} {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  return { state: snapshot, actions }
}

export function __resetStopwatchStore() {
  clearTick()
  removeEventListeners()
  listeners = new Set()
  state = initialState
}
