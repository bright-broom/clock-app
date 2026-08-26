import { describe, expect, it } from 'vitest'

import { parseUtcInput, toUtcInputValue } from './utcDateTime'

describe('UTC datetime input', () => {
  it('uses UTC fields for the input value', () => {
    expect(toUtcInputValue(new Date('2024-01-15T01:30:45.000Z'))).toBe(
      '2024-01-15T01:30'
    )
  })

  it('parses input as UTC rather than browser-local time', () => {
    expect(parseUtcInput('2024-01-15T01:30')?.toISOString()).toBe(
      '2024-01-15T01:30:00.000Z'
    )
  })

  it.each(['', 'not-a-date', '2024-02-31T12:00', '2024-01-01T25:00'])(
    'rejects invalid input %s',
    (input) => expect(parseUtcInput(input)).toBeNull()
  )

  it('returns an empty value for an invalid Date', () => {
    expect(toUtcInputValue(new Date(Number.NaN))).toBe('')
  })
})
