'use client'

import { useSyncExternalStore } from 'react'

import {
  createTimerState,
  DEFAULT_DURATION_MS,
  nextTickDelay,
  parsePersistedTimer,
  timerReducer,
  toPersistedTimer,
  type PersistedTimer,
  type TimerAction,
  type TimerState,
} from './timerMachine'

/**
 * Singleton store driving the countdown state machine.
 *
 * Shared module state (rather than per-component state) lets the display,
 * controls and progress ring subscribe to one countdown, and lets the timer
 * survive unmounting: `endsAt` is the source of truth, so remounting simply
 * re-syncs against the wall clock.
 *
 * Background tabs throttle - and may freeze - `setTimeout`, so the tick loop is
 * never trusted for correctness. Every wake-up recomputes from `endsAt`, and
 * refocus/visibility events force an immediate re-sync. Firing exactly on time
 * while the tab is frozen would require a service worker and is out of scope.
 */

const STORAGE_KEY = 'clock-app:timer:v2'
const LEGACY_STORAGE_KEY = 'clock-app:timer:v1'
const STORAGE_VERSION = 2

type StorageRevision = {
  updatedAt: number
  sourceId: string
}

type StoredTimerEnvelope = StorageRevision & {
  version: typeof STORAGE_VERSION
  timer: PersistedTimer
}

const initialState: TimerState = createTimerState(DEFAULT_DURATION_MS)

let state: TimerState = initialState
let listeners = new Set<() => void>()
let timeoutId: ReturnType<typeof setTimeout> | null = null
let hydrated = false
let listening = false
let sourceId = ''
let storageRevision: StorageRevision = { updatedAt: 0, sourceId: '' }

function getSourceId(): string {
  if (!sourceId) {
    sourceId =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  }

  return sourceId
}

function parseStoredEnvelope(
  raw: unknown,
  now: number
): { revision: StorageRevision; state: TimerState } | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const candidate = raw as Record<string, unknown>
  if (
    candidate.version !== STORAGE_VERSION ||
    typeof candidate.updatedAt !== 'number' ||
    !Number.isSafeInteger(candidate.updatedAt) ||
    candidate.updatedAt < 0 ||
    typeof candidate.sourceId !== 'string' ||
    candidate.sourceId.length === 0 ||
    candidate.sourceId.length > 128
  ) {
    return null
  }

  const restored = parsePersistedTimer(candidate.timer, now)
  if (!restored) {
    return null
  }

  return {
    revision: {
      updatedAt: candidate.updatedAt,
      sourceId: candidate.sourceId,
    },
    state: restored,
  }
}

function parseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function clearTick() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function scheduleTick() {
  clearTick()

  if (state.status !== 'running' || state.endsAt === null) {
    return
  }

  const delay = nextTickDelay(state.endsAt - Date.now())
  timeoutId = setTimeout(handleTick, Math.max(0, delay))
}

function handleTick() {
  timeoutId = null
  dispatch({ type: 'sync', now: Date.now() })
}

function shouldPersist(prev: TimerState, next: TimerState): boolean {
  // Ticks are not persisted: `endsAt` alone reconstructs a running countdown,
  // so only command-driven transitions need a write.
  return (
    prev.status !== next.status ||
    prev.durationMs !== next.durationMs ||
    prev.endsAt !== next.endsAt ||
    (next.status === 'paused' && prev.remainingMs !== next.remainingMs)
  )
}

function dispatch(action: TimerAction) {
  const next = timerReducer(state, action)
  const changed = next !== state

  if (changed) {
    const persistNeeded = shouldPersist(state, next)
    state = next

    if (persistNeeded) {
      persist()
    }
  }

  // Re-armed on every dispatch: a `sync` that left the snapshot untouched still
  // needs the next tick scheduled, and commands start or stop the countdown.
  if (listeners.size > 0) {
    scheduleTick()
  }

  if (changed) {
    listeners.forEach((listener) => listener())
  }
}

