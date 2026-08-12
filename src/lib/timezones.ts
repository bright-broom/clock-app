import type { Locale } from './i18n'

export type CityTimeZone = {
  slug: string
  timeZone: string
  names: Record<Locale, string>
}

export const cityTimeZones: CityTimeZone[] = [
  {
    slug: 'tokyo',
    timeZone: 'Asia/Tokyo',
    names: {
      ja: '東京',
      en: 'Tokyo',
      es: 'Tokio',
      pt: 'Tóquio',
      fr: 'Tokyo',
      de: 'Tokio',
      hi: 'टोक्यो',
    },
  },
  {
    slug: 'new-york',
    timeZone: 'America/New_York',
    names: {
      ja: 'ニューヨーク',
      en: 'New York',
      es: 'Nueva York',
      pt: 'Nova York',
      fr: 'New York',
      de: 'New York',
      hi: 'न्यूयॉर्क',
    },
  },
  {
    slug: 'london',
    timeZone: 'Europe/London',
    names: {
      ja: 'ロンドン',
      en: 'London',
      es: 'Londres',
      pt: 'Londres',
      fr: 'Londres',
      de: 'London',
      hi: 'लंदन',
    },
  },
  {
    slug: 'paris',
    timeZone: 'Europe/Paris',
    names: {
      ja: 'パリ',
      en: 'Paris',
      es: 'París',
      pt: 'Paris',
      fr: 'Paris',
      de: 'Paris',
      hi: 'पेरिस',
    },
  },
  {
    slug: 'berlin',
    timeZone: 'Europe/Berlin',
    names: {
      ja: 'ベルリン',
      en: 'Berlin',
      es: 'Berlín',
      pt: 'Berlim',
      fr: 'Berlin',
      de: 'Berlin',
      hi: 'बर्लिन',
    },
  },
  {
    slug: 'sao-paulo',
    timeZone: 'America/Sao_Paulo',
    names: {
      ja: 'サンパウロ',
      en: 'Sao Paulo',
      es: 'Sao Paulo',
      pt: 'São Paulo',
      fr: 'Sao Paulo',
      de: 'Sao Paulo',
      hi: 'साओ पाउलो',
    },
  },
  {
    slug: 'madrid',
    timeZone: 'Europe/Madrid',
    names: {
      ja: 'マドリード',
      en: 'Madrid',
      es: 'Madrid',
      pt: 'Madri',
      fr: 'Madrid',
      de: 'Madrid',
      hi: 'मैड्रिड',
    },
  },
  {
    slug: 'mumbai',
    timeZone: 'Asia/Kolkata',
    names: {
      ja: 'ムンバイ',
      en: 'Mumbai',
      es: 'Bombay',
      pt: 'Mumbai',
      fr: 'Mumbai',
      de: 'Mumbai',
      hi: 'मुंबई',
    },
  },
  {
    slug: 'sydney',
    timeZone: 'Australia/Sydney',
    names: {
      ja: 'シドニー',
      en: 'Sydney',
      es: 'Sídney',
      pt: 'Sydney',
      fr: 'Sydney',
      de: 'Sydney',
      hi: 'सिडनी',
    },
  },
  {
    slug: 'singapore',
    timeZone: 'Asia/Singapore',
    names: {
      ja: 'シンガポール',
      en: 'Singapore',
      es: 'Singapur',
      pt: 'Singapura',
      fr: 'Singapour',
      de: 'Singapur',
      hi: 'सिंगापुर',
    },
  },
]

export function findCityBySlug(slug: string): CityTimeZone | undefined {
  return cityTimeZones.find((city) => city.slug === slug)
}
