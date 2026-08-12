'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useState } from 'react'

import type { Locale } from '@/lib'

type Props = {
  locale: Locale
  timeZone: string
}

export const CityTimeCard = memo(function CityTimeCard({
  locale,
  timeZone,
}: Props) {
  const t = useTranslations('time')
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((prev) => prev + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const now = new Date()
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  }).format(now)

  const date = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone,
  }).format(now)

  return (
    <div className="rounded-2xl border border-border bg-background p-6 text-center">
      <p
        className="font-mono text-[clamp(2.2rem,9vw,4rem)] leading-none text-foreground"
        role="timer"
        aria-label={`${t('currentTime')} ${time}`}
      >
        {time}
      </p>
      <p className="mt-3 text-sm text-foreground-muted">{date}</p>
      <p className="mt-3 inline-flex rounded-full border border-border bg-background-overlay px-3 py-1 text-[0.65rem] uppercase tracking-wider text-foreground-muted">
        {timeZone}
      </p>
    </div>
  )
})

CityTimeCard.displayName = 'CityTimeCard'
