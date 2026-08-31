'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

import {
  toStopwatchParts,
  type StopwatchStatus,
} from '../model/stopwatchMachine'

type Props = {
  elapsedMs: number
  status: StopwatchStatus
}

export const StopwatchDisplay = memo(function StopwatchDisplay({
  elapsedMs,
  status,
}: Props) {
  const t = useTranslations('stopwatch')
  const { hours, minutes, seconds, tenths } = toStopwatchParts(elapsedMs)
  const ringClass =
    status === 'running'
      ? 'border-status-running shadow-[0_0_1.618rem_hsl(var(--color-shadow))]'
      : status === 'paused'
        ? 'border-foreground-muted border-dashed'
        : 'border-border'

  return (
    <div
      className={`relative mx-auto grid aspect-square w-[min(76vw,48svh,23rem,100%)] place-items-center rounded-full border bg-background-overlay p-[0.618rem] transition-[border-color,box-shadow] [container-type:inline-size] motion-reduce:transition-none ${ringClass}`}
      data-status={status}
      data-stopwatch-dial
    >
      <div className="grid h-full w-full place-items-center rounded-full border border-border bg-background">
        <p
          className="font-mono text-[clamp(1.75rem,14cqi,3.82rem)] font-extralight leading-none tracking-[-0.045em] text-foreground"
          role="timer"
          aria-live="off"
          aria-label={t('elapsedLabel', {
            hours,
            minutes,
            seconds,
            tenths,
          })}
        >
          <span>{hours}</span>
          <span className="mx-[0.05em] text-foreground-muted">:</span>
          <span>{minutes}</span>
          <span className="mx-[0.05em] text-foreground-muted">:</span>
          <span>{seconds}</span>
          <span className="ml-[0.08em] text-[0.382em] text-foreground-muted">
            .{tenths}
          </span>
        </p>
      </div>
    </div>
  )
})

StopwatchDisplay.displayName = 'StopwatchDisplay'
