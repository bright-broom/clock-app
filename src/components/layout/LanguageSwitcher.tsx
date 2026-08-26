'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

import { EarthIcon } from '@/components/ui/AppIcons'
import { isLocale, locales, type Locale } from '@/lib'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LanguageSwitcher({ open, onOpenChange }: Props) {
  const rawLocale = useLocale()
  const t = useTranslations('languageSwitcher')
  const locale = isLocale(rawLocale) ? rawLocale : locales[0]
  const router = useRouter()
  const pathname = usePathname()
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
        onOpenChange(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onOpenChange, open])

  const selectLocale = (nextLocale: Locale) => {
    const localePattern = new RegExp(`^/${locale}(?=/|$)`)
    const newPathname = pathname.replace(localePattern, `/${nextLocale}`)
    onOpenChange(false)
    router.push(newPathname)
  }

  const focusOption = (index: number) => {
    const options = Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]'
      ) ?? []
    )
    options.at((index + options.length) % options.length)?.focus()
  }

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]')
    )
    const currentIndex = options.indexOf(
      document.activeElement as HTMLButtonElement
    )

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(currentIndex + (event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusOption(event.key === 'Home' ? 0 : options.length - 1)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Tab') onOpenChange(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            onOpenChange(true)
          }
        }}
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
          className="menu-enter absolute right-0 mt-[0.618rem] grid max-h-[calc(100dvh-6.5rem)] w-[11rem] gap-1 overflow-y-auto overscroll-contain rounded-[1.618rem] border border-border bg-background/95 p-[0.618rem] shadow-2xl backdrop-blur-xl"
          role="listbox"
          aria-label={t('label')}
          onKeyDown={handleListKeyDown}
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
