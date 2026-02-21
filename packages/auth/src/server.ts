import type { NextRequest } from 'next/server'
import process from 'node:process'
import { db } from '@app-name/database'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export { toNextJsHandler } from 'better-auth/next-js'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [
    username({
      minUsernameLength: 4,
      maxUsernameLength: 10,
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
})

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user?.id || null
}

export const UNAUTHORIZED_RESPONSE = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401 },
)

export const NOT_FOUND_RESPONSE = NextResponse.json(
  { error: 'Not found' },
  { status: 404 },
)

export function handleError(error: unknown, action: string, resource: string = 'unknown') {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return NextResponse.json(
    { error: `failed to ${action} ${resource}`, message },
    { status: 500 },
  )
}

export function requestInterceptor<T extends NextRequest = NextRequest, P = unknown>(
  handler: (userId: string, request: T, params?: P) => Promise<Response> | Response,
) {
  return async (request: T, params?: P): Promise<Response> => {
    try {
      const userId = await getSessionUserId()
      if (!userId)
        return UNAUTHORIZED_RESPONSE
      return await handler(userId, request, params)
    }
    catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized')
        return UNAUTHORIZED_RESPONSE
      return handleError(error, 'process', 'request')
    }
  }
}
