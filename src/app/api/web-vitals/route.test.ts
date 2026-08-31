import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WEB_VITALS_RATE_LIMIT_MAX_REQUESTS } from './ingestionPolicy'
import { __resetWebVitalsRateLimit, POST } from './route'

const endpoint = 'https://clock.example/api/web-vitals'
const validPayload = {
  id: 'v5-123',
  name: 'LCP',
  value: 1234.5,
  rating: 'good',
  navigationType: 'navigate',
  route: 'timer',
}

function request(body: string, headers: Record<string, string> = {}) {
  return new Request(endpoint, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://clock.example',
      'Sec-Fetch-Site': 'same-origin',
      ...headers,
    },
  })
}

describe('POST /api/web-vitals', () => {
  beforeEach(() => {
    __resetWebVitalsRateLimit()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts a bounded same-origin metric', async () => {
    const response = await POST(request(JSON.stringify(validPayload)))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('rejects cross-site submissions', async () => {
    const response = await POST(
      request(JSON.stringify(validPayload), {
        Origin: 'https://attacker.example',
        'Sec-Fetch-Site': 'cross-site',
      })
    )

    expect(response.status).toBe(403)
  })

  it('rejects requests that omit browser origin metadata', async () => {
    const response = await POST(
      new Request(endpoint, {
        method: 'POST',
        body: JSON.stringify(validPayload),
        headers: { 'Content-Type': 'application/json' },
      })
    )

    expect(response.status).toBe(403)
  })

  it('accepts the public Host when the server URL uses an internal alias', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/web-vitals', {
        method: 'POST',
        body: JSON.stringify(validPayload),
        headers: {
          'Content-Type': 'application/json',
          Host: '127.0.0.1:3000',
          Origin: 'http://127.0.0.1:3000',
          'Sec-Fetch-Site': 'same-origin',
        },
      })
    )

    expect(response.status).toBe(200)
  })

  it('rejects an unsupported media type', async () => {
    const response = await POST(
      request(JSON.stringify(validPayload), { 'Content-Type': 'text/plain' })
    )

    expect(response.status).toBe(415)
  })

  it('rejects oversized bodies before parsing', async () => {
    const response = await POST(request(' '.repeat(1025)))

    expect(response.status).toBe(413)
  })

  it('rejects unexpected fields and invalid values', async () => {
    const response = await POST(
      request(JSON.stringify({ ...validPayload, value: -1, injected: true }))
    )

    expect(response.status).toBe(400)
  })

  it('rejects a raw or unsupported route value', async () => {
    const response = await POST(
      request(JSON.stringify({ ...validPayload, route: '/ja/timer' }))
    )

    expect(response.status).toBe(400)
  })

  it('fails closed when ingestion is explicitly disabled', async () => {
    vi.stubEnv('WEB_VITALS_INGESTION_ENABLED', 'false')

    const response = await POST(request(JSON.stringify(validPayload)))

    expect(response.status).toBe(503)
  })

  it('bounds accepted work per application instance', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    for (
      let index = 0;
      index < WEB_VITALS_RATE_LIMIT_MAX_REQUESTS;
      index += 1
    ) {
      const response = await POST(request(JSON.stringify(validPayload)))
      expect(response.status).toBe(200)
    }

    const rejected = await POST(request(JSON.stringify(validPayload)))
    expect(rejected.status).toBe(429)
    expect(rejected.headers.get('retry-after')).toBeTruthy()
    log.mockRestore()
  })
})
