import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { Stopwatch } from '@/features/stopwatch'
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

  const t = await getTranslations({ locale, namespace: 'seoPages.stopwatch' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: createLocalizedAlternates(getSiteUrl(), locale, '/stopwatch'),
  }
}

export default async function StopwatchPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'seoPages.stopwatch' })

  return (
    <ToolPageShell
      backHref={`/${locale}`}
      backLabel={t('backToHome')}
      heading={t('heading')}
      layout="focused"
    >
      <Stopwatch />
    </ToolPageShell>
  )
}
