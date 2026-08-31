export const WEB_VITALS_RATE_LIMIT_MAX_REQUESTS = 300
export const WEB_VITALS_RATE_LIMIT_WINDOW_MS = 60_000

type RuntimeEnvironment = {
  NODE_ENV?: string
  WEB_VITALS_INGESTION_ENABLED?: string
}

export type RateLimitDecision = {
  allowed: boolean
  retryAfterSeconds: number
}

export function isWebVitalsIngestionEnabled(
  environment: RuntimeEnvironment = process.env
): boolean {
  const configured = environment.WEB_VITALS_INGESTION_ENABLED
  if (configured === 'false') {
    return false
  }

  return environment.NODE_ENV !== 'production' || configured === 'true'
}

export function createFixedWindowRateLimiter(
  maxRequests: number,
  windowMs: number
) {
  if (!Number.isSafeInteger(maxRequests) || maxRequests <= 0) {
    throw new RangeError('maxRequests must be a positive safe integer')
  }
  if (!Number.isSafeInteger(windowMs) || windowMs <= 0) {
    throw new RangeError('windowMs must be a positive safe integer')
  }

  let windowStartedAt = 0
  let requestCount = 0

  return {
    tryConsume(now: number = Date.now()): RateLimitDecision {
      const currentTime = Number.isFinite(now) ? Math.trunc(now) : Date.now()
      if (
        windowStartedAt === 0 ||
        currentTime < windowStartedAt ||
        currentTime - windowStartedAt >= windowMs
      ) {
        windowStartedAt = currentTime
        requestCount = 0
      }

      requestCount += 1
      const remainingMs = Math.max(
        0,
        windowMs - (currentTime - windowStartedAt)
      )
      return {
        allowed: requestCount <= maxRequests,
        retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)),
      }
    },
    reset() {
      windowStartedAt = 0
      requestCount = 0
    },
  }
}
