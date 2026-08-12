'use client'

import { useTranslations } from 'next-intl'
import { memo, useMemo, useState } from 'react'

import type { Locale } from '@/lib'
import { cityTimeZones } from '@/lib/timezones'

type Props = {
  locale: Locale
}

function toInputValue(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export const UtcConverter = memo(function UtcConverter({ locale }: Props) {
  const t = useTranslations('seoPages.utcConverter')
  const [input, setInput] = useState<string>(toInputValue(new Date()))

  const utcDate = useMemo(() => {
    const parsed = new Date(input)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [input])

  return (
    <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
      <label
        className="block text-xs uppercase tracking-wider text-foreground-muted"
        htmlFor="utc-input"
      >
        {t('utcDateTime')}
      </label>
      <input
        id="utc-input"
        type="datetime-local"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        className="mt-2 w-full rounded-lg border border-border bg-background-overlay px-3 py-2 text-foreground outline-none transition-colors focus:border-foreground-muted"
      />

      {utcDate ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {cityTimeZones.map((city) => {
            const formatted = new Intl.DateTimeFormat(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZone: city.timeZone,
            }).format(utcDate)

            return (
              <li
                key={city.slug}
                className="rounded-lg border border-border bg-background-overlay p-3"
              >
                <p className="text-sm text-foreground">{city.names[locale]}</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {city.timeZone}
                </p>
                <p className="mt-2 font-mono text-sm text-foreground">
                  {formatted}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-foreground-muted">
          {t('invalidDatetime')}
        </p>
      )}
    </div>
  )
})

UtcConverter.displayName = 'UtcConverter'
