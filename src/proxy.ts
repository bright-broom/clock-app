import createMiddleware from 'next-intl/middleware'

import { defaultLocale, locales } from '@/lib'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

// Matcher must mirror the locales array. Update both when adding a locale.
export const config = {
  matcher: ['/', '/(ja|en|es|pt|fr|de|hi)/:path*'],
}
