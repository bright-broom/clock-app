const FALLBACK_SITE_URL = 'http://localhost:3000'

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function validateSiteUrl(value: string, source: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${source} must be an absolute URL`)
  }

  const isLocalHttp =
    url.protocol === 'http:' &&
    (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
  if (url.protocol !== 'https:' && !isLocalHttp) {
    throw new Error(`${source} must use HTTPS outside local development`)
  }
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== '/' && url.pathname !== '')
  ) {
    throw new Error(`${source} must contain only an origin`)
  }

  return normalizeUrl(url.origin)
}

export function getSiteUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (explicitUrl) {
    return validateSiteUrl(explicitUrl, 'NEXT_PUBLIC_SITE_URL')
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return validateSiteUrl(`https://${vercelUrl}`, 'VERCEL_URL')
  }

  return FALLBACK_SITE_URL
}
