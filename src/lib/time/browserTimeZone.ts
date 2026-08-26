const FALLBACK_TIME_ZONE = 'UTC'

export function getBrowserTimeZone(): string {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE
    )
  } catch {
    return FALLBACK_TIME_ZONE
  }
}
