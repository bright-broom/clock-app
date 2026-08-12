import createMiddleware from 'next-intl/middleware'

import { defaultLocale, locales } from '@/lib'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

// matcher must mirror locales array - update when locales change
export const config = {
  matcher: ['/', '/(ja|en|es|pt|fr|de|hi)/:path*'],
}
