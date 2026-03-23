import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ENV_EXAMPLE_PATH = resolve(process.cwd(), '.env.example')

function readEnvExample() {
  return readFileSync(ENV_EXAMPLE_PATH, 'utf8')
}

describe('.env.example contract', () => {
  it('contains required platform-prefixed keys', () => {
    const content = readEnvExample()

    const requiredKeys = [
      'BETTER_AUTH_URL=',
      'BETTER_AUTH_SECRET=',
      'GITHUB_CLIENT_ID=',
      'GITHUB_CLIENT_SECRET=',
      'GOOGLE_CLIENT_ID=',
      'GOOGLE_CLIENT_SECRET=',
      'SUPABASE_DATABASE_URL=',
      'SUPABASE_URL=',
      'SUPABASE_PUBLISHABLE_KEY=',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'STRIPE_SECRET_KEY=',
      'STRIPE_WEBHOOK_SECRET=',
      'STRIPE_PRICE_PRO_MONTHLY=',
      'STRIPE_PRICE_PRO_YEARLY=',
      'STRIPE_PRICE_LIFETIME=',
      'STRIPE_PRICE_CREDITS_BASIC=',
      'STRIPE_PRICE_CREDITS_STANDARD=',
      'STRIPE_PRICE_CREDITS_PREMIUM=',
      'STRIPE_PRICE_CREDITS_ENTERPRISE=',
      'RESEND_API_KEY=',
      'RESEND_AUDIENCE_ID=',
      'RESEND_FROM_EMAIL=',
      'S3_ENDPOINT=',
      'S3_REGION=',
      'S3_BUCKET_NAME=',
      'S3_ACCESS_KEY_ID=',
      'S3_SECRET_ACCESS_KEY=',
      'S3_PUBLIC_URL=',
      'DISCORD_WEBHOOK_URL=',
      'AFFONSO_AFFILIATE_ID=',
    ]

    for (const key of requiredKeys)
      expect(content).toContain(key)
  })

  it('does not include deprecated key naming', () => {
    const content = readEnvExample()

    expect(content).not.toContain('\nDATABASE_URL=')
    expect(content).not.toContain('\nSTORAGE_REGION=')
    expect(content).not.toContain('\nNEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=')
    expect(content).not.toContain('\nNEXT_PUBLIC_AFFILIATE_AFFONSO_ID=')
  })

  it('includes source links for key setup', () => {
    const content = readEnvExample()

    const requiredLinks = [
      'https://www.better-auth.com/docs/installation',
      'https://github.com/settings/developers',
      'https://console.cloud.google.com/apis/credentials',
      'https://supabase.com/dashboard/project/_/settings/api',
      'https://dashboard.stripe.com',
      'https://resend.com/dashboard/api-keys',
      'https://resend.com/audiences',
      'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
      'https://developers.cloudflare.com/r2/get-started/s3/',
      'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks',
      'https://affonso.com/',
    ]

    for (const link of requiredLinks)
      expect(content).toContain(link)
  })
})
