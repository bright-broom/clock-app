export const COLOR_THEMES = ['minimal', 'corpit'] as const

export type ColorTheme = (typeof COLOR_THEMES)[number]

export const DEFAULT_COLOR_THEME: ColorTheme = 'minimal'
export const COLOR_THEME_STORAGE_KEY = 'clock-app:color-theme'

export function isColorTheme(value: unknown): value is ColorTheme {
  return COLOR_THEMES.some((theme) => theme === value)
}

export function resolveColorTheme(value: unknown): ColorTheme {
  return isColorTheme(value) ? value : DEFAULT_COLOR_THEME
}

export function nextColorTheme(theme: ColorTheme): ColorTheme {
  const currentIndex = COLOR_THEMES.indexOf(theme)
  return (
    COLOR_THEMES[(currentIndex + 1) % COLOR_THEMES.length] ??
    DEFAULT_COLOR_THEME
  )
}

const serializedStorageKey = JSON.stringify(COLOR_THEME_STORAGE_KEY)
const serializedDefaultTheme = JSON.stringify(DEFAULT_COLOR_THEME)
const serializedThemes = JSON.stringify(COLOR_THEMES)

export const COLOR_THEME_BOOTSTRAP_SCRIPT = `(function(){var d=document.documentElement,a=${serializedThemes};try{var t=localStorage.getItem(${serializedStorageKey});d.dataset.colorTheme=a.indexOf(t)>-1?t:${serializedDefaultTheme}}catch(e){d.dataset.colorTheme=${serializedDefaultTheme}}})()`
