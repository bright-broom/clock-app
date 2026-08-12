'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useState } from 'react'

import {
  CloseIcon,
  MenuIcon,
  UtcConverterIcon,
  WorldClockIcon,
} from '@/components/ui'

import { LanguageSwitcher } from './LanguageSwitcher'

export const HomeUtilityMenu = memo(function HomeUtilityMenu() {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const t = useTranslations('seoPages.home')
  const tMenu = useTranslations('menu')

  return (
    <div className="absolute right-[2.36%] top-[2.36%] z-20 flex flex-col items-end">
      <div className="flex items-center justify-end gap-2">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="group flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border bg-background-overlay text-foreground-muted transition-colors hover:text-foreground"
          aria-label={open ? tMenu('close') : tMenu('open')}
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
        <div className="mt-2 w-[12rem] rounded-xl border border-border bg-background p-2 shadow-lg">
          <ul className="grid gap-1">
            <li>
              <Link
                href={`/${locale}/world-clock`}
                className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-overlay hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <WorldClockIcon className="h-4 w-4 transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125" />
                {t('worldClock')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/utc-converter`}
                className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-overlay hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <UtcConverterIcon className="h-4 w-4 transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125" />
                {t('utcConverter')}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  )
})

HomeUtilityMenu.displayName = 'HomeUtilityMenu'
