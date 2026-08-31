import type { MetadataRoute } from 'next'

import { locales } from '@/lib'
import { getSiteUrl } from '@/lib/site'
import { cityTimeZones } from '@/lib/time'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()

  const baseUrls = locales.flatMap((locale) => [
    {
      url: `${siteUrl}/${locale}`,
      changeFrequency: 'daily' as const,
      priority: locale === 'ja' ? 1 : 0.9,
    },
    {
      url: `${siteUrl}/${locale}/world-clock`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/${locale}/utc-converter`,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    },
    {
      url: `${siteUrl}/${locale}/timer`,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    },
    {
      url: `${siteUrl}/${locale}/stopwatch`,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    },
  ])

  const cityUrls = locales.flatMap((locale) =>
    cityTimeZones.map((city) => ({
      url: `${siteUrl}/${locale}/time-in/${city.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  )

  return [...baseUrls, ...cityUrls]
}
