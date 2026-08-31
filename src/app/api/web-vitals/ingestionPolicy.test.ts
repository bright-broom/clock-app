import { describe, expect, it } from 'vitest'

import {
  createFixedWindowRateLimiter,
  isWebVitalsIngestionEnabled,
} from './ingestionPolicy'

describe('web vitals ingestion policy', () => {
  it('fails closed in production until the release gate enables ingestion', () => {
    expect(isWebVitalsIngestionEnabled({ NODE_ENV: 'production' })).toBe(false)
    expect(
      isWebVitalsIngestionEnabled({
        NODE_ENV: 'production',
        WEB_VITALS_INGESTION_ENABLED: 'true',
      })
    ).toBe(true)
    expect(
      isWebVitalsIngestionEnabled({
        NODE_ENV: 'production',
        WEB_VITALS_INGESTION_ENABLED: 'TRUE',
      })
    ).toBe(false)
  })

  it('allows local verification unless explicitly disabled', () => {
    expect(isWebVitalsIngestionEnabled({ NODE_ENV: 'test' })).toBe(true)
    expect(
      isWebVitalsIngestionEnabled({
        NODE_ENV: 'development',
        WEB_VITALS_INGESTION_ENABLED: 'false',
      })
    ).toBe(false)
  })

  it('rejects excess work and recovers in a new window', () => {
    const limiter = createFixedWindowRateLimiter(2, 1000)

    expect(limiter.tryConsume(1000).allowed).toBe(true)
    expect(limiter.tryConsume(1100).allowed).toBe(true)
    expect(limiter.tryConsume(1200)).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    })
    expect(limiter.tryConsume(2000).allowed).toBe(true)
  })

  it('rejects invalid limiter policy values', () => {
    expect(() => createFixedWindowRateLimiter(0, 1000)).toThrow(RangeError)
    expect(() => createFixedWindowRateLimiter(1, Number.NaN)).toThrow(
      RangeError
    )
  })
})
