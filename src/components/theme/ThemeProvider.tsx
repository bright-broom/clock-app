'use client'

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react'
import type { ReactNode } from 'react'

import {
  getColorThemeSnapshot,
  getServerColorThemeSnapshot,
  setDocumentColorTheme,
  subscribeToColorTheme,
} from './adapters/colorThemeDom'
import type { ColorTheme } from './model/colorTheme'

type ColorThemeContextValue = {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null)

export const ThemeProvider = memo(function ThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const colorTheme = useSyncExternalStore(
    subscribeToColorTheme,
    getColorThemeSnapshot,
    getServerColorThemeSnapshot
  )

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setDocumentColorTheme(theme)
  }, [])

  const value = useMemo(
    () => ({ colorTheme, setColorTheme }),
    [colorTheme, setColorTheme]
  )

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  )
})

ThemeProvider.displayName = 'ThemeProvider'

export function useColorTheme(): ColorThemeContextValue {
  const value = useContext(ColorThemeContext)
  if (!value) {
    throw new Error('useColorTheme must be used within ThemeProvider')
  }

  return value
}
