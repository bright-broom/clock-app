'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

import type { Locale } from '@/lib'
import { cityTimeZones, formatTimeInZone } from '@/lib/time'
import { useCurrentTime } from '@/lib/time/client'

type Props = {
  locale: Locale
}

export const WorldClockList = memo(function WorldClockList({ locale }: Props) {
  const t = useTranslations('time')
  const now = useCurrentTime()

  const rows = cityTimeZones.map((city) => ({
    ...city,
    time: now ? formatTimeInZone(now, locale, city.timeZone) : '--:--:--',
  }))

  return (
    <ul className="grid gap-[0.618rem] sm:grid-cols-2 sm:gap-3">
      {rows.map((city) => (
        <li
          key={city.slug}
          className="rounded-[var(--layout-card-radius)] border border-border bg-background p-1 transition-colors hover:border-foreground-muted hover:bg-background-overlay"
        >
          <Link
            href={`/${locale}/time-in/${city.slug}`}
            className="flex min-h-[4.5rem] items-center justify-between gap-3 rounded-[0.9rem] px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-[2.618rem] w-px shrink-0 bg-accent opacity-60"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-foreground">{city.names[locale]}</p>
                <p className="truncate text-xs text-foreground-muted">
                  {city.timeZone}
                </p>
              </div>
            </div>
            <span
              className="shrink-0 font-mono text-foreground-muted"
              role="timer"
              aria-label={
                now ? `${t('currentTime')} ${city.time}` : t('loading')
              }
              aria-live="off"
            >
              {city.time}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
})

WorldClockList.displayName = 'WorldClockList'
