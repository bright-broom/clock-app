import { getTranslations } from 'next-intl/server'

import { Clock, ErrorBoundary, HomeUtilityMenu } from '@/components'
import { getSiteUrl } from '@/lib/site'
import { WebVitals } from '@/lib/web-vitals'

type Props = {
  params: { locale: string }
}

export default async function Home({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}/${locale}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('appName'),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    url: pageUrl,
    inLanguage: locale,
    description: t('description'),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative flex min-h-screen items-center justify-center bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.1),transparent_42%)]" />
        <WebVitals />
        <h1 className="sr-only">{t('title')}</h1>
        <p className="sr-only">{t('description')}</p>
        <HomeUtilityMenu />
        <ErrorBoundary>
          <Clock />
        </ErrorBoundary>
      </main>
    </>
  )
}
