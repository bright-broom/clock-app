import assert from 'node:assert/strict'
import test from 'node:test'

import {
  analyzeSourcePolicy,
  isExactIsoDate,
  isExactRepoPath,
  isRuleExemptible,
  maximumExceptionExpiry,
} from './architecture-policy.mjs'

test('accepts exact calendar dates and rejects normalized invalid dates', () => {
  assert.equal(isExactIsoDate('2024-02-29'), true)
  assert.equal(isExactIsoDate('2026-02-29'), false)
  assert.equal(isExactIsoDate('2026-02-31'), false)
  assert.equal(isExactIsoDate('26-08-26'), false)
})

test('limits temporary exceptions to the configured lifetime', () => {
  assert.equal(maximumExceptionExpiry('2026-08-26'), '2026-11-24')
})

test('accepts only exact repository-relative paths', () => {
  assert.equal(isExactRepoPath('src/features/timer'), true)
  assert.equal(isExactRepoPath('src/features/timer/model/timer.ts'), true)
  assert.equal(isExactRepoPath('../src/features/timer'), false)
  assert.equal(isExactRepoPath('/src/features/timer'), false)
  assert.equal(isExactRepoPath('src/features/*'), false)
  assert.equal(isExactRepoPath('src\\features\\timer'), false)
  assert.equal(isExactRepoPath('src//features/timer'), false)
  assert.equal(isExactRepoPath('./src/features/timer'), false)
})

test('does not permit exceptions for security boundaries', () => {
  assert.equal(isRuleExemptible('client-private-env'), false)
  assert.equal(isRuleExemptible('feature-tests'), true)
})

test('parses client environment access without comment or string false positives', () => {
  const analysis = analyzeSourcePolicy(`
    // A comment before the directive is valid.
    'use client'
    const publicValue = process.env.NEXT_PUBLIC_SITE_URL
    const privateValue = process.env.INTERNAL_TOKEN
    const dynamicValue = process.env['NEXT_PUBLIC_DYNAMIC']
    const copiedEnvironment = process.env
    const documentation = 'process.env.SECRET_IN_A_STRING'
  `)

  assert.equal(analysis.isClient, true)
  assert.deepEqual(analysis.environmentReferences, [
    'NEXT_PUBLIC_SITE_URL',
    'INTERNAL_TOKEN',
    null,
    null,
  ])
})

test('does not inspect environment access in server modules', () => {
  const analysis = analyzeSourcePolicy(
    'export const token = process.env.INTERNAL_TOKEN'
  )

  assert.equal(analysis.isClient, false)
  assert.deepEqual(analysis.environmentReferences, [])
})

test('collects executable module boundaries and ignores documentation strings', () => {
  const analysis = analyzeSourcePolicy(`
    // import '@/features/timer/model/internal'
    const documentation = "from '@/features/clock/components/Clock'"
    import { Timer } from '@/features/timer'
    export { Clock } from '@/features/clock/components/Clock'
    const lazy = import('@/features/timer/model/useTimer')
  `)

  assert.deepEqual(analysis.moduleSpecifiers, [
    '@/features/timer',
    '@/features/clock/components/Clock',
    '@/features/timer/model/useTimer',
  ])
})

test('finds raw Tailwind colors in code strings but ignores comments', () => {
  const allowed = analyzeSourcePolicy('// Avoid bg-black in production.')
  const rejected = analyzeSourcePolicy(
    'export const classes = `bg-background text-white/60`'
  )

  assert.equal(allowed.containsRawTailwindColor, false)
  assert.equal(rejected.containsRawTailwindColor, true)
})

test('finds browser storage access without documentation false positives', () => {
  const analysis = analyzeSourcePolicy(`
    // Avoid localStorage access in UI components.
    const documentation = 'sessionStorage is an adapter concern'
    const state = window.localStorage.getItem('state')
    sessionStorage.removeItem('state')
    const metadata = { localStorage: 'documented' }
  `)

  assert.deepEqual(analysis.browserStorageReferences, [
    'localStorage',
    'sessionStorage',
  ])
})
