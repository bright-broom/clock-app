import type { Locale } from '../i18n'

type FormatterKind = 'time' | 'date-short' | 'date-long' | 'date-time'

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(
  locale: Locale,
  timeZone: string,
  kind: FormatterKind
): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${timeZone}:${kind}`
  const cached = formatterCache.get(cacheKey)

  if (cached) {
    return cached
  }

  const options: Intl.DateTimeFormatOptions =
    kind === 'time'
      ? {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone,
        }
      : kind === 'date-time'
        ? {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone,
          }
        : {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: kind === 'date-short' ? 'short' : 'long',
            timeZone,
          }

  const formatter = new Intl.DateTimeFormat(locale, options)
  formatterCache.set(cacheKey, formatter)
  return formatter
}

export type ZonedTimeParts = {
  hours: string
  minutes: string
  seconds: string
}

export function formatTimeInZone(
  date: Date,
  locale: Locale,
  timeZone: string
): string {
  return getFormatter(locale, timeZone, 'time').format(date)
}

export function formatTimePartsInZone(
  date: Date,
  locale: Locale,
  timeZone: string
): ZonedTimeParts {
  const parts = getFormatter(locale, timeZone, 'time').formatToParts(date)

  return {
    hours: parts.find((part) => part.type === 'hour')?.value ?? '--',
    minutes: parts.find((part) => part.type === 'minute')?.value ?? '--',
    seconds: parts.find((part) => part.type === 'second')?.value ?? '--',
  }
}

export function formatDateInZone(
  date: Date,
  locale: Locale,
  timeZone: string,
  weekday: 'short' | 'long' = 'short'
): string {
  return getFormatter(
    locale,
    timeZone,
    weekday === 'short' ? 'date-short' : 'date-long'
  ).format(date)
}

export function formatDateTimeInZone(
  date: Date,
  locale: Locale,
  timeZone: string
): string {
  return getFormatter(locale, timeZone, 'date-time').format(date)
}
