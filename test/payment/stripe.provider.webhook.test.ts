import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  subscriptionsRetrieveMock: vi.fn(),
  insertMock: vi.fn(),
  valuesMock: vi.fn(),
  onConflictDoUpdateMock: vi.fn(),
  selectMock: vi.fn(),
  fromMock: vi.fn(),
  whereMock: vi.fn(),
  limitMock: vi.fn(),
}))

vi.mock('@app-name/database', () => ({
  db: {
    insert: mocks.insertMock,
    select: mocks.selectMock,
  },
}))

function createPaymentSessionEvent(type: string) {
  return {
    type,
    data: {
      object: {
        id: 'cs_test_123',
        mode: 'payment',
        customer: 'cus_test_123',
        metadata: {
          userId: 'user_test',
          priceId: 'price_test_123',
        },
      },
    },
  }
}

function createSubscriptionEvent(type: string) {
  return {
    type,
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        metadata: {
          userId: 'user_test',
        },
        items: {
          data: [
            {
              price: {
                id: 'price_sub_monthly_123',
                recurring: {
                  interval: 'month',
                },
              },
              current_period_start: 1735689600,
              current_period_end: 1738368000,
            },
          ],
        },
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
      },
    },
  }
}

function createCheckoutSubscriptionCompletedEvent() {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_sub_123',
        mode: 'subscription',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        metadata: {
          userId: 'user_test',
          priceId: 'price_sub_monthly_123',
        },
      },
    },
  }
}

async function createProvider() {
  const { StripeProvider } = await import('../../packages/payment/src/provider/stripe')
  const provider = new StripeProvider() as any
  provider.stripe = {
    webhooks: {
      constructEvent: mocks.constructEventMock,
    },
    subscriptions: {
      retrieve: mocks.subscriptionsRetrieveMock,
    },
  }
  return provider
}

describe('stripe provider webhook events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test')
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
    vi.stubEnv('DISCORD_WEBHOOK_URL', 'https://discord.example/webhook')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    mocks.onConflictDoUpdateMock.mockResolvedValue(undefined)
    mocks.valuesMock.mockReturnValue({
      onConflictDoUpdate: mocks.onConflictDoUpdateMock,
    })
    mocks.insertMock.mockReturnValue({
      values: mocks.valuesMock,
    })

    mocks.limitMock.mockResolvedValue([])
    mocks.whereMock.mockReturnValue({ limit: mocks.limitMock })
    mocks.fromMock.mockReturnValue({ where: mocks.whereMock })
    mocks.selectMock.mockReturnValue({ from: mocks.fromMock })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('maps checkout.session.async_payment_failed to failed status', async () => {
    mocks.constructEventMock.mockReturnValueOnce(
      createPaymentSessionEvent('checkout.session.async_payment_failed'),
    )

    const provider = await createProvider()
    await provider.handleWebhookEvent('payload', 'signature')

    const inserted = mocks.valuesMock.mock.calls[0]?.[0]
    expect(inserted.status).toBe('failed')
    expect(mocks.onConflictDoUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      set: expect.objectContaining({
        status: 'failed',
      }),
    }))
  })

  it('maps checkout.session.expired to canceled status', async () => {
    mocks.constructEventMock.mockReturnValueOnce(
      createPaymentSessionEvent('checkout.session.expired'),
    )

    const provider = await createProvider()
    await provider.handleWebhookEvent('payload', 'signature')

    const inserted = mocks.valuesMock.mock.calls[0]?.[0]
    expect(inserted.status).toBe('canceled')
    expect(mocks.onConflictDoUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      set: expect.objectContaining({
        status: 'canceled',
      }),
    }))
  })

  it('maps checkout.session.async_payment_succeeded to completed status', async () => {
    mocks.constructEventMock.mockReturnValueOnce(
      createPaymentSessionEvent('checkout.session.async_payment_succeeded'),
    )

    const provider = await createProvider()
    await provider.handleWebhookEvent('payload', 'signature')

    const inserted = mocks.valuesMock.mock.calls[0]?.[0]
    expect(inserted.status).toBe('completed')
    expect(inserted.periodStart).toBeInstanceOf(Date)
    expect(mocks.subscriptionsRetrieveMock).not.toHaveBeenCalled()
  })

  it('upserts subscription data for customer.subscription.updated', async () => {
    mocks.constructEventMock.mockReturnValueOnce(
      createSubscriptionEvent('customer.subscription.updated'),
    )

    const provider = await createProvider()
    await provider.handleWebhookEvent('payload', 'signature')

    const inserted = mocks.valuesMock.mock.calls[0]?.[0]
    expect(inserted.type).toBe('subscription')
    expect(inserted.subscriptionId).toBe('sub_test_123')
    expect(inserted.priceId).toBe('price_sub_monthly_123')
    expect(inserted.status).toBe('active')
    expect(inserted.interval).toBe('month')
  })

  it('handles checkout subscription completion by retrieving subscription', async () => {
    mocks.constructEventMock.mockReturnValueOnce(
      createCheckoutSubscriptionCompletedEvent(),
    )
    mocks.subscriptionsRetrieveMock.mockResolvedValueOnce(
      createSubscriptionEvent('customer.subscription.updated').data.object,
    )

    const provider = await createProvider()
    await provider.handleWebhookEvent('payload', 'signature')

    expect(mocks.subscriptionsRetrieveMock).toHaveBeenCalledWith('sub_test_123')
    const inserted = mocks.valuesMock.mock.calls[0]?.[0]
    expect(inserted.type).toBe('subscription')
    expect(inserted.subscriptionId).toBe('sub_test_123')
  })
})
