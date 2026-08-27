'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef, useState } from 'react'

const PRESET_MINUTES = [1, 5, 10, 25] as const
const DURATION_FIELDS = ['hours', 'minutes', 'seconds'] as const
const MAX_FIELD_VALUE = {
  hours: 24,
  minutes: 59,
  seconds: 59,
} as const

type DurationField = (typeof DURATION_FIELDS)[number]

type Props = {
  disabled: boolean
  durationMs: number
  onChange: (durationMs: number) => void
}

type DurationFieldInputProps = {
  disabled: boolean
  field: DurationField
  label: string
  onChange: (value: number) => void
  value: number
}

function clampFieldValue(field: DurationField, value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(MAX_FIELD_VALUE[field], Math.max(0, Math.trunc(value)))
}

function toFields(durationMs: number): Record<DurationField, number> {
  const totalSeconds = Math.floor(durationMs / 1000)

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function StepArrow({ direction }: { direction: 'down' | 'up' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === 'up' ? 'm5 15 7-7 7 7' : 'm5 9 7 7 7-7'} />
    </svg>
  )
}

const DurationFieldInput = memo(function DurationFieldInput({
  disabled,
  field,
  label,
  onChange,
  value,
}: DurationFieldInputProps) {
  const t = useTranslations('timer')
  const [draft, setDraft] = useState(String(value))
  const editingRef = useRef(false)

  useEffect(() => {
    if (!editingRef.current) {
      setDraft(String(value))
    }
  }, [value])

  const commit = (nextValue: number) => {
    const normalized = clampFieldValue(field, nextValue)
    setDraft(String(normalized))
    onChange(normalized)
  }

  return (
    <div className="min-w-0 text-center">
      <label
        htmlFor={`timer-duration-${field}`}
        className="text-xs text-foreground-muted"
      >
        {label}
      </label>
      <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_2.8125rem] overflow-hidden rounded-xl border border-border bg-background-overlay transition-colors focus-within:border-foreground-muted">
        <input
          id={`timer-duration-${field}`}
          type="number"
          min={0}
          max={MAX_FIELD_VALUE[field]}
          step={1}
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={draft}
          onFocus={(event) => {
            editingRef.current = true
            event.currentTarget.select()
          }}
          onBlur={() => {
            editingRef.current = false
            if (draft === '') {
              commit(0)
            } else {
              setDraft(String(value))
            }
          }}
          onChange={(event) => {
            const rawValue = event.target.value
            if (rawValue === '') {
              setDraft('')
              return
            }

            if (!/^\d+$/.test(rawValue)) {
              return
            }

            commit(Number.parseInt(rawValue, 10))
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              commit(value + 1)
            } else if (event.key === 'ArrowDown') {
              event.preventDefault()
              commit(value - 1)
            }
          }}
          onWheel={(event) => event.currentTarget.blur()}
          className="h-[5.5rem] w-full min-w-0 bg-transparent px-1 text-center font-mono text-[clamp(1.5rem,7vw,2.25rem)] text-foreground outline-none [appearance:textfield] disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <div className="grid grid-rows-2 border-l border-border">
          <button
            type="button"
            disabled={disabled || value >= MAX_FIELD_VALUE[field]}
            aria-label={t('increaseField', { field: label })}
            onClick={() => commit(value + 1)}
            className="focus-visible:outline-inset grid min-h-[44px] touch-manipulation place-items-center text-foreground-muted transition-colors hover:bg-background-overlay-strong hover:text-foreground focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-25"
          >
            <StepArrow direction="up" />
          </button>
          <button
            type="button"
            disabled={disabled || value <= 0}
            aria-label={t('decreaseField', { field: label })}
            onClick={() => commit(value - 1)}
            className="focus-visible:outline-inset grid min-h-[44px] touch-manipulation place-items-center border-t border-border text-foreground-muted transition-colors hover:bg-background-overlay-strong hover:text-foreground focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-25"
          >
            <StepArrow direction="down" />
          </button>
        </div>
      </div>
    </div>
  )
})

DurationFieldInput.displayName = 'DurationFieldInput'

export const DurationPicker = memo(function DurationPicker({
  disabled,
  durationMs,
  onChange,
}: Props) {
  const t = useTranslations('timer')
  const fields = toFields(durationMs)

  const updateField = (field: DurationField, value: number) => {
    const next = { ...fields, [field]: clampFieldValue(field, value) }
    onChange((next.hours * 3600 + next.minutes * 60 + next.seconds) * 1000)
  }

  return (
    <fieldset disabled={disabled} className="w-full">
      <legend className="text-center text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
        {t('duration')}
      </legend>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {DURATION_FIELDS.map((field) => (
          <DurationFieldInput
            key={field}
            disabled={disabled}
            field={field}
            label={t(field)}
            value={fields[field]}
            onChange={(value) => updateField(field, value)}
          />
        ))}
      </div>

      <div
        className="mt-3 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label={t('presets')}
      >
        {PRESET_MINUTES.map((minutes) => {
          const presetMs = minutes * 60 * 1000
          const selected = durationMs === presetMs

          return (
            <button
              key={minutes}
              type="button"
              onClick={() => onChange(presetMs)}
              aria-pressed={selected}
              className={`min-h-[44px] touch-manipulation rounded-full border px-4 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-foreground-muted hover:bg-background-overlay-strong hover:text-foreground'
              }`}
            >
              {t('presetLabel', { minutes })}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
})

DurationPicker.displayName = 'DurationPicker'
