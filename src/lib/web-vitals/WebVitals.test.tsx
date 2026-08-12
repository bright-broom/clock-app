import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Metric } from 'web-vitals'

import { WebVitals } from './WebVitals'

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
    const sendBeacon = vi.fn(() => false)
    const fetch = vi.fn(() => Promise.resolve(new Response()))
    vi.stubGlobal('fetch', fetch)
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    })

    render(<WebVitals />)

    expect(sendBeacon).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(
      '/api/web-vitals',
      expect.objectContaining({ method: 'POST', keepalive: true })
    )
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
