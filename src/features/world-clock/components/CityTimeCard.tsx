'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

import type { Locale } from '@/lib'
import { formatDateInZone, formatTimeInZone } from '@/lib/time'
import { useCurrentTime } from '@/lib/time/client'

type Props = {
  locale: Locale
  timeZone: string
}

export const CityTimeCard = memo(function CityTimeCard({
  locale,
  timeZone,
}: Props) {
  const t = useTranslations('time')
  const now = useCurrentTime()
  const time = now ? formatTimeInZone(now, locale, timeZone) : '--:--:--'
  const date = now
    ? formatDateInZone(now, locale, timeZone, 'long')
    : t('loading')

  return (
    <div className="relative overflow-hidden rounded-[var(--layout-card-radius)] border border-border bg-background p-[clamp(1.618rem,3.82vw,3.82rem)] text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[61.8%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border opacity-50" />
      <p
        className="relative font-mono text-[clamp(2.2rem,9vw,4rem)] leading-none text-foreground"
        role="timer"
        aria-label={now ? `${t('currentTime')} ${time}` : t('loading')}
        aria-live="off"
      >
        {time}
      </p>
      <p className="relative mt-3 text-sm text-foreground-muted">{date}</p>
      <p className="relative mt-3 inline-flex rounded-full border border-border bg-background-overlay px-3 py-1 text-[0.65rem] uppercase tracking-wider text-foreground-muted">
        {timeZone}
      </p>
    </div>
  )
})

CityTimeCard.displayName = 'CityTimeCard'
