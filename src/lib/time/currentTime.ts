'use client'

import { useSyncExternalStore } from 'react'

let currentTime: Date | null = null
let listeners = new Set<() => void>()
let timeoutId: ReturnType<typeof setTimeout> | null = null
let listening = false

function clearTick(): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function isDocumentHidden(): boolean {
  return (
    typeof document !== 'undefined' && document.visibilityState === 'hidden'
  )
}

function publishNow(): void {
  currentTime = new Date()
  listeners.forEach((listener) => listener())
}

function scheduleNextTick(): void {
  clearTick()

  if (listeners.size === 0 || isDocumentHidden()) {
    return
  }

  const delay = Math.max(1, 1000 - (Date.now() % 1000))
  timeoutId = setTimeout(handleTick, delay)
}

function handleTick(): void {
  timeoutId = null
  publishNow()
  scheduleNextTick()
}

function resync(): void {
  if (isDocumentHidden()) {
    clearTick()
    return
  }

  publishNow()
  scheduleNextTick()
}

function addEventListeners(): void {
  if (listening || typeof window === 'undefined') {
    return
  }

  listening = true
  document.addEventListener('visibilitychange', resync)
  window.addEventListener('focus', resync)
  window.addEventListener('pageshow', resync)
}

function removeEventListeners(): void {
  if (!listening || typeof window === 'undefined') {
    return
  }

  listening = false
  document.removeEventListener('visibilitychange', resync)
  window.removeEventListener('focus', resync)
  window.removeEventListener('pageshow', resync)
}

function subscribe(listener: () => void): () => void {
  const isFirstSubscriber = listeners.size === 0
  listeners.add(listener)

  if (isFirstSubscriber) {
    addEventListeners()
    publishNow()
    scheduleNextTick()
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      clearTick()
      removeEventListeners()
    }
  }
}

function getSnapshot(): Date | null {
  return currentTime
}

function getServerSnapshot(): Date | null {
  return null
}

/**
 * Shared, second-aligned wall clock for every live-time feature.
 *
 * The server snapshot is deliberately `null` to keep hydration deterministic.
 * Background tabs stop scheduling work and catch up immediately when visible.
 */
export function useCurrentTime(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function __resetCurrentTimeStore(): void {
  clearTick()
  removeEventListeners()
  currentTime = null
  listeners = new Set()
}
