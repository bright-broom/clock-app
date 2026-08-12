export const locales = ['ja', 'en', 'es', 'pt', 'fr', 'de', 'hi'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ja'

export const localeTimeZones: Record<Locale, string> = {
  ja: 'Asia/Tokyo',
  en: 'America/New_York',
  es: 'Europe/Madrid',
  pt: 'America/Sao_Paulo',
  fr: 'Europe/Paris',
  de: 'Europe/Berlin',
  hi: 'Asia/Kolkata',
}
