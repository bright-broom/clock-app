import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl()

  return {
    name: 'Clock App',
    short_name: 'Clock',
    description: 'Minimal online digital clock with real-time updates.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    id: `${siteUrl}/`,
    categories: ['utilities', 'productivity'],
  }
}
