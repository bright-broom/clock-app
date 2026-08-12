const FALLBACK_SITE_URL = 'http://localhost:3000'

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function getSiteUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (explicitUrl) {
    return normalizeUrl(explicitUrl)
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return normalizeUrl(`https://${vercelUrl}`)
  }

  return FALLBACK_SITE_URL
}
