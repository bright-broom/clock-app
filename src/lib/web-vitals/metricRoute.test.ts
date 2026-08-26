import { describe, expect, it } from 'vitest'

import { isMetricRoute, toMetricRoute } from './metricRoute'

describe('metric route classification', () => {
  it.each([
    ['/ja', 'home'],
    ['/en/timer', 'timer'],
    ['/fr/world-clock', 'world-clock'],
    ['/de/utc-converter', 'utc-converter'],
    ['/pt/time-in/sao-paulo', 'time-in-city'],
  ] as const)('maps %s to %s', (pathname, expected) => {
    expect(toMetricRoute(pathname)).toBe(expected)
  })

  it.each(['/unknown', '/ja/private/value', '/ja/timer/unexpected'])(
    'does not expose an unrecognized path: %s',
    (pathname) => expect(toMetricRoute(pathname)).toBe('other')
  )

  it('validates only supported route identifiers', () => {
    expect(isMetricRoute('timer')).toBe(true)
    expect(isMetricRoute('/ja/timer')).toBe(false)
  })
})
