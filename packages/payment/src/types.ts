import type { Stripe } from 'stripe'

export enum PlanIntervals {
  MONTH = 'month',
  YEAR = 'year',
}

export type PlanInterval = `${PlanIntervals}`

export enum PaymentTypes {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
}

export type PaymentType = `${PaymentTypes}`

export type PaymentStatus = 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid'
  | 'completed'
  | 'processing'
  | 'failed'

export interface CreateCheckoutParams {
  userId: string
  customerEmail: string
  priceId: string
  successUrl: string
  cancelUrl: string
  mode?: Stripe.Checkout.SessionCreateParams.Mode
  metadata?: Record<string, string>
}

export interface CheckoutResult {
  id: string
  url: string
}

export interface CreatePortalParams {
  customerId: string
  returnUrl: string
}

export interface PortalResult {
  url: string
}

export interface GetSubscriptionsParams {
  userId: string
}

export interface Subscription {
  id: string
  customerId: string
  priceId: string
  type: PaymentType
  status: PaymentStatus
  interval?: PlanInterval
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  trialStartDate?: Date
  trialEndDate?: Date
  createdAt: Date
}

export interface PaymentProvider {
  createCheckout: (params: CreateCheckoutParams) => Promise<CheckoutResult>
  createCustomerPortal: (params: CreatePortalParams) => Promise<PortalResult>
  getSubscriptions: (params: GetSubscriptionsParams) => Promise<Subscription[]>
  handleWebhookEvent: (payload: string, signature: string) => Promise<void>
}
