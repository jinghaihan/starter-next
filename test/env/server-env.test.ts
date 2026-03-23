import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getAuthEnv,
  getDatabaseEnv,
  getMailEnv,
  getNotificationEnv,
  getPaymentPriceEnv,
  getPaymentProviderEnv,
  getStorageEnv,
  getSupabaseServerEnv,
} from '../../packages/env/src/server'

describe('server env validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('validates auth secret as required', () => {
    vi.stubEnv('BETTER_AUTH_SECRET', '')

    expect(() => getAuthEnv()).toThrow('[env:auth] BETTER_AUTH_SECRET is required')
  })

  it('validates oauth key pairs', () => {
    vi.stubEnv('BETTER_AUTH_SECRET', 'secret')
    vi.stubEnv('GITHUB_CLIENT_ID', 'github-id')
    vi.stubEnv('GITHUB_CLIENT_SECRET', '')

    expect(() => getAuthEnv()).toThrow(
      '[env:auth] GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be provided together',
    )
  })

  it('validates database env', () => {
    vi.stubEnv('SUPABASE_DATABASE_URL', '')

    expect(() => getDatabaseEnv()).toThrow('[env:database] SUPABASE_DATABASE_URL is required')
  })

  it('validates supabase server env', () => {
    vi.stubEnv('SUPABASE_URL', '')
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '')

    expect(() => getSupabaseServerEnv()).toThrow(
      '[env:supabase] SUPABASE_URL is required; SUPABASE_PUBLISHABLE_KEY is required',
    )
  })

  it('validates payment provider keys', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '')
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '')

    expect(() => getPaymentProviderEnv()).toThrow(
      '[env:payment-provider] STRIPE_SECRET_KEY is required; STRIPE_WEBHOOK_SECRET is required',
    )
  })

  it('returns payment price env by key', () => {
    vi.stubEnv('STRIPE_PRICE_PRO_MONTHLY', 'price_pro_monthly')

    expect(getPaymentPriceEnv('STRIPE_PRICE_PRO_MONTHLY')).toBe('price_pro_monthly')
  })

  it('validates storage keys and keeps optional urls', () => {
    vi.stubEnv('S3_ACCESS_KEY_ID', 'access')
    vi.stubEnv('S3_SECRET_ACCESS_KEY', 'secret')
    vi.stubEnv('S3_BUCKET_NAME', 'bucket')
    vi.stubEnv('S3_REGION', 'auto')
    vi.stubEnv('S3_ENDPOINT', 'https://r2.example.com')
    vi.stubEnv('S3_PUBLIC_URL', '')

    expect(getStorageEnv()).toEqual({
      S3_ACCESS_KEY_ID: 'access',
      S3_SECRET_ACCESS_KEY: 'secret',
      S3_BUCKET_NAME: 'bucket',
      S3_REGION: 'auto',
      S3_ENDPOINT: 'https://r2.example.com',
      S3_PUBLIC_URL: undefined,
    })
  })

  it('allows empty notification webhook', () => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', '')

    expect(getNotificationEnv()).toEqual({
      DISCORD_WEBHOOK_URL: undefined,
    })
  })

  it('validates resend newsletter keys', () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('RESEND_AUDIENCE_ID', '')
    vi.stubEnv('RESEND_FROM_EMAIL', '')

    expect(() => getMailEnv()).toThrow(
      '[env:mail] RESEND_API_KEY is required; RESEND_AUDIENCE_ID is required',
    )
  })
})
