import process from 'node:process'
import { usernameClient } from 'better-auth/client/plugins'
import { nextCookies } from 'better-auth/next-js'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    usernameClient(),
    nextCookies(),
  ],
})
