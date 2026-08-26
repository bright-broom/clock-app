'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'

import { toMetricRoute, type MetricRoute } from './metricRoute'

function reportWebVitals(metric: Metric, route: MetricRoute) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
    route,
  })

  const sendWithFetch = () =>
    fetch('/api/web-vitals', {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => undefined)

  if (navigator.sendBeacon) {
    const payload = new Blob([body], { type: 'application/json' })
    if (!navigator.sendBeacon('/api/web-vitals', payload)) {
      void sendWithFetch()
    }
  } else {
    void sendWithFetch()
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }
}

export function WebVitals() {
  const pathname = usePathname()
  const route = toMetricRoute(pathname)
  const routeRef = useRef(route)

  useEffect(() => {
    routeRef.current = route
  }, [route])

  useEffect(() => {
    const report = (metric: Metric) => reportWebVitals(metric, routeRef.current)
    onCLS(report)
    onFCP(report)
    onINP(report)
    onLCP(report)
    onTTFB(report)
  }, [])

  return null
}
