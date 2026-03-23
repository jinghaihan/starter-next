import { getDatabaseEnv } from '@app-name/env/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schemas'

const databaseEnv = getDatabaseEnv()
const client = postgres(databaseEnv.SUPABASE_DATABASE_URL)
export const db = drizzle(client, { schema })
