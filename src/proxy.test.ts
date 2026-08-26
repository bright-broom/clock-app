import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { locales } from '@/lib'

describe('locale proxy matcher', () => {
  it('stays synchronized with the configured locale list', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/proxy.ts'), 'utf8')
    const localeGroup = source.match(/'\/\(([^)]+)\)\/:path\*'/)?.[1]

    expect(localeGroup?.split('|')).toEqual([...locales])
  })
})
