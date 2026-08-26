import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { IntlWrapper } from '@/test'

import { UtcConverter } from './UtcConverter'

describe('UtcConverter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T01:30:45.000Z'))
  })

  afterEach(() => vi.useRealTimers())

  it('renders a deterministic initial UTC value', () => {
    render(
      <IntlWrapper locale="ja">
        <UtcConverter locale="ja" />
      </IntlWrapper>
    )

    expect(screen.getByLabelText('UTC 日時')).toHaveValue('2024-01-15T01:30')
    expect(screen.getByText('2024年1月15日 10:30:00')).toBeInTheDocument()
  })

  it('shows a validation message for an invalid value', () => {
    render(
      <IntlWrapper locale="ja">
        <UtcConverter locale="ja" />
      </IntlWrapper>
    )

    fireEvent.change(screen.getByLabelText('UTC 日時'), {
      target: { value: '' },
    })

    expect(screen.getByText('日時の形式が正しくありません')).toBeInTheDocument()
  })
})
