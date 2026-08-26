'use client'

import { useLocale, useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'

import { defaultLocale, isLocale } from '@/lib'
import { formatDateInZone, formatTimePartsInZone } from '@/lib/time'
import { getBrowserTimeZone, useCurrentTime } from '@/lib/time/client'

import { DateDisplay } from './DateDisplay'
import { TimeDisplay } from './TimeDisplay'

const LOADING_PLACEHOLDER = '--:--:--'

export const Clock = memo(function Clock() {
  const currentTime = useCurrentTime()
  const t = useTranslations()
  const rawLocale = useLocale()
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  const timeZone = useMemo(getBrowserTimeZone, [])

  if (!currentTime) {
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

  const { hours, minutes, seconds } = formatTimePartsInZone(
    currentTime,
    locale,
    timeZone
  )
  const formattedDate = formatDateInZone(currentTime, locale, timeZone)

  return (
    <div
      className="select-none text-center"
      role="timer"
      aria-label={t('time.ariaLabel', { hours, minutes, seconds })}
    >
      <div className="mb-[1.618rem] flex items-center justify-center gap-[1rem] text-[0.618rem] font-medium uppercase tracking-[0.236em] text-foreground-muted sm:mb-[2.618rem] sm:text-[0.7rem]">
        <span className="h-px w-[2.618rem] bg-border sm:w-[3.82rem]" />
        <span>{timeZone.replaceAll('_', ' ')}</span>
        <span className="h-px w-[2.618rem] bg-border sm:w-[3.82rem]" />
      </div>
      <TimeDisplay hours={hours} minutes={minutes} seconds={seconds} />
      <DateDisplay date={formattedDate} />
    </div>
  )
})

Clock.displayName = 'Clock'
