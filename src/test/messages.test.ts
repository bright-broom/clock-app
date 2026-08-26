import { describe, expect, it } from 'vitest'

import { locales, type Locale } from '@/lib'

import de from '../../messages/de.json'
import en from '../../messages/en.json'
import es from '../../messages/es.json'
import fr from '../../messages/fr.json'
import hi from '../../messages/hi.json'
import ja from '../../messages/ja.json'
import pt from '../../messages/pt.json'

const messages: Record<Locale, unknown> = { ja, en, es, pt, fr, de, hi }

function flattenMessages(
  value: unknown,
  prefix = '',
  result = new Map<string, string>()
): Map<string, string> {
  if (typeof value === 'string') {
    result.set(prefix, value)
    return result
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flattenMessages(child, prefix ? `${prefix}.${key}` : key, result)
    }
  }

  return result
}

function placeholders(message: string): string[] {
  return Array.from(message.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g))
    .map((match) => match[1] ?? '')
    .sort()
}

describe('localized messages', () => {
  const reference = flattenMessages(ja)

  it.each(locales)(
    '%s has the same keys and placeholders as Japanese',
    (locale) => {
      const candidate = flattenMessages(messages[locale])

      expect([...candidate.keys()].sort()).toEqual([...reference.keys()].sort())

      for (const [key, referenceMessage] of reference) {
        expect(placeholders(candidate.get(key) ?? '')).toEqual(
          placeholders(referenceMessage)
        )
      }
    }
  )
})
