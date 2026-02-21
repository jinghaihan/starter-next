import process from 'node:process'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schemas/index.ts',
  out: './src/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
