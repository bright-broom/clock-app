import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { CityTimeCard } from '@/features/world-clock'
import { isLocale, locales, serializeJsonLd } from '@/lib'
import { createLocalizedAlternates } from '@/lib/seo'
import { getSiteUrl } from '@/lib/site'
import { cityTimeZones, findCityBySlug } from '@/lib/time'

type Props = {
  params: Promise<{ locale: string; city: string }>
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    cityTimeZones.map((city) => ({ locale, city: city.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, city } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const cityInfo = findCityBySlug(city)
  if (!cityInfo) {
    return {}
  }

  const t = await getTranslations({ locale, namespace: 'seoPages.timeInCity' })
  const cityName = cityInfo.names[locale] ?? cityInfo.names.en
  const title = t('title', { city: cityName })
  const description = t('description', {
    city: cityName,
    timezone: cityInfo.timeZone,
  })

  return {
    title,
    description,
    alternates: createLocalizedAlternates(
      getSiteUrl(),
      locale,
      `/time-in/${city}`
    ),
  }
}

export default async function TimeInCityPage({ params }: Props) {
  const { locale, city } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const cityInfo = findCityBySlug(city)
  if (!cityInfo) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'seoPages.timeInCity' })
  const cityName = cityInfo.names[locale] ?? cityInfo.names.en
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('title', { city: cityName }),
    description: t('description', {
      city: cityName,
      timezone: cityInfo.timeZone,
    }),
    inLanguage: locale,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ToolPageShell
        backHref={`/${locale}/world-clock`}
        backLabel={t('backToWorldClock')}
        heading={t('heading', { city: cityName })}
        description={t('description', {
          city: cityName,
          timezone: cityInfo.timeZone,
        })}
      >
        <CityTimeCard locale={locale} timeZone={cityInfo.timeZone} />
      </ToolPageShell>
    </>
  )
}
