import { getDatabaseEnv } from '@app-name/env/server'
import { defineConfig } from 'drizzle-kit'

const databaseEnv = getDatabaseEnv()

export default defineConfig({
  schema: './src/schemas/index.ts',
  out: './src/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseEnv.SUPABASE_DATABASE_URL,
  },
})