function persist() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const localSourceId = getSourceId()
    const persisted = parseStoredEnvelope(
      parseJson(window.localStorage.getItem(STORAGE_KEY) ?? ''),
      Date.now()
    )
    const updatedAt = Math.max(
      Date.now(),
      storageRevision.updatedAt + 1,
      (persisted?.revision.updatedAt ?? 0) + 1
    )
    const envelope: StoredTimerEnvelope = {
      version: STORAGE_VERSION,
      updatedAt,
      sourceId: localSourceId,
      timer: toPersistedTimer(state),
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
    storageRevision = { updatedAt, sourceId: localSourceId }
  } catch {
    // Storage may be unavailable (private mode, quota). The countdown keeps
    // working in memory; only cross-reload restore is lost.
  }
}

/**
 * Restores persisted state once, after mount. Never called during render so the
 * hydration pass keeps matching the server-rendered markup.
 */
function hydrate() {
  if (hydrated) {
    return
  }

  hydrated = true

  if (typeof window === 'undefined') {
    return
  }

  let raw: string | null = null
  let legacyRaw: string | null = null

  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
    legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
  } catch {
    return
  }

  if (raw) {
    const restored = parseStoredEnvelope(parseJson(raw), Date.now())
    if (restored) {
      state = restored.state
      storageRevision = restored.revision
      return
    }
  }

  if (legacyRaw) {
    const restored = parsePersistedTimer(parseJson(legacyRaw), Date.now())
    if (restored) {
      state = restored
    }
  }
}

function syncFromStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY || typeof window === 'undefined') {
    return
  }

  let currentValue: string | null
  try {
    // The current storage value, rather than the queued event payload, is the
    // source of truth. This makes every tab converge on the actual last write
    // even when two commands used the same millisecond revision.
    currentValue = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return
  }

  const restored = currentValue
    ? parseStoredEnvelope(parseJson(currentValue), Date.now())
    : null
  if (!restored) {
    return
  }

  storageRevision = restored.revision
  state = restored.state
  scheduleTick()
  listeners.forEach((listener) => listener())
}

function resync() {
  if (
    typeof document !== 'undefined' &&
    document.visibilityState === 'hidden'
  ) {
    return
  }

  dispatch({ type: 'sync', now: Date.now() })
}

function addEventListeners() {
  if (listening || typeof window === 'undefined') {
    return
  }

  listening = true
  document.addEventListener('visibilitychange', resync)
  window.addEventListener('focus', resync)
  window.addEventListener('pageshow', resync)
  window.addEventListener('storage', syncFromStorage)
}

function removeEventListeners() {
  if (!listening || typeof window === 'undefined') {
    return
  }

  listening = false
  document.removeEventListener('visibilitychange', resync)
  window.removeEventListener('focus', resync)
  window.removeEventListener('pageshow', resync)
  window.removeEventListener('storage', syncFromStorage)
}

function subscribe(listener: () => void): () => void {
  const isFirst = listeners.size === 0
  listeners.add(listener)

  if (isFirst) {
    hydrate()
    addEventListeners()
    // Catches up on time that passed while nothing was mounted.
    dispatch({ type: 'sync', now: Date.now() })
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      clearTick()
      removeEventListeners()
    }
  }
}

function getSnapshot(): TimerState {
  return state
}

function getServerSnapshot(): TimerState {
  return initialState
}

export type TimerActions = {
  setDuration: (ms: number) => void
  start: () => void
  pause: () => void
  reset: () => void
}

// Module-level so the identity stays stable across renders.
const actions: TimerActions = {
  setDuration: (ms) => dispatch({ type: 'setDuration', ms }),
  start: () => dispatch({ type: 'start', now: Date.now() }),
  pause: () => dispatch({ type: 'pause', now: Date.now() }),
  reset: () => dispatch({ type: 'reset' }),
}

export function useTimer(): { state: TimerState; actions: TimerActions } {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  return { state: snapshot, actions }
}

export function __resetTimerStore() {
  clearTick()
  removeEventListeners()
  listeners = new Set()
  state = initialState
  hydrated = false
  storageRevision = { updatedAt: 0, sourceId: '' }
}
