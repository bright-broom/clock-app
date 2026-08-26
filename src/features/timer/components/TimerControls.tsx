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
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <button
        type="button"
        onClick={isRunning ? onPause : onStart}
        disabled={!isRunning && !canStart}
        className="min-h-[44px] min-w-[8rem] rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={status === 'idle'}
        className="min-h-[44px] min-w-[8rem] rounded-full border border-border px-6 text-sm font-semibold text-foreground-muted transition-colors hover:bg-background-overlay-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
      >
        {t('reset')}
      </button>
    </div>
  )
})

TimerControls.displayName = 'TimerControls'
