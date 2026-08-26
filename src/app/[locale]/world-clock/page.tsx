import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { WorldClockList } from '@/features/world-clock'
import { isLocale } from '@/lib'
import { createLocalizedAlternates } from '@/lib/seo'
import { getSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'seoPages.worldClock' })
  const siteUrl = getSiteUrl()

  return {
    title: t('title'),
    description: t('description'),
    alternates: createLocalizedAlternates(siteUrl, locale, '/world-clock'),
  }
}

export default async function WorldClockPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'seoPages.worldClock' })

  return (
    <ToolPageShell
      backHref={`/${locale}`}
      backLabel={t('backToHome')}
      heading={t('heading')}
      description={t('description')}
    >
      <WorldClockList locale={locale} />
    </ToolPageShell>
  )
}
