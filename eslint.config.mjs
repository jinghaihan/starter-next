import { defineConfig } from '@octohash/eslint-config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig(
  {
    react: true,
    tailwindcss: true,
    formatters: true,
    plugins: [
      nextVitals,
      nextTs,
    ],
    ignores: [
      // Default ignores of eslint-config-next:
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'types/*.d.ts',

      // Shadcn UI
      'packages/shadcn/src/components/ui/**',
    ],
  },
)
