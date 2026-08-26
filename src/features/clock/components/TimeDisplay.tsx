'use client'

import { memo } from 'react'

import { HoursMinutesDisplay } from './HoursMinutesDisplay'
import { SecondsDisplay } from './SecondsDisplay'

type Props = {
  hours: string
  minutes: string
  seconds: string
}

export const TimeDisplay = memo(function TimeDisplay({
  hours,
  minutes,
  seconds,
}: Props) {
  return (
    <div className="relative inline-flex items-baseline text-[clamp(4rem,16.18vw,10rem)] font-extralight leading-[0.82] tracking-[-0.045em] text-foreground drop-shadow-glow will-change-contents">
      <HoursMinutesDisplay hours={hours} minutes={minutes} />
      <SecondsDisplay seconds={seconds} />
    </div>
  )
})
