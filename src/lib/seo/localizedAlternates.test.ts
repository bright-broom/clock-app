import { describe, expect, it } from 'vitest'

import { createLocalizedAlternates } from './localizedAlternates'

describe('createLocalizedAlternates', () => {
  it('builds canonical and language-equivalent URLs', () => {
    expect(
      createLocalizedAlternates('https://clock.example', 'en', '/time-in/tokyo')
    ).toEqual({
      canonical: 'https://clock.example/en/time-in/tokyo',
      languages: {
        ja: 'https://clock.example/ja/time-in/tokyo',
        en: 'https://clock.example/en/time-in/tokyo',
        es: 'https://clock.example/es/time-in/tokyo',
        pt: 'https://clock.example/pt/time-in/tokyo',
        fr: 'https://clock.example/fr/time-in/tokyo',
        de: 'https://clock.example/de/time-in/tokyo',
        hi: 'https://clock.example/hi/time-in/tokyo',
        'x-default': 'https://clock.example/ja/time-in/tokyo',
      },
    })
  })

  it('normalizes a path without a leading slash', () => {
    expect(
      createLocalizedAlternates('https://clock.example', 'ja', 'timer')
        .canonical
    ).toBe('https://clock.example/ja/timer')
  })
})
