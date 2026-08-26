import { afterEach, describe, expect, it, vi } from 'vitest'

import { getBrowserTimeZone } from './browserTimeZone'

describe('getBrowserTimeZone', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses the browser-resolved time zone', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      locale: 'ja-JP',
      calendar: 'gregory',
      numberingSystem: 'latn',
      timeZone: 'Asia/Tokyo',
    })

    expect(getBrowserTimeZone()).toBe('Asia/Tokyo')
  })

  it('falls back to UTC when resolution is unavailable', () => {
    vi.spyOn(
      Intl.DateTimeFormat.prototype,
      'resolvedOptions'
    ).mockImplementation(() => {
      throw new Error('unavailable')
    })

    expect(getBrowserTimeZone()).toBe('UTC')
  })
})
