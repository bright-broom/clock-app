import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { HomeUtilityMenu, WorldClockList } from '@/components'
import { locales, type Locale } from '@/lib'
import { getSiteUrl } from '@/lib/site'

type Props = {
  params: { locale: Locale }
}

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seoPages.worldClock' })
  const siteUrl = getSiteUrl()

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/world-clock`,
    },
  }
}

export default async function WorldClockPage({ params: { locale } }: Props) {
  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'seoPages.worldClock' })

  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.1),transparent_42%)]" />
      <HomeUtilityMenu />
      <section className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-[1.5rem] border border-border bg-background-overlay p-6 backdrop-blur-[2px] sm:p-8">
          <nav className="mb-5 text-sm text-foreground-muted">
            <Link
              href={`/${locale}`}
              className="inline-flex rounded-full border border-border px-3 py-1 transition-colors hover:bg-background-overlay-strong hover:text-foreground"
            >
              {t('backToHome')}
            </Link>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t('heading')}
          </h1>
          <p className="mt-3 max-w-3xl text-foreground-muted">
            {t('description')}
          </p>
          <section className="mt-8">
            <WorldClockList locale={locale} />
          </section>
        </div>
      </section>
    </main>
  )
}
