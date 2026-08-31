'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'

import { PaletteIcon } from '@/components/ui/AppIcons'

import { nextColorTheme } from './model/colorTheme'
import { useColorTheme } from './ThemeProvider'

type Props = {
  onChange?: () => void
}

export const ThemeSwitcher = memo(function ThemeSwitcher({ onChange }: Props) {
  const t = useTranslations('colorThemeSwitcher')
  const { colorTheme, setColorTheme } = useColorTheme()
  const nextTheme = nextColorTheme(colorTheme)
  const currentLabel = t(`themes.${colorTheme}`)
  const nextLabel = t(`themes.${nextTheme}`)
  const accessibleLabel = t('change', {
    current: currentLabel,
    next: nextLabel,
  })

  return (
    <button
      type="button"
      onClick={() => {
        setColorTheme(nextTheme)
        onChange?.()
      }}
      className="group flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl border border-border bg-background-overlay text-foreground-muted backdrop-blur-xl transition-[background-color,border-color,color] hover:border-foreground-muted hover:bg-background-overlay-strong hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
      aria-label={accessibleLabel}
      title={accessibleLabel}
      data-color-theme-control={colorTheme}
    >
      <PaletteIcon className="h-[1.1rem] w-[1.1rem] transition-[filter,opacity] duration-200 ease-out group-hover:opacity-100 group-hover:brightness-125 motion-reduce:transition-none" />
    </button>
  )
})

ThemeSwitcher.displayName = 'ThemeSwitcher'
