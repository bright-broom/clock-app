import { describe, expect, it } from 'vitest'

import {
  formatDateInZone,
  formatDateTimeInZone,
  formatTimeInZone,
  formatTimePartsInZone,
} from './formatTime'

describe('time-zone formatting', () => {
  const instant = new Date('2024-01-15T01:30:45.000Z')

  it('formats time and parts in the requested zone', () => {
    expect(formatTimeInZone(instant, 'ja', 'Asia/Tokyo')).toBe('10:30:45')
    expect(formatTimePartsInZone(instant, 'ja', 'Asia/Tokyo')).toEqual({
      hours: '10',
      minutes: '30',
      seconds: '45',
    })
  })

  it('formats dates with short and long weekdays', () => {
    expect(formatDateInZone(instant, 'en', 'America/New_York')).toBe(
      'Sun, January 14, 2024'
    )
    expect(formatDateInZone(instant, 'en', 'America/New_York', 'long')).toBe(
      'Sunday, January 14, 2024'
    )
  })

  it('formats a complete local date-time for conversions', () => {
    expect(formatDateTimeInZone(instant, 'en', 'Europe/London')).toContain(
      'Jan 15, 2024'
    )
    expect(formatDateTimeInZone(instant, 'en', 'Europe/London')).toContain(
      '01:30:45'
    )
  })
})
