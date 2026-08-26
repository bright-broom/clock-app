import type { Metadata } from 'next'

import { defaultLocale, locales, type Locale } from '../i18n'

export function createLocalizedAlternates(
  siteUrl: string,
  locale: Locale,
  path = ''
): NonNullable<Metadata['alternates']> {
  const suffix = path && !path.startsWith('/') ? `/${path}` : path
  const localizedUrl = (entry: Locale) => `${siteUrl}/${entry}${suffix}`

  return {
    canonical: localizedUrl(locale),
    languages: {
      ...Object.fromEntries(
        locales.map((entry) => [entry, localizedUrl(entry)])
      ),
      'x-default': localizedUrl(defaultLocale),
    },
  }
}
