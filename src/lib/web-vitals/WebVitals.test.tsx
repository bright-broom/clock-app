import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Metric } from 'web-vitals'

import { WebVitals } from './WebVitals'

vi.mock('next/navigation', () => ({
  usePathname: () => '/ja/timer',
}))

const metric: Metric = {
  name: 'LCP',
  value: 1234,
  rating: 'good',
  delta: 1234,
  id: 'v5-test',
  entries: [],
  navigationType: 'navigate',
}

vi.mock('web-vitals', () => ({
  onCLS: (callback: (value: Metric) => void) => callback(metric),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}))

describe('WebVitals', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to keepalive fetch when sendBeacon declines the payload', () => {
    const sendBeacon = vi.fn(
      (..._args: Parameters<Navigator['sendBeacon']>) => false
    )
    const fetch = vi.fn((..._args: Parameters<typeof globalThis.fetch>) =>
      Promise.resolve(new Response())
    )
    vi.stubGlobal('fetch', fetch)
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    })

    render(<WebVitals />)

    expect(sendBeacon).toHaveBeenCalledOnce()
    const payload = sendBeacon.mock.calls[0]?.[1]
    expect(payload).toBeInstanceOf(Blob)
    expect(fetch).toHaveBeenCalledWith(
      '/api/web-vitals',
      expect.objectContaining({ method: 'POST', keepalive: true })
    )
    expect(fetch.mock.calls[0]?.[1]?.body).toContain('"route":"timer"')
  })

  it('does not duplicate a successful beacon with fetch', () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: vi.fn(() => true),
    })

    render(<WebVitals />)

    expect(fetch).not.toHaveBeenCalled()
  })
})
