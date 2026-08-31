import {
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  type ColorTheme,
  resolveColorTheme,
} from '../model/colorTheme'

import { writeStoredColorTheme } from './colorThemeStorage'

const COLOR_THEME_CHANGE_EVENT = 'clock-app:color-theme-change'

function applyColorTheme(theme: ColorTheme) {
  document.documentElement.dataset.colorTheme = theme
}

export function getColorThemeSnapshot(): ColorTheme {
  if (typeof document === 'undefined') return DEFAULT_COLOR_THEME
  return resolveColorTheme(document.documentElement.dataset.colorTheme)
}

export function getServerColorThemeSnapshot(): ColorTheme {
  return DEFAULT_COLOR_THEME
}

export function subscribeToColorTheme(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== COLOR_THEME_STORAGE_KEY) return

    applyColorTheme(resolveColorTheme(event.newValue))
    onChange()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(COLOR_THEME_CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(COLOR_THEME_CHANGE_EVENT, onChange)
  }
}

export function setDocumentColorTheme(theme: ColorTheme) {
  applyColorTheme(theme)
  writeStoredColorTheme(theme)
  window.dispatchEvent(new Event(COLOR_THEME_CHANGE_EVENT))
}
