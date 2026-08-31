'use client'

import { playTimerAlarm } from './useTimerAlarm'

const CLAIM_STORAGE_KEY = 'clock-app:timer-alarm-claim:v1'
const CLAIM_LOCK_NAME = 'clock-app:timer-alarm'
const CLAIM_VERSION = 1
const FALLBACK_SETTLE_MS = 32

type AlarmClaim = {
  completionKey: string
  claimedAt: number
  sourceId: string
  version: typeof CLAIM_VERSION
}

export type TimerAlarmRequestResult = 'played' | 'claimed' | 'unavailable'

let sourceId = ''

function getSourceId(): string {
  if (!sourceId) {
    sourceId =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  }

  return sourceId
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function parseClaim(raw: string | null): AlarmClaim | null {
  if (!raw) {
    return null
  }

  try {
    const candidate = JSON.parse(raw) as Partial<AlarmClaim>
    return candidate.version === CLAIM_VERSION &&
      typeof candidate.completionKey === 'string' &&
      candidate.completionKey.length > 0 &&
      candidate.completionKey.length <= 128 &&
      typeof candidate.claimedAt === 'number' &&
      Number.isSafeInteger(candidate.claimedAt) &&
      typeof candidate.sourceId === 'string' &&
      candidate.sourceId.length > 0 &&
      candidate.sourceId.length <= 128
      ? (candidate as AlarmClaim)
      : null
  } catch {
    return null
  }
}

function readClaim(storage: Storage | null): AlarmClaim | null {
  if (!storage) {
    return null
  }

  try {
    return parseClaim(storage.getItem(CLAIM_STORAGE_KEY))
  } catch {
    return null
  }
}

function writeClaim(storage: Storage, claim: AlarmClaim): boolean {
  try {
    storage.setItem(CLAIM_STORAGE_KEY, JSON.stringify(claim))
    return true
  } catch {
    return false
  }
}

function removeOwnClaim(storage: Storage, claim: AlarmClaim) {
  try {
    const current = readClaim(storage)
    if (
      current?.completionKey === claim.completionKey &&
      current.sourceId === claim.sourceId
    ) {
      storage.removeItem(CLAIM_STORAGE_KEY)
    }
  } catch {
    // Optional duplicate suppression must not replace the primary timer flow.
  }
}

async function attemptWithExclusiveOwnership(
  completionKey: string,
  storage: Storage | null
): Promise<TimerAlarmRequestResult> {
  const existing = readClaim(storage)
  if (existing?.completionKey === completionKey) {
    return 'claimed'
  }

  if (!(await playTimerAlarm())) {
    return 'unavailable'
  }

  if (storage) {
    const claim: AlarmClaim = {
      version: CLAIM_VERSION,
      completionKey,
      claimedAt: Date.now(),
      sourceId: getSourceId(),
    }

    if (!writeClaim(storage, claim)) {
      // Playback already succeeded. Web Locks still prevents concurrent
      // duplicates; storage only carries the claim across later requests.
    }
  }

  return 'played'
}

async function attemptWithStorageElection(
  completionKey: string,
  storage: Storage
): Promise<TimerAlarmRequestResult> {
  const existing = readClaim(storage)
  if (existing?.completionKey === completionKey) {
    return 'claimed'
  }

  const claim: AlarmClaim = {
    version: CLAIM_VERSION,
    completionKey,
    claimedAt: Date.now(),
    sourceId: getSourceId(),
  }

  if (!writeClaim(storage, claim)) {
    return attemptWithExclusiveOwnership(completionKey, null)
  }

  await new Promise((resolve) => setTimeout(resolve, FALLBACK_SETTLE_MS))
  const winner = readClaim(storage)
  if (
    winner?.completionKey !== completionKey ||
    winner.sourceId !== claim.sourceId
  ) {
    return 'claimed'
  }

  if (await playTimerAlarm()) {
    return 'played'
  }

  removeOwnClaim(storage, claim)
  return 'unavailable'
}

export async function requestTimerCompletionAlarm(
  completionKey: string
): Promise<TimerAlarmRequestResult> {
  const storage = getStorage()

  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(CLAIM_LOCK_NAME, { mode: 'exclusive' }, () =>
      attemptWithExclusiveOwnership(completionKey, storage)
    )
  }

  return storage
    ? attemptWithStorageElection(completionKey, storage)
    : attemptWithExclusiveOwnership(completionKey, null)
}

export function __resetTimerAlarmCoordinator() {
  sourceId = ''
  const storage = getStorage()
  if (storage) {
    try {
      storage.removeItem(CLAIM_STORAGE_KEY)
    } catch {
      // Test/reset helper mirrors the production storage failure boundary.
    }
  }
}
