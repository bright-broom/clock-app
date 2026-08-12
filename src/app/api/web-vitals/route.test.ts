import { describe, expect, it } from 'vitest'

import { POST } from './route'

const endpoint = 'https://clock.example/api/web-vitals'
const validPayload = {
  id: 'v5-123',
  name: 'LCP',
  value: 1234.5,
  rating: 'good',
  navigationType: 'navigate',
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
})
