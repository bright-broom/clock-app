import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import {
  Clock,
  ErrorBoundary,
  HomeUtilityMenu,
  UtcConverterIcon,
  WorldClockIcon,
} from '@/components'
import { serializeJsonLd } from '@/lib'
import { getSiteUrl } from '@/lib/site'
import { WebVitals } from '@/lib/web-vitals'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const tHome = await getTranslations({ locale, namespace: 'seoPages.home' })
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
        <div className="clock-grid pointer-events-none absolute inset-0 opacity-35" />
        <div className="clock-orbit clock-orbit-outer pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="clock-orbit clock-orbit-inner pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <WebVitals />
        <h1 className="sr-only">{t('title')}</h1>
        <p className="sr-only">{t('description')}</p>

        <header className="absolute left-[clamp(1.236rem,2.36vw,2.618rem)] top-[clamp(1.236rem,2.36vw,2.618rem)] z-20">
          <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-foreground-muted sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-foreground shadow-[0_0_1rem_hsl(var(--color-fg-primary)/0.75)]" />
            {t('appName')}
          </p>
        </header>

        <HomeUtilityMenu showTools={false} />

        <section className="clock-stage relative z-10 flex w-full flex-col items-center justify-center px-[clamp(1.5rem,3.82vw,3.82rem)] pb-[clamp(10rem,23.6vh,14rem)] pt-[clamp(7rem,14.6vh,9rem)]">
          <div className="clock-enter">
            <ErrorBoundary>
              <Clock />
            </ErrorBoundary>
          </div>
        </section>

        <nav
          className="tool-nav absolute bottom-[clamp(1.5rem,3.82vh,3.82rem)] left-1/2 z-20 grid w-[min(calc(100%-2rem),42rem)] -translate-x-1/2 grid-cols-2 gap-[0.618rem]"
          aria-label={tHome('heading')}
        >
          <Link
            href={`/${locale}/world-clock`}
            className="tool-card group flex min-h-[6.18rem] items-center gap-[1rem] rounded-[1.618rem] border border-border bg-background-overlay px-[1.236rem] backdrop-blur-xl transition-[background-color,border-color,transform] hover:-translate-y-[0.236rem] hover:border-foreground-muted hover:bg-background-overlay-strong motion-reduce:transform-none motion-reduce:transition-none sm:px-[1.618rem]"
          >
            <span className="hidden h-[3.82rem] w-[3.82rem] shrink-0 place-items-center rounded-[1rem] border border-border bg-background text-foreground-muted transition-colors group-hover:text-foreground min-[400px]:grid">
              <WorldClockIcon className="h-[1.382rem] w-[1.382rem]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {tHome('worldClock')}
              </span>
              <span className="mt-[0.382rem] hidden text-[0.618rem] uppercase tracking-[0.1618em] text-foreground-muted sm:block">
                01 / 02
              </span>
            </span>
          </Link>

          <Link
            href={`/${locale}/utc-converter`}
            className="tool-card group flex min-h-[6.18rem] items-center gap-[1rem] rounded-[1.618rem] border border-border bg-background-overlay px-[1.236rem] backdrop-blur-xl transition-[background-color,border-color,transform] hover:-translate-y-[0.236rem] hover:border-foreground-muted hover:bg-background-overlay-strong motion-reduce:transform-none motion-reduce:transition-none sm:px-[1.618rem]"
          >
            <span className="hidden h-[3.82rem] w-[3.82rem] shrink-0 place-items-center rounded-[1rem] border border-border bg-background text-foreground-muted transition-colors group-hover:text-foreground min-[400px]:grid">
              <UtcConverterIcon className="h-[1.382rem] w-[1.382rem]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {tHome('utcConverter')}
              </span>
              <span className="mt-[0.382rem] hidden text-[0.618rem] uppercase tracking-[0.1618em] text-foreground-muted sm:block">
                02 / 02
              </span>
            </span>
          </Link>
        </nav>
      </main>
    </>
  )
}
