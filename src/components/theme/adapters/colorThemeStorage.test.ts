import { describe, expect, it, vi } from 'vitest'

import { COLOR_THEME_STORAGE_KEY } from '../model/colorTheme'

import {
  readStoredColorTheme,
  writeStoredColorTheme,
} from './colorThemeStorage'

describe('colorThemeStorage', () => {
  it('reads supported values and rejects invalid persisted data', () => {
    const storage = { getItem: vi.fn(() => 'corpit'), setItem: vi.fn() }

    expect(readStoredColorTheme(storage)).toBe('corpit')
    storage.getItem.mockReturnValue('untrusted')
    expect(readStoredColorTheme(storage)).toBe('minimal')
  })

  it('fails closed without breaking the in-tab theme selection', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
    }

    expect(readStoredColorTheme(storage)).toBe('minimal')
    expect(writeStoredColorTheme('corpit', storage)).toBe(false)
  })

  it('writes only to the versioned application key', () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() }

    expect(writeStoredColorTheme('corpit', storage)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      COLOR_THEME_STORAGE_KEY,
      'corpit'
    )
  })
})
