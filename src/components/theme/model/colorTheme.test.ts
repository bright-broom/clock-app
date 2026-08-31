import { describe, expect, it } from 'vitest'

import {
  COLOR_THEME_BOOTSTRAP_SCRIPT,
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  isColorTheme,
  nextColorTheme,
  resolveColorTheme,
} from './colorTheme'

describe('colorTheme', () => {
  it('accepts only supported color themes', () => {
    expect(isColorTheme('minimal')).toBe(true)
    expect(isColorTheme('corpit')).toBe(true)
    expect(isColorTheme('unknown')).toBe(false)
    expect(resolveColorTheme(null)).toBe(DEFAULT_COLOR_THEME)
  })

  it('cycles through the supported themes', () => {
    expect(nextColorTheme('minimal')).toBe('corpit')
    expect(nextColorTheme('corpit')).toBe('minimal')
  })

  it('derives the pre-paint allowlist from the typed theme contract', () => {
    expect(COLOR_THEME_BOOTSTRAP_SCRIPT).toContain(COLOR_THEME_STORAGE_KEY)
    expect(COLOR_THEME_BOOTSTRAP_SCRIPT).not.toContain('innerHTML')

    for (const theme of ['minimal', 'corpit']) {
      window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme)
      Function(COLOR_THEME_BOOTSTRAP_SCRIPT)()
      expect(document.documentElement.dataset.colorTheme).toBe(theme)
    }

    window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, 'unknown')
    Function(COLOR_THEME_BOOTSTRAP_SCRIPT)()
    expect(document.documentElement.dataset.colorTheme).toBe(
      DEFAULT_COLOR_THEME
    )
  })
})
