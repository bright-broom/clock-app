import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  analyzeSourcePolicy,
  isExactIsoDate,
  isExactRepoPath,
  isRuleExemptible,
  maximumExceptionExpiry,
  maximumExceptionLifetimeDays,
  toIsoDate,
} from './architecture-policy.mjs'

const root = new URL('../', import.meta.url)
const rootPath = fileURLToPath(root)
const failures = []
const today = toIsoDate()

const knownRules = new Set([
  'app-feature-public-api',
  'client-private-env',
  'feature-public-api',
  'feature-tests',
  'semantic-color-token',
  'storage-boundary',
])
function toRepoPath(path) {
  return relative(rootPath, path).split(sep).join('/')
}

function read(relativePath) {
  return readFileSync(new URL(relativePath, root), 'utf8')
}

function requireFile(relativePath) {
  if (!existsSync(new URL(relativePath, root))) {
    failures.push(`Missing required architecture file: ${relativePath}`)
    return false
  }

  return true
}

function requireText(relativePath, expectedText) {
  if (!requireFile(relativePath)) return

  const contents = read(relativePath)
  if (!contents.includes(expectedText)) {
    failures.push(`${relativePath} must contain: ${expectedText}`)
  }
}

function collectFiles(directory, predicate) {
  const files = []

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectFiles(path, predicate))
    else if (predicate(entry.name)) files.push(path)
  }

  return files
}

function loadPolicy() {
  const fallback = { version: 1, exceptions: [] }
  if (!requireFile('architecture-policy.json')) return fallback

  let parsed
  try {
    parsed = JSON.parse(read('architecture-policy.json'))
  } catch {
    failures.push('architecture-policy.json must be valid JSON.')
    return fallback
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.exceptions)
  ) {
    failures.push(
      'architecture-policy.json must have version 1 and an exceptions array.'
    )
    return fallback
  }

  const seen = new Set()
  for (const [index, exception] of parsed.exceptions.entries()) {
    const label = `architecture-policy.json exception ${index + 1}`
    if (!exception || typeof exception !== 'object') {
      failures.push(`${label} must be an object.`)
      continue
    }

    const requiredStrings = [
      'rule',
      'path',
      'reason',
      'owner',
      'expiresOn',
      'compensatingControl',
    ]
    for (const field of requiredStrings) {
      if (typeof exception[field] !== 'string' || !exception[field].trim()) {
        failures.push(`${label} requires a non-empty ${field}.`)
      }
    }

    if (typeof exception.rule === 'string' && !knownRules.has(exception.rule)) {
      failures.push(`${label} uses an unknown rule: ${exception.rule}`)
    }
    if (
      typeof exception.rule === 'string' &&
      !isRuleExemptible(exception.rule)
    ) {
      failures.push(`${label} cannot exempt security rule ${exception.rule}.`)
    }
    if (
      typeof exception.path === 'string' &&
      !isExactRepoPath(exception.path)
    ) {
      failures.push(
        `${label} path must be an exact repository-relative path without wildcards.`
      )
    }
    if (
      typeof exception.owner === 'string' &&
      !/^@[A-Za-z0-9-]+(?:\/[A-Za-z0-9-]+)?$/.test(exception.owner)
    ) {
      failures.push(`${label} owner must be a GitHub user or team.`)
    }
    if (
      typeof exception.expiresOn !== 'string' ||
      !isExactIsoDate(exception.expiresOn)
    ) {
      failures.push(`${label} expiresOn must be a valid YYYY-MM-DD date.`)
    } else if (exception.expiresOn < today) {
      failures.push(`${label} expired on ${exception.expiresOn}.`)
    } else if (exception.expiresOn > maximumExceptionExpiry(today)) {
      failures.push(
        `${label} expiresOn must be within ${maximumExceptionLifetimeDays} days.`
      )
    }
    if (
      typeof exception.reason === 'string' &&
      exception.reason.trim().length < 10
    ) {
      failures.push(`${label} reason must explain the trade-off.`)
    }
    if (
      typeof exception.compensatingControl === 'string' &&
      exception.compensatingControl.trim().length < 10
    ) {
      failures.push(`${label} requires a meaningful compensating control.`)
    }

    const key = `${exception.rule}:${exception.path}`
    if (seen.has(key)) failures.push(`${label} duplicates ${key}.`)
    seen.add(key)
  }

  return parsed
}

const policy = loadPolicy()
const usedExceptionKeys = new Set()

function hasActiveException(rule, path) {
  if (!isRuleExemptible(rule)) return false

  const exception = policy.exceptions.find(
    (exception) =>
      exception.rule === rule &&
      exception.path === path &&
      exception.expiresOn >= today
  )
  if (!exception) return false

  usedExceptionKeys.add(`${rule}:${path}`)
  return true
}

