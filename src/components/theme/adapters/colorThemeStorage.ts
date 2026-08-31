import {
  COLOR_THEME_STORAGE_KEY,
  type ColorTheme,
  resolveColorTheme,
} from '../model/colorTheme'

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>

function getBrowserStorage(): ThemeStorage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readStoredColorTheme(
  storage: ThemeStorage | null = getBrowserStorage()
): ColorTheme {
  if (!storage) return resolveColorTheme(null)

  try {
    return resolveColorTheme(storage.getItem(COLOR_THEME_STORAGE_KEY))
  } catch {
    return resolveColorTheme(null)
  }
}

export function writeStoredColorTheme(
  theme: ColorTheme,
  storage: ThemeStorage | null = getBrowserStorage()
): boolean {
  if (!storage) return false

  try {
    storage.setItem(COLOR_THEME_STORAGE_KEY, theme)
    return true
  } catch {
    return false
  }
}
