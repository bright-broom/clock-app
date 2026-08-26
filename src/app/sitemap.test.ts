import { afterEach, describe, expect, it, vi } from 'vitest'

import { locales } from '@/lib'
import { cityTimeZones } from '@/lib/time'

import sitemap from './sitemap'

describe('sitemap', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('contains every localized tool and city URL without fabricated dates', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://clock.example')

    const entries = sitemap()
    const expectedCount = locales.length * (4 + cityTimeZones.length)

    expect(entries).toHaveLength(expectedCount)
    expect(entries).toContainEqual(
      expect.objectContaining({ url: 'https://clock.example/ja/timer' })
    )
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: 'https://clock.example/en/time-in/tokyo',
      })
    )
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(
      true
    )
  })
})
