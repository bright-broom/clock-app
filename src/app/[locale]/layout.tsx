import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import { locales, type Locale } from '@/lib'
import { getSiteUrl } from '@/lib/site'

import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

type Props = {
  children: React.ReactNode
  params: { locale: string }
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

const LOCALE_COUNTRY_LABELS: Record<Locale, string> = {
  ja: 'Japan',
  en: 'United States',
  es: 'Spain',
  pt: 'Brazil',
  fr: 'France',
  de: 'Germany',
  hi: 'India',
}

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const siteUrl = getSiteUrl()
  const keywords = t('keywords')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
  const currentLocale = locale as Locale
  const ogLocale = OG_LOCALE_MAP[currentLocale]
  const alternateLocale = locales
    .filter((entry) => entry !== currentLocale)
    .map((entry) => OG_LOCALE_MAP[entry])
  const languageAlternates = Object.fromEntries(
    locales.map((entry) => [entry, `/${entry}`])
  )
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
  const countryLabel = LOCALE_COUNTRY_LABELS[currentLocale]

  return {
    metadataBase: new URL(siteUrl),
    applicationName: t('appName'),
    title: {
      default: `${t('title')} (${countryLabel})`,
      template: `%s (${countryLabel})`,
    },
    description: t('description'),
    keywords,
    alternates: {
      canonical: `/${locale}`,
      languages: languageAlternates,
    },
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
          url: '/opengraph-image',
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
      images: ['/opengraph-image'],
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

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
