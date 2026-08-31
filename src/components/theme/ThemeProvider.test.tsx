import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { COLOR_THEME_STORAGE_KEY } from './model/colorTheme'
import { ThemeProvider, useColorTheme } from './ThemeProvider'

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.dataset.colorTheme = 'minimal'
  })

  it('updates the document and persists a supported selection', () => {
    const { result } = renderHook(() => useColorTheme(), { wrapper: Wrapper })

    act(() => result.current.setColorTheme('corpit'))

    expect(document.documentElement.dataset.colorTheme).toBe('corpit')
    expect(window.localStorage.getItem(COLOR_THEME_STORAGE_KEY)).toBe('corpit')
  })

  it('synchronizes valid changes from another browser tab', async () => {
    const { result } = renderHook(() => useColorTheme(), { wrapper: Wrapper })

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: COLOR_THEME_STORAGE_KEY,
          newValue: 'corpit',
        })
      )
    })

    await waitFor(() => expect(result.current.colorTheme).toBe('corpit'))
    expect(document.documentElement.dataset.colorTheme).toBe('corpit')
  })

  it('falls back when another tab supplies an unsupported value', async () => {
    document.documentElement.dataset.colorTheme = 'corpit'
    const { result } = renderHook(() => useColorTheme(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.colorTheme).toBe('corpit'))
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: COLOR_THEME_STORAGE_KEY,
          newValue: 'untrusted',
        })
      )
    })

    await waitFor(() => expect(result.current.colorTheme).toBe('minimal'))
    expect(document.documentElement.dataset.colorTheme).toBe('minimal')
  })
})
