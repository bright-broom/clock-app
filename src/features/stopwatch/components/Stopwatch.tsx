'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef, useState } from 'react'

import { isInteractiveEventTarget } from '@/components/ui/isInteractiveEventTarget'

import { toStopwatchParts } from '../model/stopwatchMachine'
import { useStopwatch } from '../model/useStopwatch'

import { StopwatchControls } from './StopwatchControls'
import { StopwatchDisplay } from './StopwatchDisplay'

export const Stopwatch = memo(function Stopwatch() {
  const t = useTranslations('stopwatch')
  const { state, actions } = useStopwatch()
  const [announcement, setAnnouncement] = useState('')
  const previousStatus = useRef(state.status)
  const { hours, minutes, seconds } = toStopwatchParts(state.elapsedMs)
  const titleTime = `${hours}:${minutes}:${seconds}`

  useEffect(() => {
    if (previousStatus.current !== state.status) {
      setAnnouncement(t(`status.${state.status}`))
      previousStatus.current = state.status
    }
  }, [state.status, t])

  useEffect(() => {
    if (state.status === 'idle') {
      return
    }

    const originalTitle = document.title
    document.title = `${titleTime} · ${t('label')}`

    return () => {
      document.title = originalTitle
    }
  }, [state.status, t, titleTime])

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
          actions.start()
        }
      } else if (event.key.toLowerCase() === 'r') {
        actions.reset()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions, state.status])

  return (
    <div className="mx-auto w-full max-w-[30rem] py-[0.618rem] text-center">
      <StopwatchDisplay elapsedMs={state.elapsedMs} status={state.status} />
      <StopwatchControls
        status={state.status}
        onStart={actions.start}
        onPause={actions.pause}
        onReset={actions.reset}
      />
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
})

Stopwatch.displayName = 'Stopwatch'
