'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'

function reportWebVitals(metric: Metric) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
  })

  if (navigator.sendBeacon) {
    const payload = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/api/web-vitals', payload)
  } else {
    fetch('/api/web-vitals', {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => undefined)
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }
}

export function WebVitals() {
  useEffect(() => {
    onCLS(reportWebVitals)
    onFCP(reportWebVitals)
    onINP(reportWebVitals)
    onLCP(reportWebVitals)
    onTTFB(reportWebVitals)
  }, [])

  return null
}
