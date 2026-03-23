import { requestInterceptor } from '@app-name/auth/server'
import { billingService } from '@app-name/database/services'
import { createCheckout, resolveCheckoutPlan } from '@app-name/payment'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  planKey: z.string().min(1),
  successUrl: z.url().optional(),
  cancelUrl: z.url().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

export const POST = requestInterceptor(async (userId, request) => {
  try {
    const body = requestSchema.parse(await request.json())
    const plan = resolveCheckoutPlan(body.planKey)
    const customerEmail = await billingService.getUserEmailById(userId)
    if (!customerEmail)
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })

    const origin = new URL(request.url).origin
    const checkout = await createCheckout({
      userId,
      customerEmail,
      priceId: plan.priceId,
      mode: plan.mode,
      successUrl: body.successUrl ?? `${origin}/dashboard`,
      cancelUrl: body.cancelUrl ?? `${origin}/dashboard`,
      metadata: {
        ...(body.metadata ?? {}),
        planKey: plan.key,
      },
    })

    return NextResponse.json(checkout)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 400 })
  }
})
