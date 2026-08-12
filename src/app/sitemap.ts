import type { MetadataRoute } from 'next'

import { locales } from '@/lib'
import { getSiteUrl } from '@/lib/site'
import { cityTimeZones } from '@/lib/timezones'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()

  const baseUrls = locales.flatMap((locale) => [
    {
      url: `${siteUrl}/${locale}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: locale === 'ja' ? 1 : 0.9,
    },
    {
      url: `${siteUrl}/${locale}/world-clock`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/${locale}/utc-converter`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    },
  ])

  const cityUrls = locales.flatMap((locale) =>
    cityTimeZones.map((city) => ({
      url: `${siteUrl}/${locale}/time-in/${city.slug}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  )

  return [...baseUrls, ...cityUrls]
}
