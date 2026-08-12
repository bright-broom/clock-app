'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

type Props = {
  date: string
}

export const DateDisplay = memo(function DateDisplay({ date }: Props) {
  const t = useTranslations('date')

  return (
    <p
      role="status"
      aria-label={`${t('todaysDate')} ${date}`}
      className="mt-[2.618rem] text-[clamp(0.78rem,1.618vw,1rem)] font-normal uppercase tracking-[0.1618em] text-foreground-muted"
    >
      {date}
    </p>
  )
})
