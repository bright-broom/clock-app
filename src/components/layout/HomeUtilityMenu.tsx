'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useEffect, useRef, useState } from 'react'

import {
  CloseIcon,
  MenuIcon,
  UtcConverterIcon,
  WorldClockIcon,
} from '@/components/ui'

import { LanguageSwitcher } from './LanguageSwitcher'

export const HomeUtilityMenu = memo(function HomeUtilityMenu() {
  const [open, setOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const locale = useLocale()
  const t = useTranslations('seoPages.home')
  const tMenu = useTranslations('menu')

  useEffect(() => {
    if (!open) return

    firstLinkRef.current?.focus()

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

  return (
    <div
      ref={containerRef}
      className="absolute right-[clamp(1.236rem,2.36vw,2.618rem)] top-[clamp(1.236rem,2.36vw,2.618rem)] z-20 flex flex-col items-end"
    >
      <div className="flex items-center justify-end gap-2">
        <LanguageSwitcher
          open={languageOpen}
          onOpenChange={(nextOpen) => {
            setLanguageOpen(nextOpen)
            if (nextOpen) setOpen(false)
          }}
        />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setLanguageOpen(false)
            setOpen((prev) => !prev)
          }}
          className="group flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-background-overlay text-foreground-muted backdrop-blur-xl transition-[background-color,border-color,color] hover:border-foreground-muted hover:bg-background-overlay-strong hover:text-foreground"
          aria-label={open ? tMenu('close') : tMenu('open')}
          aria-expanded={open}
          aria-controls="home-utility-menu"
          title={open ? tMenu('close') : tMenu('open')}
        >
          {open ? (
            <CloseIcon className="h-[1.05rem] w-[1.05rem] transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125" />
          ) : (
            <MenuIcon className="h-[1.05rem] w-[1.05rem] transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125" />
          )}
        </button>
      </div>

      {open ? (
        <nav
          id="home-utility-menu"
          className="menu-enter mt-[0.618rem] w-[13rem] rounded-[1.618rem] border border-border bg-background/90 p-[0.618rem] shadow-2xl backdrop-blur-xl"
          aria-label={t('heading')}
        >
          <ul className="grid gap-1">
            <li>
              <Link
                ref={firstLinkRef}
                href={`/${locale}/world-clock`}
                className="group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-overlay hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <WorldClockIcon className="h-4 w-4 transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125" />
                {t('worldClock')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/utc-converter`}
                className="group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-overlay hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <UtcConverterIcon className="h-4 w-4 transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125" />
                {t('utcConverter')}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  )
})

HomeUtilityMenu.displayName = 'HomeUtilityMenu'
