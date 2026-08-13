import { useSyncExternalStore } from 'react'

type TimeDigits = {
  hours: string
  minutes: string
  seconds: string
}

export type RawTimeState = TimeDigits & {
  rawDate: Date
}

let currentTime: RawTimeState | null = null
let listeners: Set<() => void> = new Set()
let timeoutId: ReturnType<typeof setTimeout> | null = null

function padZero(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function calculateTime(): RawTimeState {
  const now = new Date()

  return {
    hours: padZero(now.getHours()),
    minutes: padZero(now.getMinutes()),
    seconds: padZero(now.getSeconds()),
    rawDate: now,
  }
}

function scheduleNextTick() {
  const now = new Date()
  const delay = Math.max(1, 1000 - now.getMilliseconds())
  timeoutId = setTimeout(tick, delay)
}

function tick() {
  currentTime = calculateTime()
  listeners.forEach((listener) => listener())
  scheduleNextTick()
}

function startTicking() {
  if (timeoutId === null && listeners.size > 0) {
    currentTime = calculateTime()
    scheduleNextTick()
  }
}

function stopTicking() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  if (listeners.size === 1) {
    startTicking()
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      stopTicking()
    }
  }
}

function getSnapshot(): RawTimeState | null {
  return currentTime
}

function getServerSnapshot(): RawTimeState | null {
  return null
}

export function useTime(): RawTimeState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function __resetTimeStore() {
  stopTicking()
  currentTime = null
  listeners = new Set()
}
