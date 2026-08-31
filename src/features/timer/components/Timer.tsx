'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef, useState } from 'react'

import { isInteractiveEventTarget } from '@/components/ui/isInteractiveEventTarget'

import { toTimerParts } from '../model/timerMachine'
import { useTimer } from '../model/useTimer'
import { useTimerAlarm } from '../model/useTimerAlarm'

import { DurationPicker } from './DurationPicker'
import { SoundToggleButton } from './SoundToggleButton'
import { TimerControls } from './TimerControls'
import { TimerDisplay } from './TimerDisplay'

export const Timer = memo(function Timer() {
  const t = useTranslations('timer')
  const { state, actions } = useTimer()
  const [announcement, setAnnouncement] = useState('')
  const previousStatus = useRef(state.status)
  const {
    availability: alarmAvailability,
    enabled: soundEnabled,
    prepare: prepareAlarm,
    setEnabled: setSoundEnabled,
  } = useTimerAlarm()

  useEffect(() => {
    if (previousStatus.current !== state.status) {
      setAnnouncement(
        state.status === 'idle' ? '' : t(`status.${state.status}`)
      )

      previousStatus.current = state.status
    }
  }, [state.status, t])

  useEffect(() => {
    if (
      state.status === 'completed' &&
      soundEnabled &&
      (alarmAvailability === 'blocked' || alarmAvailability === 'unsupported')
    ) {
      setAnnouncement(`${t('status.completed')}。${t('soundUnavailable')}`)
    }
  }, [alarmAvailability, soundEnabled, state.status, t])

  useEffect(() => {
    if (state.status !== 'running' && state.status !== 'paused') {
      return
    }

    const originalTitle = document.title
    const { hours, minutes, seconds } = toTimerParts(state.remainingMs)
    document.title = `${hours}:${minutes}:${seconds} · ${t('label')}`

    return () => {
      document.title = originalTitle
    }
  }, [state.remainingMs, state.status, t])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isInteractiveEventTarget(event.target)
      ) {
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        if (state.status === 'running') {
          actions.pause()
        } else {
          prepareAlarm()
          actions.start()
        }
      } else if (event.key.toLowerCase() === 'r') {
        actions.reset()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions, prepareAlarm, state.status])

  const start = () => {
    prepareAlarm()
    actions.start()
  }

  return (
    <div className="mx-auto grid w-full max-w-[56rem] items-center gap-x-[var(--layout-cluster-gap)] gap-y-[1rem] md:grid-cols-[minmax(14rem,0.382fr)_minmax(20rem,0.618fr)]">
      <div className="min-w-0 text-center" data-timer-region="display">
        <TimerDisplay
          durationMs={state.durationMs}
          remainingMs={state.remainingMs}
          status={state.status}
        />
      </div>

      <div
        className="mx-auto w-full min-w-0 max-w-xl text-center md:border-l md:border-border md:pl-[var(--layout-cluster-gap)]"
        data-timer-region="controls"
      >
        <DurationPicker
          durationMs={state.durationMs}
          disabled={state.status === 'running'}
          onChange={actions.setDuration}
        />
        <TimerControls
          status={state.status}
          canStart={state.durationMs > 0}
          onStart={start}
          onPause={actions.pause}
          onReset={actions.reset}
        />
        <div className="mt-[0.618rem] flex justify-center">
          <SoundToggleButton
            availability={alarmAvailability}
            enabled={soundEnabled}
            onToggle={() => {
              const next = !soundEnabled
              setSoundEnabled(next)
              if (next) {
                void prepareAlarm()
              }
            }}
          />
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
})

Timer.displayName = 'Timer'
