import type {
  CheckoutResult,
  CreateCheckoutParams,
  CreatePortalParams,
  GetSubscriptionsParams,
  PaymentProvider,
  PortalResult,
  Subscription,
} from './types'
import { StripeProvider } from './provider/stripe'

let provider: PaymentProvider | null = null

function getPaymentProvider(): PaymentProvider {
  if (!provider)
    provider = new StripeProvider()
  return provider
}

export async function createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
  return await getPaymentProvider().createCheckout(params)
}

export async function createCustomerPortal(params: CreatePortalParams): Promise<PortalResult> {
  return await getPaymentProvider().createCustomerPortal(params)
}

export async function getSubscriptions(params: GetSubscriptionsParams): Promise<Subscription[]> {
  return await getPaymentProvider().getSubscriptions(params)
}

export async function handleWebhookEvent(payload: string, signature: string): Promise<void> {
  await getPaymentProvider().handleWebhookEvent(payload, signature)
}

export * from './catalog'
export * from './types'
