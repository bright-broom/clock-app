import { memo } from 'react'

type Props = {
  seconds: string
}

export const SecondsDisplay = memo(
  function SecondsDisplay({ seconds }: Props) {
    return (
      <span
        className="absolute left-full top-[0.04em] ml-[0.236em] rounded-[0.382em] border border-border bg-background-overlay px-[0.382em] py-[0.236em] text-[0.236em] font-normal tabular-nums tracking-[0.032em] text-foreground-muted backdrop-blur-md"
        aria-hidden="true"
      >
        {seconds}
      </span>
    )
  },
  (prev, next) => prev.seconds === next.seconds
)
