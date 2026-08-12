import { NextResponse } from 'next/server'

type Payload = {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType: string
}

const MAX_BODY_BYTES = 1024
const MAX_METRIC_VALUE = 86_400_000
const metricIdPattern = /^[A-Za-z0-9._-]{1,128}$/
const allowedMetrics = new Set(['CLS', 'FCP', 'INP', 'LCP', 'TTFB'])
const allowedRatings = new Set(['good', 'needs-improvement', 'poor'])
const allowedNavigationTypes = new Set([
  'navigate',
  'reload',
  'back-forward',
  'back-forward-cache',
  'prerender',
  'restore',
])
const expectedKeys = new Set([
  'id',
  'name',
  'value',
  'rating',
  'navigationType',
])

class PayloadTooLargeError extends Error {}

function jsonResponse(ok: boolean, status: number) {
  return NextResponse.json(
    { ok },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}

function isSameOriginBrowserRequest(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin') {
    return false
  }

  const origin = request.headers.get('origin')
  if (!origin) {
    return true
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

async function readLimitedJson(request: Request): Promise<unknown> {
  const declaredLength = request.headers.get('content-length')
  if (declaredLength) {
    const length = Number(declaredLength)
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new SyntaxError('Invalid content length')
    }
    if (length > MAX_BODY_BYTES) {
      throw new PayloadTooLargeError()
    }
  }

  if (!request.body) {
    throw new SyntaxError('Missing request body')
  }

  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let byteLength = 0
  let body = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    byteLength += value.byteLength
    if (byteLength > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new PayloadTooLargeError()
    }
    body += decoder.decode(value, { stream: true })
  }

  body += decoder.decode()
  return JSON.parse(body) as unknown
}

function isPayload(value: unknown): value is Payload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  const keys = Object.keys(candidate)
  return (
    keys.length === expectedKeys.size &&
    keys.every((key) => expectedKeys.has(key)) &&
    typeof candidate.id === 'string' &&
    metricIdPattern.test(candidate.id) &&
    typeof candidate.name === 'string' &&
    allowedMetrics.has(candidate.name) &&
    typeof candidate.value === 'number' &&
    Number.isFinite(candidate.value) &&
    candidate.value >= 0 &&
    candidate.value <= MAX_METRIC_VALUE &&
    typeof candidate.rating === 'string' &&
    allowedRatings.has(candidate.rating) &&
    typeof candidate.navigationType === 'string' &&
    allowedNavigationTypes.has(candidate.navigationType)
  )
}

export async function POST(request: Request) {
  if (!isSameOriginBrowserRequest(request)) {
    return jsonResponse(false, 403)
  }

  const contentType = request.headers.get('content-type')
  if (
    contentType?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json'
  ) {
    return jsonResponse(false, 415)
  }

  try {
    const payload = await readLimitedJson(request)
    if (!isPayload(payload)) {
      return jsonResponse(false, 400)
    }

    console.info(
      JSON.stringify({
        level: 'info',
        event: 'WebVitals',
        payload,
        at: new Date().toISOString(),
      })
    )

    return jsonResponse(true, 200)
  } catch (error) {
    return jsonResponse(
      false,
      error instanceof PayloadTooLargeError ? 413 : 400
    )
  }
}
