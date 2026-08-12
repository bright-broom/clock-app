import { describe, expect, it } from 'vitest'

import { serializeJsonLd } from './serializeJsonLd'

describe('serializeJsonLd', () => {
  it('prevents script element termination while preserving parsed data', () => {
    const value = {
      description: '</script><script>alert("xss")</script>',
      separator: '\u2028&\u2029',
    }
    const serialized = serializeJsonLd(value)

    expect(serialized).not.toContain('<')
    expect(serialized).not.toContain('>')
    expect(serialized).not.toContain('&')
    expect(JSON.parse(serialized)).toEqual(value)
  })
})
