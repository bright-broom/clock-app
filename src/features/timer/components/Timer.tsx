'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef, useState } from 'react'

import { toTimerParts } from '../model/timerMachine'
import { useTimer } from '../model/useTimer'
import { useTimerAlarm } from '../model/useTimerAlarm'

import { DurationPicker } from './DurationPicker'
import { TimerControls } from './TimerControls'
import { TimerDisplay } from './TimerDisplay'

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(
      'a[href], button, input, select, textarea, summary, [contenteditable="true"], [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="spinbutton"], [role="textbox"], [role="combobox"], [role="menuitem"], [role="tab"], [role="option"]'
    ) !== null
  )
}

export const Timer = memo(function Timer() {
  const t = useTranslations('timer')
  const { state, actions } = useTimer()
  const [announcement, setAnnouncement] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const previousStatus = useRef(state.status)
  const { play: playAlarm, prepare: prepareAlarm } = useTimerAlarm(soundEnabled)

  useEffect(() => {
    if (previousStatus.current !== state.status) {
      setAnnouncement(t(`status.${state.status}`))

      if (state.status === 'completed') {
        playAlarm()
      }

      previousStatus.current = state.status
    }
  }, [playAlarm, state.status, t])

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
        isInteractiveTarget(event.target)
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
    <div className="mx-auto grid max-w-4xl items-center gap-x-8 gap-y-4 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(22rem,1.1fr)]">
      <div className="text-center">
        <TimerDisplay
          durationMs={state.durationMs}
          remainingMs={state.remainingMs}
          status={state.status}
        />
        <p className="mt-2 text-sm text-foreground-muted">
          {t(`status.${state.status}`)}
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl text-center">
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
        <button
          type="button"
          aria-pressed={soundEnabled}
          onClick={() => setSoundEnabled((enabled) => !enabled)}
          className="mt-3 min-h-[44px] touch-manipulation rounded-full px-4 text-xs text-foreground-muted transition-colors hover:bg-background-overlay hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {soundEnabled ? t('soundOn') : t('soundOff')}
        </button>
        <p className="mt-1 text-xs text-foreground-muted">
          {t('keyboardHint')}
        </p>
        <p className="mt-0.5 text-xs text-foreground-disabled">
          {t('backgroundNotice')}
        </p>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
})

Timer.displayName = 'Timer'
