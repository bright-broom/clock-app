import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import { getRequestConfig } from 'next-intl/server'

import { isLocale } from './config'

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale ?? (await rootParams.locale())

  if (!isLocale(resolvedLocale)) {
    notFound()
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`../../../messages/${resolvedLocale}.json`))
      .default,
  }
})
