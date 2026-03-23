import type { StripePriceEnvKey } from '@app-name/env/server'
import type { Stripe } from 'stripe'
import { getPaymentPriceEnv } from '@app-name/env/server'

export const PAYMENT_PLAN_KEYS = [
  'pro_monthly',
  'pro_yearly',
  'lifetime',
  'credits_basic',
  'credits_standard',
  'credits_premium',
  'credits_enterprise',
] as const

export type PaymentPlanKey = (typeof PAYMENT_PLAN_KEYS)[number]
export type PaymentPlanCategory = 'subscription' | 'lifetime' | 'credits'

interface PlanDefinition {
  envKey: StripePriceEnvKey
  mode: Stripe.Checkout.SessionCreateParams.Mode
  category: PaymentPlanCategory
}

const PAYMENT_PLAN_DEFINITIONS: Record<PaymentPlanKey, PlanDefinition> = {
  pro_monthly: {
    envKey: 'STRIPE_PRICE_PRO_MONTHLY',
    mode: 'subscription',
    category: 'subscription',
  },
  pro_yearly: {
    envKey: 'STRIPE_PRICE_PRO_YEARLY',
    mode: 'subscription',
    category: 'subscription',
  },
  lifetime: {
    envKey: 'STRIPE_PRICE_LIFETIME',
    mode: 'payment',
    category: 'lifetime',
  },
  credits_basic: {
    envKey: 'STRIPE_PRICE_CREDITS_BASIC',
    mode: 'payment',
    category: 'credits',
  },
  credits_standard: {
    envKey: 'STRIPE_PRICE_CREDITS_STANDARD',
    mode: 'payment',
    category: 'credits',
  },
  credits_premium: {
    envKey: 'STRIPE_PRICE_CREDITS_PREMIUM',
    mode: 'payment',
    category: 'credits',
  },
  credits_enterprise: {
    envKey: 'STRIPE_PRICE_CREDITS_ENTERPRISE',
    mode: 'payment',
    category: 'credits',
  },
}

export interface ResolvedCheckoutPlan {
  key: PaymentPlanKey
  priceId: string
  mode: Stripe.Checkout.SessionCreateParams.Mode
  category: PaymentPlanCategory
}

export function isPaymentPlanKey(value: string): value is PaymentPlanKey {
  return value in PAYMENT_PLAN_DEFINITIONS
}

export function resolveCheckoutPlan(rawPlanKey: string): ResolvedCheckoutPlan {
  const planKey = rawPlanKey.trim().toLowerCase()
  if (!isPaymentPlanKey(planKey))
    throw new Error(`Unsupported plan key: ${rawPlanKey}`)

  const definition = PAYMENT_PLAN_DEFINITIONS[planKey]
  const priceId = getPaymentPriceEnv(definition.envKey)
  if (!priceId)
    throw new Error(`Missing ${definition.envKey} for plan "${planKey}"`)

  return {
    key: planKey,
    priceId,
    mode: definition.mode,
    category: definition.category,
  }
}

export function listCheckoutPlanKeys(): PaymentPlanKey[] {
  return [...PAYMENT_PLAN_KEYS]
}

export function findCheckoutPlanByPriceId(priceId: string): ResolvedCheckoutPlan | null {
  const normalizedPriceId = priceId.trim()
  if (!normalizedPriceId)
    return null

  for (const planKey of PAYMENT_PLAN_KEYS) {
    const definition = PAYMENT_PLAN_DEFINITIONS[planKey]
    const configuredPriceId = getPaymentPriceEnv(definition.envKey)
    if (!configuredPriceId || configuredPriceId !== normalizedPriceId)
      continue

    return {
      key: planKey,
      priceId: configuredPriceId,
      mode: definition.mode,
      category: definition.category,
    }
  }

  return null
}
