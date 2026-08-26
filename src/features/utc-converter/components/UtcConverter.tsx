'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useState } from 'react'

import type { Locale } from '@/lib'
import { cityTimeZones, formatDateTimeInZone } from '@/lib/time'

import { parseUtcInput, toUtcInputValue } from '../model/utcDateTime'

type Props = {
  locale: Locale
}

export const UtcConverter = memo(function UtcConverter({ locale }: Props) {
  const t = useTranslations('seoPages.utcConverter')
  const [input, setInput] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    setInput(toUtcInputValue(new Date()))
  }, [])

  const utcDate = useMemo(() => parseUtcInput(input), [input])

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
        onChange={(event) => {
          setInput(event.target.value)
          setTouched(true)
        }}
        step={60}
        className="mt-2 w-full rounded-lg border border-border bg-background-overlay px-3 py-2 text-foreground outline-none transition-colors focus:border-foreground-muted"
      />
      <p className="mt-2 text-xs text-foreground-muted">{t('utcHint')}</p>

      {utcDate ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {cityTimeZones.map((city) => {
            const formatted = formatDateTimeInZone(
              utcDate,
              locale,
              city.timeZone
            )

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
      ) : touched ? (
        <p className="mt-4 text-sm text-foreground-muted">
          {t('invalidDatetime')}
        </p>
      ) : null}
    </div>
  )
})

UtcConverter.displayName = 'UtcConverter'
