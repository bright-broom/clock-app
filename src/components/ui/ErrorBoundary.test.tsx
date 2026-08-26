import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { IntlWrapper } from '@/test'

import { ErrorBoundary } from './ErrorBoundary'

const preventUnhandledError = (event: ErrorEvent) => event.preventDefault()

describe('ErrorBoundary', () => {
  beforeEach(() => window.addEventListener('error', preventUnhandledError))

  afterEach(() => {
    window.removeEventListener('error', preventUnhandledError)
    vi.restoreAllMocks()
  })

  it('shows a localized fallback and retries the child', () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true

    function UnstableChild() {
      if (shouldThrow) {
        throw new Error('expected test error')
      }

      return <p>recovered</p>
    }

    render(
      <IntlWrapper locale="ja">
        <ErrorBoundary logPrefix="Feature test:">
          <UnstableChild />
        </ErrorBoundary>
      </IntlWrapper>
    )

    expect(
      screen.getByText('機能の表示中にエラーが発生しました')
    ).toBeInTheDocument()
    expect(errorLog).toHaveBeenCalledWith(
      'Feature test:',
      expect.any(Error),
      expect.any(Object)
    )

    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: '再試行' }))

    expect(screen.getByText('recovered')).toBeInTheDocument()
  })
})
