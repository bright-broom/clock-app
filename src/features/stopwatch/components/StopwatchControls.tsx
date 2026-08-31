'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

import type { StopwatchStatus } from '../model/stopwatchMachine'

type Props = {
  onPause: () => void
  onReset: () => void
  onStart: () => void
  status: StopwatchStatus
}

export const StopwatchControls = memo(function StopwatchControls({
  onPause,
  onReset,
  onStart,
  status,
}: Props) {
  const t = useTranslations('stopwatch')
  const isRunning = status === 'running'
  const primaryLabel = isRunning
    ? t('pause')
    : status === 'paused'
      ? t('resume')
      : t('start')

  return (
    <div className="mx-auto mt-[1.618rem] grid w-full max-w-[22rem] grid-cols-[1.618fr_1fr] gap-2">
      <button
        type="button"
        onClick={isRunning ? onPause : onStart}
        className="min-h-[44px] w-full touch-manipulation rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={status === 'idle'}
        className="min-h-[44px] w-full touch-manipulation rounded-full border border-border px-4 text-sm font-semibold text-foreground-muted transition-colors hover:bg-background-overlay-strong hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-30"
      >
        {t('reset')}
      </button>
    </div>
  )
})

StopwatchControls.displayName = 'StopwatchControls'
