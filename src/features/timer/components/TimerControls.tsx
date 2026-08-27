'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

import type { TimerStatus } from '../model/timerMachine'

type Props = {
  canStart: boolean
  onPause: () => void
  onReset: () => void
  onStart: () => void
  status: TimerStatus
}

export const TimerControls = memo(function TimerControls({
  canStart,
  onPause,
  onReset,
  onStart,
  status,
}: Props) {
  const t = useTranslations('timer')
  const isRunning = status === 'running'
  const primaryLabel = isRunning
    ? t('pause')
    : status === 'paused'
      ? t('resume')
      : t('start')

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
      <button
        type="button"
        onClick={isRunning ? onPause : onStart}
        disabled={!isRunning && !canStart}
        className="min-h-[44px] w-full touch-manipulation rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:min-w-[8rem] sm:px-6"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={status === 'idle'}
        className="min-h-[44px] w-full touch-manipulation rounded-full border border-border px-4 text-sm font-semibold text-foreground-muted transition-colors hover:bg-background-overlay-strong hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:min-w-[8rem] sm:px-6"
      >
        {t('reset')}
      </button>
    </div>
  )
})

TimerControls.displayName = 'TimerControls'
