'use client'

import { useSyncExternalStore } from 'react'

export type TimerAlarmAvailability =
  'unprepared' | 'ready' | 'blocked' | 'unsupported'

type TimerAlarmSnapshot = {
  availability: TimerAlarmAvailability
  enabled: boolean
}

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

const SOUND_STORAGE_KEY = 'clock-app:timer-sound:v1'
const ENABLED_VALUE = 'on'
const DISABLED_VALUE = 'off'
const serverSnapshot: TimerAlarmSnapshot = {
  availability: 'unprepared',
  enabled: true,
}

let snapshot = serverSnapshot
let context: AudioContext | null = null
let hydrated = false
let listening = false
let listeners = new Set<() => void>()

function getAudioContextConstructor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return (
    window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext
  )
}

function updateSnapshot(next: Partial<TimerAlarmSnapshot>) {
  const candidate = { ...snapshot, ...next }
  if (
    candidate.enabled === snapshot.enabled &&
    candidate.availability === snapshot.availability
  ) {
    return
  }

  snapshot = candidate
  listeners.forEach((listener) => listener())
}

function readEnabled(): boolean {
  if (typeof window === 'undefined') {
    return true
  }

  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== DISABLED_VALUE
  } catch {
    return true
  }
}

function hydrate() {
  if (hydrated) {
    return
  }

  hydrated = true
  updateSnapshot({ enabled: readEnabled() })
}

function syncFromStorage(event: StorageEvent) {
  if (event.key !== SOUND_STORAGE_KEY) {
    return
  }

  updateSnapshot({ enabled: event.newValue !== DISABLED_VALUE })
}

function addStorageListener() {
  if (listening || typeof window === 'undefined') {
    return
  }

  listening = true
  window.addEventListener('storage', syncFromStorage)
}

function removeStorageListener() {
  if (!listening || typeof window === 'undefined') {
    return
  }

  listening = false
  window.removeEventListener('storage', syncFromStorage)
}

function subscribe(listener: () => void): () => void {
  const isFirst = listeners.size === 0
  listeners.add(listener)

  if (isFirst) {
    hydrate()
    addStorageListener()
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      removeStorageListener()
    }
  }
}

function getSnapshot(): TimerAlarmSnapshot {
  return snapshot
}

function getServerSnapshot(): TimerAlarmSnapshot {
  return serverSnapshot
}

function getContext(): AudioContext | null {
  if (context?.state === 'closed') {
    context = null
  }

  if (!context) {
    const AudioContextConstructor = getAudioContextConstructor()
    if (!AudioContextConstructor) {
      updateSnapshot({ availability: 'unsupported' })
      return null
    }

    try {
      context = new AudioContextConstructor()
    } catch {
      updateSnapshot({ availability: 'unsupported' })
      return null
    }
  }

  return context
}

export function setTimerAlarmEnabled(enabled: boolean) {
  hydrate()
  updateSnapshot({ enabled })

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      SOUND_STORAGE_KEY,
      enabled ? ENABLED_VALUE : DISABLED_VALUE
    )
  } catch {
    // Storage is an optional preference boundary. In-memory control remains
    // available when persistence is disabled or full.
  }
}

export async function prepareTimerAlarm(): Promise<boolean> {
  hydrate()
  if (!snapshot.enabled) {
    return false
  }

  const audioContext = getContext()
  if (!audioContext) {
    return false
  }

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    if (audioContext.state !== 'running') {
      updateSnapshot({ availability: 'blocked' })
      return false
    }

    updateSnapshot({ availability: 'ready' })
    return true
  } catch {
    updateSnapshot({ availability: 'blocked' })
    return false
  }
}

export async function playTimerAlarm(): Promise<boolean> {
  if (!(await prepareTimerAlarm())) {
    return false
  }

  const audioContext = getContext()
  if (!audioContext) {
    return false
  }

  try {
    const startAt = audioContext.currentTime

    for (const [index, frequency] of [880, 1046, 1318].entries()) {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const toneStart = startAt + index * 0.18

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, toneStart)
      gain.gain.setValueAtTime(0.0001, toneStart)
      gain.gain.exponentialRampToValueAtTime(0.12, toneStart + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + 0.14)
      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start(toneStart)
      oscillator.stop(toneStart + 0.15)
    }

    return true
  } catch {
    updateSnapshot({ availability: 'blocked' })
    return false
  }
}

export function useTimerAlarm(): TimerAlarmSnapshot & {
  prepare: () => Promise<boolean>
  setEnabled: (enabled: boolean) => void
} {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  return {
    ...current,
    prepare: prepareTimerAlarm,
    setEnabled: setTimerAlarmEnabled,
  }
}

export function __resetTimerAlarmStore() {
  removeStorageListener()
  listeners = new Set()
  hydrated = false
  snapshot = serverSnapshot

  const currentContext = context
  context = null
  if (currentContext && currentContext.state !== 'closed') {
    void currentContext.close().catch(() => undefined)
  }
}
