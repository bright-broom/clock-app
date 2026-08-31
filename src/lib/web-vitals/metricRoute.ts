import { isLocale } from '../i18n'

export const metricRoutes = [
  'home',
  'timer',
  'stopwatch',
  'world-clock',
  'utc-converter',
  'time-in-city',
  'other',
] as const

export type MetricRoute = (typeof metricRoutes)[number]

export function isMetricRoute(value: unknown): value is MetricRoute {
  return (
    typeof value === 'string' && metricRoutes.some((route) => route === value)
  )
}

export function toMetricRoute(pathname: string): MetricRoute {
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0]
  if (!locale || !isLocale(locale)) {
    return 'other'
  }

  if (segments.length === 1) {
    return 'home'
  }

  switch (segments[1]) {
    case 'timer':
    case 'stopwatch':
    case 'world-clock':
    case 'utc-converter':
      return segments.length === 2 ? segments[1] : 'other'
    case 'time-in':
      return segments.length === 3 ? 'time-in-city' : 'other'
    default:
      return 'other'
  }
}
