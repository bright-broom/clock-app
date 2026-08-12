import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'

import { defaultLocale, type Locale } from '@/lib'

import deMessages from '../../messages/de.json'
import enMessages from '../../messages/en.json'
import esMessages from '../../messages/es.json'
import frMessages from '../../messages/fr.json'
import hiMessages from '../../messages/hi.json'
import jaMessages from '../../messages/ja.json'
import ptMessages from '../../messages/pt.json'

const messages: Record<Locale, typeof jaMessages> = {
  ja: jaMessages,
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
  fr: frMessages,
  de: deMessages,
  hi: hiMessages,
}

type IntlWrapperProps = {
  children: ReactNode
  locale?: Locale
}

export function IntlWrapper({
  children,
  locale = defaultLocale,
}: IntlWrapperProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}
