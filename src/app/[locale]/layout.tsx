import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import {
  COLOR_THEME_BOOTSTRAP_SCRIPT,
  DEFAULT_COLOR_THEME,
} from '@/components/theme/model/colorTheme'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TimerRuntime } from '@/features/timer'
import { isLocale, locales, type Locale } from '@/lib'
import { createLocalizedAlternates } from '@/lib/seo'
import { getSiteUrl } from '@/lib/site'
import { WebVitals } from '@/lib/web-vitals'

import '@/components/theme/theme.css'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const OG_LOCALE_MAP: Record<Locale, string> = {
  ja: 'ja_JP',
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
  hi: 'hi_IN',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata' })
  const siteUrl = getSiteUrl()
  const keywords = t('keywords')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
  const ogLocale = OG_LOCALE_MAP[locale]
  const alternateLocale = locales
    .filter((entry) => entry !== locale)
    .map((entry) => OG_LOCALE_MAP[entry])
  const googleSiteVerification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  const bingSiteVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
  const verification = {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    ...(bingSiteVerification
      ? {
          other: {
            'msvalidate.01': bingSiteVerification,
          },
        }
      : {}),
  }
  return {
    metadataBase: new URL(siteUrl),
    applicationName: t('appName'),
    title: {
      default: t('title'),
      template: `%s | ${t('appName')}`,
    },
    description: t('description'),
    keywords,
    alternates: createLocalizedAlternates(siteUrl, locale),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      siteName: t('siteName'),
      locale: ogLocale,
      alternateLocale,
      type: 'website',
      images: [
        {
          url: `${siteUrl}/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${siteUrl}/${locale}/opengraph-image`],
    },
    verification,
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={inter.variable}
      data-color-theme={DEFAULT_COLOR_THEME}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: COLOR_THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <TimerRuntime />
            <WebVitals />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
