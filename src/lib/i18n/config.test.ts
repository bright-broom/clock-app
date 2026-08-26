import { describe, expect, it } from 'vitest'

import { isLocale, locales } from './config'

describe('locale configuration', () => {
  it.each(locales)('accepts configured locale %s', (locale) => {
    expect(isLocale(locale)).toBe(true)
  })

  it.each(['', 'jp', 'EN', '../ja', 'ja-JP'])(
    'rejects unsupported locale %s',
    (locale) => expect(isLocale(locale)).toBe(false)
  )
})
