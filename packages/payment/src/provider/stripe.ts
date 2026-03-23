import type {
  CheckoutResult,
  CreateCheckoutParams,
  CreatePortalParams,
  GetSubscriptionsParams,
  PaymentProvider,
  PaymentStatus,
  PlanInterval,
  PortalResult,
  Subscription,
} from '../types'
import { randomUUID } from 'node:crypto'
import { db } from '@app-name/database'
import { payment } from '@app-name/database/schemas'
import { getPaymentProviderEnv } from '@app-name/env/server'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import Stripe from 'stripe'
import { sendDiscordNotification } from '../notification/discord'
import { PaymentTypes, PlanIntervals } from '../types'

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe
  private webhookSecret: string

  constructor() {
    const env = getPaymentProviderEnv()
    const apiKey = env.STRIPE_SECRET_KEY
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET

    this.stripe = new Stripe(apiKey)
    this.webhookSecret = webhookSecret
  }

  public async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const {
      userId,
      customerEmail,
      priceId,
      successUrl,
      cancelUrl,
      metadata,
      mode = 'subscription',
    } = params

    const customerId = await this.createOrGetCustomer(customerEmail)
    const session = await this.stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        userId,
        priceId,
      },
    })

    if (!session.url)
      throw new Error('Stripe checkout session URL is empty')

    return {
      id: session.id,
      url: session.url,
    }
  }

  public async createCustomerPortal(params: CreatePortalParams): Promise<PortalResult> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    })

    return { url: session.url }
  }

  public async getSubscriptions(params: GetSubscriptionsParams): Promise<Subscription[]> {
    const rows = await db
      .select()
      .from(payment)
      .where(and(
        eq(payment.userId, params.userId),
        eq(payment.type, PaymentTypes.SUBSCRIPTION),
      ))
      .orderBy(desc(payment.createdAt))

    return rows.map(row => ({
      id: row.subscriptionId ?? '',
      customerId: row.customerId,
      priceId: row.priceId,
      type: row.type as `${PaymentTypes}`,
      status: row.status as PaymentStatus,
      interval: row.interval as PlanInterval | undefined,
      currentPeriodStart: row.periodStart ?? undefined,
      currentPeriodEnd: row.periodEnd ?? undefined,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd ?? undefined,
      trialStartDate: row.trialStart ?? undefined,
      trialEndDate: row.trialEnd ?? undefined,
      createdAt: row.createdAt,
    }))
  }

  public async handleWebhookEvent(payload: string, signature: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        await this.onCheckoutSessionCompleted(session)
        break
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        await this.onCheckoutSessionFailed(session, 'failed')
        break
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await this.onCheckoutSessionFailed(session, 'canceled')
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await this.onSubscriptionChanged(subscription)
        break
      }
      default:
        break
    }
  }

  private async createOrGetCustomer(email: string): Promise<string> {
    const existing = await this.stripe.customers.list({
      email,
      limit: 1,
    })

    if (existing.data[0]?.id)
      return existing.data[0].id

    const created = await this.stripe.customers.create({ email })
    return created.id
  }

  private async onCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const payload = this.extractCheckoutPayload(session)
    if (!payload)
      return

    if (session.mode === 'subscription') {
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : null
      if (!subscriptionId)
        return
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      await this.onSubscriptionChanged(subscription, payload.userId)
      return
    }

    if (session.mode === 'payment') {
      await this.upsertOneTimePayment(session, payload, 'completed')
      await sendDiscordNotification(
        `[payment] one-time completed | user=${payload.userId} price=${payload.priceId} session=${session.id}`,
      )
    }
  }

  private async onCheckoutSessionFailed(
    session: Stripe.Checkout.Session,
    status: Extract<PaymentStatus, 'failed' | 'canceled'>,
  ): Promise<void> {
    if (session.mode !== 'payment')
      return

    const payload = this.extractCheckoutPayload(session)
    if (!payload)
      return

    await this.upsertOneTimePayment(session, payload, status)
    await sendDiscordNotification(
      `[payment] one-time ${status} | user=${payload.userId} price=${payload.priceId} session=${session.id}`,
    )
  }

  private async onSubscriptionChanged(
    subscription: Stripe.Subscription,
    userIdFromSession?: string,
  ): Promise<void> {
    const firstItem = subscription.items.data[0]
    const existing = await db
      .select({
        userId: payment.userId,
      })
      .from(payment)
      .where(eq(payment.subscriptionId, subscription.id))
      .limit(1)

    const userId = userIdFromSession ?? subscription.metadata.userId ?? existing[0]?.userId
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : null
    const priceId = subscription.items.data[0]?.price.id

    if (!userId || !customerId || !priceId)
      return

    await db.insert(payment).values({
      id: randomUUID(),
      priceId,
      type: PaymentTypes.SUBSCRIPTION,
      interval: this.mapStripeIntervalToPlanInterval(subscription),
      userId,
      customerId,
      subscriptionId: subscription.id,
      status: this.mapStripeSubscriptionStatus(subscription.status),
      periodStart: this.fromUnix(firstItem?.current_period_start ?? null),
      periodEnd: this.fromUnix(firstItem?.current_period_end ?? null),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: this.fromUnix(subscription.trial_start),
      trialEnd: this.fromUnix(subscription.trial_end),
    }).onConflictDoUpdate({
      target: payment.subscriptionId,
      set: {
        priceId,
        interval: this.mapStripeIntervalToPlanInterval(subscription),
        status: this.mapStripeSubscriptionStatus(subscription.status),
        periodStart: this.fromUnix(firstItem?.current_period_start ?? null),
        periodEnd: this.fromUnix(firstItem?.current_period_end ?? null),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart: this.fromUnix(subscription.trial_start),
        trialEnd: this.fromUnix(subscription.trial_end),
        updatedAt: new Date(),
      },
    })

    await sendDiscordNotification(
      `[payment] subscription ${subscription.status} | user=${userId} sub=${subscription.id} price=${priceId}`,
    )
  }

  public async findLatestCustomerIdByUserId(userId: string): Promise<string | null> {
    const rows = await db
      .select({
        customerId: payment.customerId,
      })
      .from(payment)
      .where(and(
        eq(payment.userId, userId),
        isNotNull(payment.customerId),
      ))
      .orderBy(desc(payment.createdAt))
      .limit(1)

    return rows[0]?.customerId ?? null
  }

  private mapStripeIntervalToPlanInterval(subscription: Stripe.Subscription): PlanInterval {
    const interval = subscription.items.data[0]?.price?.recurring?.interval
    if (interval === 'year')
      return PlanIntervals.YEAR
    return PlanIntervals.MONTH
  }

  private mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): PaymentStatus {
    const mapping: Record<Stripe.Subscription.Status, PaymentStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      past_due: 'past_due',
      paused: 'paused',
      trialing: 'trialing',
      unpaid: 'unpaid',
    }
    return mapping[status] ?? 'failed'
  }

  private fromUnix(value: number | null): Date | null {
    if (!value)
      return null
    return new Date(value * 1000)
  }

  private extractCheckoutPayload(session: Stripe.Checkout.Session): {
    userId: string
    priceId: string
    customerId: string
  } | null {
    const userId = session.metadata?.userId
    const priceId = session.metadata?.priceId
    const customerId = typeof session.customer === 'string' ? session.customer : null
    if (!userId || !priceId || !customerId)
      return null
    return {
      userId,
      priceId,
      customerId,
    }
  }

  private async upsertOneTimePayment(
    session: Stripe.Checkout.Session,
    payload: {
      userId: string
      priceId: string
      customerId: string
    },
    status: Extract<PaymentStatus, 'completed' | 'failed' | 'canceled'>,
  ): Promise<void> {
    await db.insert(payment).values({
      id: randomUUID(),
      priceId: payload.priceId,
      type: PaymentTypes.ONE_TIME,
      userId: payload.userId,
      customerId: payload.customerId,
      sessionId: session.id,
      status,
      periodStart: status === 'completed' ? new Date() : null,
    }).onConflictDoUpdate({
      target: payment.sessionId,
      set: {
        status,
        updatedAt: new Date(),
      },
    })
  }
}
