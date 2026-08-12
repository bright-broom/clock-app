import { NextResponse } from 'next/server'

type Payload = {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType: string
}

const allowedMetrics = new Set(['CLS', 'FCP', 'INP', 'LCP', 'TTFB'])
const allowedRatings = new Set(['good', 'needs-improvement', 'poor'])

function isPayload(value: unknown): value is Payload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    allowedMetrics.has(candidate.name) &&
    typeof candidate.value === 'number' &&
    Number.isFinite(candidate.value) &&
    typeof candidate.rating === 'string' &&
    allowedRatings.has(candidate.rating) &&
    typeof candidate.navigationType === 'string'
  )
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    if (!isPayload(payload)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    console.info(
      JSON.stringify({
        level: 'info',
        event: 'WebVitals',
        payload,
        at: new Date().toISOString(),
      })
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
