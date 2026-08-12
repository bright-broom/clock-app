'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import { EarthIcon } from '@/components/ui'
import { locales, type Locale } from '@/lib'

export function LanguageSwitcher() {
  const rawLocale = useLocale()
  const t = useTranslations('languageSwitcher')
  const locale: Locale = locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : locales[0]
  const router = useRouter()
  const pathname = usePathname()
  const currentIndex = locales.indexOf(locale)
  const nextLocale = locales[(currentIndex + 1) % locales.length] ?? locales[0]
  const currentLabel = t(`languages.${locale}`)
  const nextLabel = t(`languages.${nextLocale}`)

  const handleToggle = () => {
    const localePattern = new RegExp(`^/${locale}(?=/|$)`)
    const newPathname = pathname.replace(localePattern, `/${nextLocale}`)
    router.push(newPathname)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="group flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-background-overlay px-3 text-foreground-muted backdrop-blur-xl transition-[background-color,border-color,color] hover:border-foreground-muted hover:bg-background-overlay-strong hover:text-foreground motion-reduce:transition-none"
      aria-label={t('switchTo', { language: nextLabel })}
      title={t('fromTo', { current: currentLabel, next: nextLabel })}
    >
      <EarthIcon className="h-[1.05rem] w-[1.05rem] transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125 motion-reduce:transition-none" />
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
        {locale}
      </span>
    </button>
  )
}
