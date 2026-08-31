import { getTranslations } from 'next-intl/server'

import { HomeUtilityMenu } from '@/components/layout/HomeUtilityMenu'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Clock } from '@/features/clock'
import { serializeJsonLd } from '@/lib'
import { getSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <main className="relative isolate flex min-h-[100svh] overflow-hidden bg-background">
        <div className="clock-ambient pointer-events-none absolute inset-0" />
        <div className="golden-guides pointer-events-none absolute inset-0 opacity-70" />
        <div className="clock-grid pointer-events-none absolute inset-0 opacity-25" />
        <div className="clock-orbit clock-orbit-outer pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="clock-orbit clock-orbit-inner pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <h1 className="sr-only">{t('title')}</h1>
        <p className="sr-only">{t('description')}</p>

        <header className="absolute left-[var(--layout-gutter)] top-[var(--layout-gutter)] z-20">
          <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-foreground-muted sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_1rem_hsl(var(--color-accent)/0.75)]" />
            {t('appName')}
          </p>
        </header>

        <HomeUtilityMenu />

        <section className="clock-stage relative z-10 flex w-full flex-col items-center justify-center px-[var(--layout-stage-gutter)] py-[clamp(7rem,14.6vh,9rem)]">
          <div className="clock-enter">
            <ErrorBoundary>
              <Clock />
            </ErrorBoundary>
          </div>
        </section>
      </main>
    </>
  )
}
