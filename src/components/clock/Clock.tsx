'use client'

import { useLocale, useTranslations } from 'next-intl'
import { memo } from 'react'

import { defaultLocale, localeTimeZones, locales, type Locale } from '@/lib'
import { useTime } from '@/lib/hooks'

import { DateDisplay } from './DateDisplay'
import { TimeDisplay } from './TimeDisplay'

const LOADING_PLACEHOLDER = '--:--:--'

export const Clock = memo(function Clock() {
  const time = useTime()
  const t = useTranslations()
  const rawLocale = useLocale()
  const locale: Locale = locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : defaultLocale
  const timeZone = localeTimeZones[locale]

  if (!time) {
    return (
      <div
        className="select-none text-center"
        role="status"
        aria-label={t('time.loading')}
      >
        <div
          className="text-[clamp(3.82rem,16.18vw,10rem)] font-extralight tracking-[0.02em] text-foreground-disabled"
          aria-hidden="true"
        >
          {LOADING_PLACEHOLDER}
        </div>
      </div>
    )
  }

  const timeParts = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  }).formatToParts(time.rawDate)

  const hours = timeParts.find((part) => part.type === 'hour')?.value ?? '--'
  const minutes =
    timeParts.find((part) => part.type === 'minute')?.value ?? '--'
  const seconds =
    timeParts.find((part) => part.type === 'second')?.value ?? '--'

  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone,
  }).format(time.rawDate)

  return (
    <div
      className="select-none text-center"
      role="timer"
      aria-label={t('time.ariaLabel', { hours, minutes, seconds })}
    >
      <div className="mb-[1.618rem] flex items-center justify-center gap-[1rem] text-[0.618rem] font-medium uppercase tracking-[0.236em] text-foreground-muted sm:mb-[2.618rem] sm:text-[0.7rem]">
        <span className="h-px w-[2.618rem] bg-border sm:w-[3.82rem]" />
        <span>{timeZone.replace('_', ' ')}</span>
        <span className="h-px w-[2.618rem] bg-border sm:w-[3.82rem]" />
      </div>
      <TimeDisplay hours={hours} minutes={minutes} seconds={seconds} />
      <DateDisplay date={formattedDate} />
    </div>
  )
})

Clock.displayName = 'Clock'
