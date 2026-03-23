import { requestInterceptor } from '@app-name/auth/server'
import { billingService } from '@app-name/database/services'
import { createCustomerPortal } from '@app-name/payment'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  returnUrl: z.url().optional(),
})

export const POST = requestInterceptor(async (userId, request) => {
  try {
    const body = requestSchema.parse(await request.json())
    const origin = new URL(request.url).origin
    const customerId = await billingService.getLatestCustomerIdByUserId(userId)
    if (!customerId)
      return NextResponse.json({ error: 'No billing customer found for user' }, { status: 404 })

    const portal = await createCustomerPortal({
      customerId,
      returnUrl: body.returnUrl ?? `${origin}/dashboard`,
    })

    return NextResponse.json(portal)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create billing portal'
    return NextResponse.json({ error: message }, { status: 400 })
  }
})
