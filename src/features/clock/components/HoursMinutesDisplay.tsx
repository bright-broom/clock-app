import { memo } from 'react'

type Props = {
  hours: string
  minutes: string
}

export const HoursMinutesDisplay = memo(
  function HoursMinutesDisplay({ hours, minutes }: Props) {
    return (
      <span className="inline-flex items-baseline">
        <span className="tabular-nums">{hours}</span>
        <span
          className="colon-pulse gpu-accelerated mx-[0.05em] translate-y-[-0.1em]"
          aria-hidden="true"
        >
          :
        </span>
        <span className="tabular-nums">{minutes}</span>
      </span>
    )
  },
  (prev, next) => prev.hours === next.hours && prev.minutes === next.minutes
)
