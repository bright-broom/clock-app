import { memo } from 'react'
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export const EarthIcon = memo(function EarthIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.9 12h16.2M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5s-1.2 6.1-3.4 8.5m0-17c-2.2 2.4-3.4 5.4-3.4 8.5s1.2 6.1 3.4 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
    </svg>
  )
})
EarthIcon.displayName = 'EarthIcon'

export const MenuIcon = memo(function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="4.5" y="5" width="15" height="3" rx="1.5" fill="currentColor" />
      <rect
        x="4.5"
        y="10.5"
        width="15"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="4.5"
        y="16"
        width="15"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.78"
      />
    </svg>
  )
})
MenuIcon.displayName = 'MenuIcon'

export const CloseIcon = memo(function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
})
CloseIcon.displayName = 'CloseIcon'

export const WorldClockIcon = memo(function WorldClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.9 12h16.2M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5s-1.2 6.1-3.4 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M12 12l3.2-2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
})
WorldClockIcon.displayName = 'WorldClockIcon'

export const UtcConverterIcon = memo(function UtcConverterIcon(
  props: IconProps
) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="4"
        y="5"
        width="7.5"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="12.5"
        y="5"
        width="7.5"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.1 12h7.8M12.7 9.2l3 2.8-3 2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})
UtcConverterIcon.displayName = 'UtcConverterIcon'

export const CityTimeIcon = memo(function CityTimeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 20s6-4.6 6-9.1A6 6 0 0 0 6 10.9C6 15.4 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10.5"
        r="2.4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 10.5V9.2m0 1.3 1 0.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})
CityTimeIcon.displayName = 'CityTimeIcon'
