'use client'

import { useCallback, useEffect, useRef } from 'react'

import { requestTimerCompletionAlarm } from '../model/timerAlarmCoordinator'
import { useTimer } from '../model/useTimer'
import { prepareTimerAlarm, useTimerAlarm } from '../model/useTimerAlarm'

const ALARM_RETRY_WINDOW_MS = 30_000

type PendingAlarm = {
  completionKey: string
  expiresAt: number
}

/**
 * Keeps countdown scheduling and completion ownership alive outside the timer
 * route. It renders no UI; the timer screen remains a view over shared state.
 */
export function TimerRuntime() {
  const { state } = useTimer()
  const { availability, enabled } = useTimerAlarm()
  const previousStatus = useRef(state.status)
  const lastDeadline = useRef<number | null>(null)
  const pendingAlarm = useRef<PendingAlarm | null>(null)

  const requestAlarm = useCallback(async (completionKey: string) => {
    const result = await requestTimerCompletionAlarm(completionKey)
    pendingAlarm.current =
      result === 'unavailable'
        ? {
            completionKey,
            expiresAt: Date.now() + ALARM_RETRY_WINDOW_MS,
          }
        : null
  }, [])

  useEffect(() => {
    if (state.status === 'running' && state.endsAt !== null) {
      lastDeadline.current = state.endsAt
    }

    if (
      enabled &&
      state.status === 'completed' &&
      previousStatus.current !== 'completed' &&
      lastDeadline.current !== null
    ) {
      void requestAlarm(`v1:${Math.trunc(lastDeadline.current)}`)
    }

    if (state.status === 'idle') {
      lastDeadline.current = null
      pendingAlarm.current = null
    }

    previousStatus.current = state.status
  }, [enabled, requestAlarm, state.endsAt, state.status])

  useEffect(() => {
    if (!enabled) {
      pendingAlarm.current = null
      return
    }

    const prepareAndRetry = () => {
      if (availability === 'ready' && !pendingAlarm.current) {
        return
      }

      void prepareTimerAlarm().then((ready) => {
        const pending = pendingAlarm.current
        if (!ready || !pending) {
          return
        }

        if (pending.expiresAt < Date.now()) {
          pendingAlarm.current = null
          return
        }

        void requestAlarm(pending.completionKey)
      })
    }

    document.addEventListener('pointerdown', prepareAndRetry, true)
    document.addEventListener('keydown', prepareAndRetry, true)
    return () => {
      document.removeEventListener('pointerdown', prepareAndRetry, true)
      document.removeEventListener('keydown', prepareAndRetry, true)
    }
  }, [availability, enabled, requestAlarm])

  return null
}
