import ts from 'typescript'

export const maximumExceptionLifetimeDays = 90

const nonExemptibleRules = new Set(['client-private-env'])
const rawTailwindColorPattern =
  /\b(?:bg|text|border|from|via|to)-(?:black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d{1,3})?\b/

export function toIsoDate(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function isExactIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

export function maximumExceptionExpiry(
  today,
  lifetimeDays = maximumExceptionLifetimeDays
) {
  const expiry = new Date(`${today}T00:00:00Z`)
  expiry.setUTCDate(expiry.getUTCDate() + lifetimeDays)
  return expiry.toISOString().slice(0, 10)
}

export function isExactRepoPath(value) {
  const segments = typeof value === 'string' ? value.split('/') : []

  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value !== '.' &&
    !value.startsWith('/') &&
    !value.includes('\\') &&
    segments.every(
      (segment) => segment !== '' && segment !== '.' && segment !== '..'
    ) &&
    !/[*?[\]{}]/.test(value)
  )
}

export function isRuleExemptible(rule) {
  return !nonExemptibleRules.has(rule)
}

export function analyzeSourcePolicy(source, fileName = 'source.tsx') {
  const scriptKind = fileName.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : fileName.endsWith('.jsx')
      ? ts.ScriptKind.JSX
      : fileName.endsWith('.js')
        ? ts.ScriptKind.JS
        : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  )
  let isClient = false

  for (const statement of sourceFile.statements) {
    if (
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression)
    ) {
      if (statement.expression.text === 'use client') isClient = true
      continue
    }
    break
  }

  const environmentReferences = []
  const moduleSpecifiers = []
  const browserStorageReferences = []
  let containsRawTailwindColor = false

  function addModuleSpecifier(node) {
    if (node && ts.isStringLiteralLike(node)) {
      moduleSpecifiers.push(node.text)
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addModuleSpecifier(node.moduleSpecifier)
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      addModuleSpecifier(node.arguments[0])
    }

    if (
      (ts.isStringLiteralLike(node) ||
        node.kind === ts.SyntaxKind.TemplateHead ||
        node.kind === ts.SyntaxKind.TemplateMiddle ||
        node.kind === ts.SyntaxKind.TemplateTail) &&
      rawTailwindColorPattern.test(node.text)
    ) {
      containsRawTailwindColor = true
    }

    const isBrowserStorageName =
      ts.isIdentifier(node) &&
      (node.text === 'localStorage' || node.text === 'sessionStorage')
    if (isBrowserStorageName) {
      const parentReportsPropertyAccess =
        ts.isPropertyAccessExpression(node.parent) && node.parent.name === node
      const isObjectPropertyName =
        (ts.isPropertyAssignment(node.parent) ||
          ts.isMethodDeclaration(node.parent) ||
          ts.isPropertyDeclaration(node.parent) ||
          ts.isPropertySignature(node.parent) ||
          ts.isMethodSignature(node.parent)) &&
        node.parent.name === node

      if (!parentReportsPropertyAccess && !isObjectPropertyName) {
        browserStorageReferences.push(node.text)
      }
    } else if (
      ts.isPropertyAccessExpression(node) &&
      (node.name.text === 'localStorage' || node.name.text === 'sessionStorage')
    ) {
      browserStorageReferences.push(node.name.text)
    }

    if (!isClient) {
      ts.forEachChild(node, visit)
      return
    }

    const isProcessEnv =
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'process' &&
      node.name.text === 'env'

    const isStaticEnvironmentVariable =
      ts.isPropertyAccessExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'process' &&
      node.expression.name.text === 'env'

    if (isStaticEnvironmentVariable) {
      environmentReferences.push(node.name.text)
    } else if (isProcessEnv) {
      const parentReadsStaticVariable =
        ts.isPropertyAccessExpression(node.parent) &&
        node.parent.expression === node
      if (!parentReadsStaticVariable) environmentReferences.push(null)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return {
    isClient,
    environmentReferences,
    moduleSpecifiers,
    containsRawTailwindColor,
    browserStorageReferences,
  }
}
