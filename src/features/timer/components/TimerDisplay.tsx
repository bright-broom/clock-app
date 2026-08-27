'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'
import type { CSSProperties } from 'react'

import { toTimerParts, type TimerStatus } from '../model/timerMachine'

type Props = {
  durationMs: number
  remainingMs: number
  status: TimerStatus
}

export const TimerDisplay = memo(function TimerDisplay({
  durationMs,
  remainingMs,
  status,
}: Props) {
  const t = useTranslations('timer')
  const { hours, minutes, seconds } = toTimerParts(remainingMs)
  const progress =
    durationMs > 0 ? Math.min(1, Math.max(0, remainingMs / durationMs)) : 0
  const progressStyle: CSSProperties = {
    background: `conic-gradient(hsl(var(--color-fg-primary)) ${progress * 360}deg, hsl(var(--color-border-default)) 0deg)`,
  }

  return (
    <div
      className="relative mx-auto grid aspect-square w-[min(64vw,38svh,21rem)] place-items-center rounded-full p-px transition-[background] duration-300 motion-reduce:transition-none"
      style={progressStyle}
      data-status={status}
    >
      <div className="grid h-full w-full place-items-center rounded-full bg-background">
        <p
          className="font-mono text-[clamp(2.2rem,9vw,4.8rem)] font-extralight leading-none tracking-[-0.045em] text-foreground"
          role="timer"
          aria-live="off"
          aria-label={t('remainingLabel', { hours, minutes, seconds })}
        >
          <span>{hours}</span>
          <span className="mx-[0.05em] text-foreground-muted">:</span>
          <span>{minutes}</span>
          <span className="mx-[0.05em] text-foreground-muted">:</span>
          <span>{seconds}</span>
        </p>
      </div>
    </div>
  )
})

TimerDisplay.displayName = 'TimerDisplay'