function reportViolation(rule, path, message) {
  if (!hasActiveException(rule, path)) {
    failures.push(`[${rule}] ${path}: ${message}`)
  }
}

for (const file of [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'docs/architecture.md',
  'docs/engineering-principles.md',
  'docs/adr/README.md',
  '.github/pull_request_template.md',
]) {
  requireFile(file)
}

requireText('AGENTS.md', 'Automated Principal Review')
requireText('AGENTS.md', '$senior-review-remediation-loop')
requireText('AGENTS.md', '$ai-development-security-guardrails')
requireText('AGENTS.md', 'app -> features -> components -> lib')
requireText('CLAUDE.md', 'AGENTS.md')
requireText('README.md', 'src/features/')
requireText('README.md', 'Engineering Principles')
requireText('docs/architecture.md', 'Feature の公開 API')
requireText('docs/engineering-principles.md', 'Hardcode を一律に禁止しない')
requireText('docs/engineering-principles.md', 'Blocking と Advisory')
requireText('.github/pull_request_template.md', 'Tested Commit SHA')
requireText('package.json', '"review:architecture"')
requireText('package.json', '"verify"')
requireText('.github/workflows/ci.yml', 'npm run review:architecture')
requireText('.github/workflows/ci.yml', 'npm run test:e2e')

const featuresRoot = join(rootPath, 'src/features')
if (!existsSync(featuresRoot)) {
  failures.push('Missing required architecture directory: src/features')
} else {
  for (const entry of readdirSync(featuresRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const featurePath = join(featuresRoot, entry.name)
    const featureRepoPath = `src/features/${entry.name}`
    if (!existsSync(join(featurePath, 'index.ts'))) {
      reportViolation(
        'feature-public-api',
        featureRepoPath,
        'Feature is missing its public index.ts.'
      )
    }

    const featureFiles = collectFiles(featurePath, (name) =>
      /\.(js|jsx|ts|tsx)$/.test(name)
    )
    if (!featureFiles.some((path) => /\.test\.(js|jsx|ts|tsx)$/.test(path))) {
      reportViolation(
        'feature-tests',
        featureRepoPath,
        'Feature must include at least one colocated test.'
      )
    }
  }
}

const sourceRoot = join(rootPath, 'src')
const sourceFiles = existsSync(sourceRoot)
  ? collectFiles(sourceRoot, (name) => /\.(js|jsx|ts|tsx)$/.test(name))
  : []
if (!existsSync(sourceRoot)) {
  failures.push('Missing required architecture directory: src')
}
const deepFeatureImport = /^@\/features\/[^/]+\//

for (const file of sourceFiles) {
  const path = toRepoPath(file)
  const source = readFileSync(file, 'utf8')
  const isTest = /\.test\.(js|jsx|ts|tsx)$/.test(path)
  const sourcePolicy = analyzeSourcePolicy(source, path)

  if (
    path.startsWith('src/app/') &&
    sourcePolicy.moduleSpecifiers.some((specifier) =>
      deepFeatureImport.test(specifier)
    )
  ) {
    reportViolation(
      'app-feature-public-api',
      path,
      'App must import a Feature through its public API.'
    )
  }

  if (!isTest && sourcePolicy.containsRawTailwindColor) {
    reportViolation(
      'semantic-color-token',
      path,
      'Use a semantic color token instead of a raw Tailwind color.'
    )
  }

  if (
    !isTest &&
    sourcePolicy.browserStorageReferences.length > 0 &&
    !/(?:\/model\/|\/adapter\/|\/adapters\/)/.test(path)
  ) {
    reportViolation(
      'storage-boundary',
      path,
      'Browser Storage access must stay in a model or adapter boundary.'
    )
  }

  if (sourcePolicy.isClient) {
    for (const variable of sourcePolicy.environmentReferences) {
      if (variable === null) {
        reportViolation(
          'client-private-env',
          path,
          'Client code must use explicit NEXT_PUBLIC_* environment references.'
        )
        continue
      }

      if (variable !== 'NODE_ENV' && !variable.startsWith('NEXT_PUBLIC_')) {
        reportViolation(
          'client-private-env',
          path,
          `Client code must not reference private environment variable ${variable}.`
        )
      }
    }
  }
}

for (const exception of policy.exceptions) {
  const key = `${exception.rule}:${exception.path}`
  if (
    knownRules.has(exception.rule) &&
    isRuleExemptible(exception.rule) &&
    isExactIsoDate(exception.expiresOn) &&
    exception.expiresOn >= today &&
    !usedExceptionKeys.has(key)
  ) {
    failures.push(
      `architecture-policy.json has an unused active exception: ${key}.`
    )
  }
}

if (failures.length > 0) {
  console.error(
    [
      'Architecture review failed:',
      ...failures.map((item) => `- ${item}`),
    ].join('\n')
  )
  process.exitCode = 1
} else {
  console.log('Architecture review passed.')
}
