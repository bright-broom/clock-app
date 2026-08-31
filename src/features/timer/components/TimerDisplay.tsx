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
    background: `conic-gradient(hsl(var(--color-primary)) ${progress * 360}deg, hsl(var(--color-border-default)) 0deg)`,
  }

  return (
    <div
      className="timer-dial relative mx-auto grid aspect-square place-items-center rounded-full p-px transition-[background] duration-300 motion-reduce:transition-none"
      style={progressStyle}
      data-status={status}
    >
      <div className="relative grid h-full w-full place-items-center rounded-full bg-background">
        <p
          className="timer-dial-value font-mono font-extralight leading-none tracking-[-0.045em] text-foreground"
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
        {status !== 'idle' ? (
          <p className="absolute bottom-[23.6%] left-1/2 w-[76.4%] -translate-x-1/2 text-balance text-center text-xs leading-relaxed tracking-[0.032em] text-foreground-muted">
            {t(`status.${status}`)}
          </p>
        ) : null}
      </div>
    </div>
  )
})

TimerDisplay.displayName = 'TimerDisplay'
