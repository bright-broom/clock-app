'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

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
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const currentLabel = t(`languages.${locale}`)

  useEffect(() => {
    if (!open) return

    containerRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.focus()

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selectLocale = (nextLocale: Locale) => {
    const localePattern = new RegExp(`^/${locale}(?=/|$)`)
    const newPathname = pathname.replace(localePattern, `/${nextLocale}`)
    setOpen(false)
    router.push(newPathname)
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Tab') setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-background-overlay px-3 text-foreground-muted backdrop-blur-xl transition-[background-color,border-color,color] hover:border-foreground-muted hover:bg-background-overlay-strong hover:text-foreground motion-reduce:transition-none"
        aria-label={`${t('label')}: ${currentLabel}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="language-switcher-list"
        title={currentLabel}
      >
        <EarthIcon className="h-[1.05rem] w-[1.05rem] transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125 motion-reduce:transition-none" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
          {locale}
        </span>
      </button>

      {open ? (
        <ul
          id="language-switcher-list"
          className="menu-enter absolute right-0 mt-[0.618rem] grid w-[11rem] gap-1 rounded-[1.618rem] border border-border bg-background/95 p-[0.618rem] shadow-2xl backdrop-blur-xl"
          role="listbox"
          aria-label={t('label')}
        >
          {locales.map((entry) => (
            <li key={entry} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={entry === locale}
                onClick={() => selectLocale(entry)}
                className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-foreground-muted transition-colors hover:bg-background-overlay hover:text-foreground aria-selected:bg-background-overlay aria-selected:text-foreground"
              >
                <span>{t(`languages.${entry}`)}</span>
                <span className="text-[0.618rem] font-semibold uppercase tracking-[0.16em]">
                  {entry}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
