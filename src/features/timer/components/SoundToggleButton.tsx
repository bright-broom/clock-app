'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

import type { TimerAlarmAvailability } from '../model/useTimerAlarm'

type Props = {
  availability: TimerAlarmAvailability
  enabled: boolean
  onToggle: () => void
}

function SoundStateIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6.75 8.5H4.5v7h2.25L11 19V5Z" />
      {enabled ? (
        <>
          <path d="M15 8.5a5 5 0 0 1 0 7" />
          <path d="M17.75 6a8.5 8.5 0 0 1 0 12" />
        </>
      ) : (
        <>
          <path d="m15.5 9 4 6" />
          <path d="m19.5 9-4 6" />
        </>
      )}
    </svg>
  )
}

export const SoundToggleButton = memo(function SoundToggleButton({
  availability,
  enabled,
  onToggle,
}: Props) {
  const t = useTranslations('timer')
  const unavailable =
    enabled && (availability === 'blocked' || availability === 'unsupported')
  const stateLabel = enabled ? t('soundOn') : t('soundOff')
  const label = unavailable
    ? `${stateLabel}。${t('soundUnavailable')}`
    : stateLabel

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      data-availability={availability}
      data-state={enabled ? 'on' : 'off'}
      onClick={onToggle}
      title={label}
      className="relative inline-grid min-h-[44px] min-w-[44px] touch-manipulation place-items-center rounded-full border border-border bg-background-overlay p-1 text-foreground-muted transition-[background-color,border-color,color] hover:border-foreground-muted hover:bg-background-overlay-strong hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-full transition-colors motion-reduce:transition-none ${
          enabled
            ? 'bg-primary text-primary-foreground'
            : 'bg-background-overlay-strong text-foreground-muted'
        }`}
        aria-hidden="true"
      >
        <SoundStateIcon enabled={enabled} />
      </span>
      {unavailable ? (
        <span
          className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-accent text-[0.625rem] font-bold leading-none text-accent-foreground"
          aria-hidden="true"
        >
          !
        </span>
      ) : null}
    </button>
  )
})

SoundToggleButton.displayName = 'SoundToggleButton'
