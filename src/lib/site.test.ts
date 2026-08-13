import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSiteUrl } from './site'

describe('getSiteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses and normalizes the configured HTTPS origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://clock.example/')

    expect(getSiteUrl()).toBe('https://clock.example')
  })

  it('rejects unsafe or path-based public URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://clock.example/path')

    expect(() => getSiteUrl()).toThrow(
      'NEXT_PUBLIC_SITE_URL must use HTTPS outside local development'
    )
  })

  it('requires an explicit canonical origin in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_URL', 'untrusted-preview.vercel.app')

    expect(() => getSiteUrl()).toThrow(
      'NEXT_PUBLIC_SITE_URL is required for production builds'
    )
  })

  it('uses localhost only outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')

    expect(getSiteUrl()).toBe('http://localhost:3000')
  })
})
