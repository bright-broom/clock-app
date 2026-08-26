import { readdirSync } from 'node:fs'

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const featureNames = readdirSync(new URL('./src/features', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const featureIsolationZones = featureNames.map((featureName) => ({
  target: `./src/features/${featureName}`,
  from: './src/features',
  except: [`./${featureName}`],
  message: `${featureName} must not depend on another feature. Extract shared code instead.`,
}))

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'import/no-duplicates': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Import a Feature through its public index instead of a deep path.',
            },
          ],
        },
      ],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/lib',
              from: './src/components',
              message: 'lib must not depend on shared UI components.',
            },
            {
              target: './src/lib',
              from: './src/features',
              message: 'lib must not depend on product features.',
            },
            {
              target: './src/lib',
              from: './src/app',
              message: 'lib must not depend on the routing layer.',
            },
            {
              target: './src/components',
              from: './src/features',
              message: 'shared components must not depend on product features.',
            },
            {
              target: './src/components',
              from: './src/app',
              message:
                'shared components must not depend on the routing layer.',
            },
            {
              target: './src/features',
              from: './src/app',
              message: 'features must not depend on the routing layer.',
            },
            ...featureIsolationZones,
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  prettier,
  globalIgnores([
    '.next/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'next.config.js',
    'src/types/next-intl.d.ts',
    'vitest.config.ts',
  ]),
])
