import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { Timer } from '@/features/timer'
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

  const t = await getTranslations({ locale, namespace: 'seoPages.timer' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: createLocalizedAlternates(getSiteUrl(), locale, '/timer'),
  }
}

export default async function TimerPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'seoPages.timer' })

  return (
    <ToolPageShell
      backHref={`/${locale}`}
      backLabel={t('backToHome')}
      heading={t('heading')}
      layout="focused"
    >
      <Timer />
    </ToolPageShell>
  )
}
