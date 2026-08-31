'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useState } from 'react'

import type { Locale } from '@/lib'
import { cityTimeZones, formatDateTimeInZone } from '@/lib/time'

import { parseUtcInput, toUtcInputValue } from '../model/utcDateTime'

type Props = {
  locale: Locale
}

const RESULT_GRID_CLASS =
  'mt-[1.618rem] grid gap-[0.618rem] sm:grid-cols-2 sm:gap-3'
const RESULT_CARD_CLASS =
  'rounded-xl border border-border bg-background-overlay p-3'

export const UtcConverter = memo(function UtcConverter({ locale }: Props) {
  const t = useTranslations('seoPages.utcConverter')
  const [input, setInput] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    setInput(toUtcInputValue(new Date()))
  }, [])

  const utcDate = useMemo(() => parseUtcInput(input), [input])

  return (
    <div
      className="rounded-[var(--layout-card-radius)] border border-border bg-background p-[clamp(1rem,2.36vw,1.618rem)]"
      aria-busy={!input && !touched}
    >
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
        className="mt-2 min-h-[44px] w-full rounded-xl border border-border bg-background-overlay px-3 py-2 text-foreground outline-none transition-colors focus:border-foreground-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <p className="mt-2 text-xs text-foreground-muted">{t('utcHint')}</p>

      {utcDate ? (
        <ul className={RESULT_GRID_CLASS}>
          {cityTimeZones.map((city) => {
            const formatted = formatDateTimeInZone(
              utcDate,
              locale,
              city.timeZone
            )

            return (
              <li key={city.slug} className={RESULT_CARD_CLASS}>
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
      ) : !touched ? (
        <ul className={RESULT_GRID_CLASS} aria-hidden="true">
          {cityTimeZones.map((city) => (
            <li
              key={city.slug}
              className={`${RESULT_CARD_CLASS} animate-pulse`}
            >
              <span className="block h-5 w-[38.2%] rounded-full bg-background-overlay-strong" />
              <span className="mt-1 block h-4 w-[61.8%] rounded-full bg-background-overlay-strong" />
              <span className="mt-2 block h-5 w-[76.4%] rounded-full bg-background-overlay-strong" />
            </li>
          ))}
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
