import { describe, expect, it } from 'vitest'

import { cityTimeZones, findCityBySlug } from './timeZones'

describe('city time-zone catalog', () => {
  it('has unique slugs and valid IANA time zones', () => {
    const slugs = cityTimeZones.map((city) => city.slug)

    expect(new Set(slugs).size).toBe(slugs.length)

    for (const city of cityTimeZones) {
      expect(
        () => new Intl.DateTimeFormat('en', { timeZone: city.timeZone })
      ).not.toThrow()
    }
  })

  it('finds known cities and rejects unknown slugs', () => {
    expect(findCityBySlug('tokyo')?.timeZone).toBe('Asia/Tokyo')
    expect(findCityBySlug('../tokyo')).toBeUndefined()
    expect(findCityBySlug('unknown')).toBeUndefined()
  })
})
