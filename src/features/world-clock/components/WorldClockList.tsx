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
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map((city) => (
        <li
          key={city.slug}
          className="rounded-xl border border-border bg-background p-3 transition-colors hover:bg-background-overlay"
        >
          <Link
            href={`/${locale}/time-in/${city.slug}`}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="truncate text-foreground">{city.names[locale]}</p>
              <p className="truncate text-xs text-foreground-muted">
                {city.timeZone}
              </p>
            </div>
            <span
              className="font-mono text-foreground-muted"
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
