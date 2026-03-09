import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveCheckoutPlan } from '../../packages/payment/src/catalog'

describe('payment catalog', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('resolves subscription plan key', () => {
    vi.stubEnv('STRIPE_PRICE_PRO_MONTHLY', 'price_monthly_123')

    const plan = resolveCheckoutPlan('pro_monthly')

    expect(plan).toEqual({
      key: 'pro_monthly',
      priceId: 'price_monthly_123',
      mode: 'subscription',
      category: 'subscription',
    })
  })

  it('resolves one-time plans as payment mode', () => {
    vi.stubEnv('STRIPE_PRICE_LIFETIME', 'price_lifetime_123')
    vi.stubEnv('STRIPE_PRICE_CREDITS_BASIC', 'price_credits_basic_123')

    const lifetime = resolveCheckoutPlan('lifetime')
    const credits = resolveCheckoutPlan('credits_basic')

    expect(lifetime.mode).toBe('payment')
    expect(lifetime.category).toBe('lifetime')
    expect(credits.mode).toBe('payment')
    expect(credits.category).toBe('credits')
  })

  it('resolves every supported plan key', () => {
    vi.stubEnv('STRIPE_PRICE_PRO_MONTHLY', 'price_pro_monthly')
    vi.stubEnv('STRIPE_PRICE_PRO_YEARLY', 'price_pro_yearly')
    vi.stubEnv('STRIPE_PRICE_LIFETIME', 'price_lifetime')
    vi.stubEnv('STRIPE_PRICE_CREDITS_BASIC', 'price_credits_basic')
    vi.stubEnv('STRIPE_PRICE_CREDITS_STANDARD', 'price_credits_standard')
    vi.stubEnv('STRIPE_PRICE_CREDITS_PREMIUM', 'price_credits_premium')
    vi.stubEnv('STRIPE_PRICE_CREDITS_ENTERPRISE', 'price_credits_enterprise')

    expect(resolveCheckoutPlan('pro_monthly')).toEqual(expect.objectContaining({
      key: 'pro_monthly',
      mode: 'subscription',
      category: 'subscription',
    }))
    expect(resolveCheckoutPlan('pro_yearly')).toEqual(expect.objectContaining({
      key: 'pro_yearly',
      mode: 'subscription',
      category: 'subscription',
    }))
    expect(resolveCheckoutPlan('lifetime')).toEqual(expect.objectContaining({
      key: 'lifetime',
      mode: 'payment',
      category: 'lifetime',
    }))
    expect(resolveCheckoutPlan('credits_basic')).toEqual(expect.objectContaining({
      key: 'credits_basic',
      mode: 'payment',
      category: 'credits',
    }))
    expect(resolveCheckoutPlan('credits_standard')).toEqual(expect.objectContaining({
      key: 'credits_standard',
      mode: 'payment',
      category: 'credits',
    }))
    expect(resolveCheckoutPlan('credits_premium')).toEqual(expect.objectContaining({
      key: 'credits_premium',
      mode: 'payment',
      category: 'credits',
    }))
    expect(resolveCheckoutPlan('credits_enterprise')).toEqual(expect.objectContaining({
      key: 'credits_enterprise',
      mode: 'payment',
      category: 'credits',
    }))
  })

  it('throws when plan key is unsupported', () => {
    expect(() => resolveCheckoutPlan('unknown_plan')).toThrow('Unsupported plan key: unknown_plan')
  })

  it('throws when env is missing for plan', () => {
    expect(() => resolveCheckoutPlan('pro_yearly')).toThrow(
      'Missing STRIPE_PRICE_PRO_YEARLY for plan "pro_yearly"',
    )
  })
})
