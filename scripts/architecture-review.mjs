import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const rootPath = fileURLToPath(root)
const failures = []

function read(relativePath) {
  return readFileSync(new URL(relativePath, root), 'utf8')
}

function requireFile(relativePath) {
  if (!existsSync(new URL(relativePath, root))) {
    failures.push(`Missing required architecture file: ${relativePath}`)
  }
}

function requireText(relativePath, expectedText) {
  const contents = read(relativePath)
  if (!contents.includes(expectedText)) {
    failures.push(`${relativePath} must contain: ${expectedText}`)
  }
}

for (const file of ['AGENTS.md', 'README.md', 'docs/architecture.md']) {
  requireFile(file)
}

requireText('AGENTS.md', 'Automated Principal Review')
requireText('AGENTS.md', 'app -> features -> components -> lib')
requireText('README.md', 'src/features/')
requireText('docs/architecture.md', 'Feature の公開 API')
requireText('package.json', '"verify"')
requireText('.github/workflows/ci.yml', 'npm run test:e2e')

const featuresRoot = join(rootPath, 'src/features')
for (const entry of readdirSync(featuresRoot, { withFileTypes: true })) {
  if (
    entry.isDirectory() &&
    !existsSync(join(featuresRoot, entry.name, 'index.ts'))
  ) {
    failures.push(
      `Feature is missing its public API: src/features/${entry.name}/index.ts`
    )
  }
}

const appFiles = []
function collectTypeScript(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collectTypeScript(path)
    else if (/\.(ts|tsx)$/.test(entry.name)) appFiles.push(path)
  }
}
collectTypeScript(join(rootPath, 'src/app'))

const deepFeatureImport = /from ['"]@\/features\/[^/'"]+\//
for (const file of appFiles) {
  if (deepFeatureImport.test(readFileSync(file, 'utf8'))) {
    failures.push(`App must import a Feature through its public API: ${file}`)
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
