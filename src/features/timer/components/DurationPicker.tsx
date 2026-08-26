'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

const PRESET_MINUTES = [1, 5, 10, 25] as const

type DurationField = 'hours' | 'minutes' | 'seconds'

type Props = {
  disabled: boolean
  durationMs: number
  onChange: (durationMs: number) => void
}

function toFields(durationMs: number): Record<DurationField, number> {
  const totalSeconds = Math.floor(durationMs / 1000)

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export const DurationPicker = memo(function DurationPicker({
  disabled,
  durationMs,
  onChange,
}: Props) {
  const t = useTranslations('timer')
  const fields = toFields(durationMs)

  const updateField = (field: DurationField, value: string) => {
    const parsed = Number(value)
    const nextValue = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
    const next = { ...fields, [field]: nextValue }
    onChange((next.hours * 3600 + next.minutes * 60 + next.seconds) * 1000)
  }

  return (
    <fieldset disabled={disabled} className="mx-auto mt-8 max-w-xl">
      <legend className="text-center text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
        {t('duration')}
      </legend>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {(['hours', 'minutes', 'seconds'] as const).map((field) => (
          <label key={field} className="grid gap-2 text-center">
            <span className="text-xs text-foreground-muted">{t(field)}</span>
            <input
              type="number"
              min={0}
              max={field === 'hours' ? 24 : 59}
              inputMode="numeric"
              value={fields[field]}
              onChange={(event) => updateField(field, event.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-border bg-background-overlay px-3 text-center font-mono text-lg text-foreground outline-none transition-colors focus:border-foreground-muted disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        ))}
      </div>

      <div
        className="mt-4 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label={t('presets')}
      >
        {PRESET_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => onChange(minutes * 60 * 1000)}
            className="min-h-[44px] rounded-full border border-border px-4 text-sm text-foreground-muted transition-colors hover:bg-background-overlay-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('presetLabel', { minutes })}
          </button>
        ))}
      </div>
    </fieldset>
  )
})

DurationPicker.displayName = 'DurationPicker'
