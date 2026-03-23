import process from 'node:process'
import { z } from 'zod'

const nonEmpty = (key: string) => z.string().trim().min(1, `${key} is required`)
const optionalTrimmed = z.string().trim().optional().transform(value => value || undefined)

function parseEnv<T>(scope: string, schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(process.env)
  if (parsed.success)
    return parsed.data

  const messages = parsed.error.issues.map(issue => issue.message).join('; ')
  throw new Error(`[env:${scope}] ${messages}`)
}

const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: nonEmpty('BETTER_AUTH_SECRET'),
  GITHUB_CLIENT_ID: optionalTrimmed,
  GITHUB_CLIENT_SECRET: optionalTrimmed,
  GOOGLE_CLIENT_ID: optionalTrimmed,
  GOOGLE_CLIENT_SECRET: optionalTrimmed,
}).superRefine((value, ctx) => {
  const hasGithubId = Boolean(value.GITHUB_CLIENT_ID)
  const hasGithubSecret = Boolean(value.GITHUB_CLIENT_SECRET)
  if (hasGithubId !== hasGithubSecret) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be provided together',
    })
  }

  const hasGoogleId = Boolean(value.GOOGLE_CLIENT_ID)
  const hasGoogleSecret = Boolean(value.GOOGLE_CLIENT_SECRET)
  if (hasGoogleId !== hasGoogleSecret) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided together',
    })
  }
})

const databaseEnvSchema = z.object({
  SUPABASE_DATABASE_URL: nonEmpty('SUPABASE_DATABASE_URL'),
})

const supabaseServerEnvSchema = z.object({
  SUPABASE_URL: nonEmpty('SUPABASE_URL'),
  SUPABASE_PUBLISHABLE_KEY: nonEmpty('SUPABASE_PUBLISHABLE_KEY'),
})

const paymentProviderEnvSchema = z.object({
  STRIPE_SECRET_KEY: nonEmpty('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: nonEmpty('STRIPE_WEBHOOK_SECRET'),
})

const paymentPricesEnvSchema = z.object({
  STRIPE_PRICE_PRO_MONTHLY: optionalTrimmed,
  STRIPE_PRICE_PRO_YEARLY: optionalTrimmed,
  STRIPE_PRICE_LIFETIME: optionalTrimmed,
  STRIPE_PRICE_CREDITS_BASIC: optionalTrimmed,
  STRIPE_PRICE_CREDITS_STANDARD: optionalTrimmed,
  STRIPE_PRICE_CREDITS_PREMIUM: optionalTrimmed,
  STRIPE_PRICE_CREDITS_ENTERPRISE: optionalTrimmed,
})

const storageEnvSchema = z.object({
  S3_ACCESS_KEY_ID: nonEmpty('S3_ACCESS_KEY_ID'),
  S3_SECRET_ACCESS_KEY: nonEmpty('S3_SECRET_ACCESS_KEY'),
  S3_BUCKET_NAME: nonEmpty('S3_BUCKET_NAME'),
  S3_REGION: nonEmpty('S3_REGION'),
  S3_ENDPOINT: optionalTrimmed,
  S3_PUBLIC_URL: optionalTrimmed,
})

const notificationEnvSchema = z.object({
  DISCORD_WEBHOOK_URL: optionalTrimmed,
})

const mailEnvSchema = z.object({
  RESEND_API_KEY: nonEmpty('RESEND_API_KEY'),
  RESEND_AUDIENCE_ID: nonEmpty('RESEND_AUDIENCE_ID'),
  RESEND_FROM_EMAIL: optionalTrimmed,
})

export type StripePriceEnvKey = keyof Pick<z.infer<typeof paymentPricesEnvSchema>, | 'STRIPE_PRICE_PRO_MONTHLY'
  | 'STRIPE_PRICE_PRO_YEARLY'
  | 'STRIPE_PRICE_LIFETIME'
  | 'STRIPE_PRICE_CREDITS_BASIC'
  | 'STRIPE_PRICE_CREDITS_STANDARD'
  | 'STRIPE_PRICE_CREDITS_PREMIUM'
  | 'STRIPE_PRICE_CREDITS_ENTERPRISE'>

export function getAuthEnv() {
  return parseEnv('auth', authEnvSchema)
}

export function getDatabaseEnv() {
  return parseEnv('database', databaseEnvSchema)
}

export function getSupabaseServerEnv() {
  return parseEnv('supabase', supabaseServerEnvSchema)
}

export function getPaymentProviderEnv() {
  return parseEnv('payment-provider', paymentProviderEnvSchema)
}

export function getPaymentPriceEnv(key: StripePriceEnvKey): string | undefined {
  const env = parseEnv('payment-prices', paymentPricesEnvSchema)
  return env[key]
}

export function getStorageEnv() {
  return parseEnv('storage', storageEnvSchema)
}

export function getNotificationEnv() {
  return parseEnv('notification', notificationEnvSchema)
}

export function getMailEnv() {
  return parseEnv('mail', mailEnvSchema)
}
