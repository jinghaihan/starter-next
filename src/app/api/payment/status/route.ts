import type { PaymentPlanKey } from '@app-name/payment'
import { requestInterceptor } from '@app-name/auth/server'
import { billingService } from '@app-name/database/services'
import { getPaymentPriceEnv } from '@app-name/env/server'
import { findCheckoutPlanByPriceId } from '@app-name/payment'
import { NextResponse } from 'next/server'

interface BillingStatusResponse {
  currentPlanKey: PaymentPlanKey | null
  hasLifetime: boolean
  subscription: {
    status: string
    priceId: string
    periodStart: Date | null
    periodEnd: Date | null
    cancelAtPeriodEnd: boolean | null
  } | null
}

export const GET = requestInterceptor(async (userId) => {
  try {
    const subscription = await billingService.getLatestSubscriptionByUserId(userId)
    const lifetimePriceId = getPaymentPriceEnv('STRIPE_PRICE_LIFETIME')

    const hasLifetime = lifetimePriceId
      ? await billingService.hasCompletedOneTimePaymentByPriceId(userId, lifetimePriceId)
      : false

    let currentPlanKey: PaymentPlanKey | null = null
    if (hasLifetime) {
      currentPlanKey = 'lifetime'
    }
    else if (subscription) {
      currentPlanKey = findCheckoutPlanByPriceId(subscription.priceId)?.key ?? null
    }

    const response: BillingStatusResponse = {
      currentPlanKey,
      hasLifetime,
      subscription,
    }

    return NextResponse.json(response)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load billing status'
    return NextResponse.json({ error: message }, { status: 400 })
  }
})
