import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getLatestSubscriptionByUserIdMock,
  hasCompletedOneTimePaymentByPriceIdMock,
  getPaymentPriceEnvMock,
  findCheckoutPlanByPriceIdMock,
} = vi.hoisted(() => ({
  getLatestSubscriptionByUserIdMock: vi.fn(),
  hasCompletedOneTimePaymentByPriceIdMock: vi.fn(),
  getPaymentPriceEnvMock: vi.fn(),
  findCheckoutPlanByPriceIdMock: vi.fn(),
}))

vi.mock('@app-name/auth/server', () => ({
  requestInterceptor: (handler: (userId: string) => Promise<Response>) =>
    async () => await handler('user_test'),
}))

vi.mock('@app-name/database/services', () => ({
  billingService: {
    getLatestSubscriptionByUserId: getLatestSubscriptionByUserIdMock,
    hasCompletedOneTimePaymentByPriceId: hasCompletedOneTimePaymentByPriceIdMock,
  },
}))

vi.mock('@app-name/env/server', () => ({
  getPaymentPriceEnv: getPaymentPriceEnvMock,
}))

vi.mock('@app-name/payment', () => ({
  findCheckoutPlanByPriceId: findCheckoutPlanByPriceIdMock,
}))

async function callGet() {
  const { GET } = await import('../../../src/app/api/payment/status/route')
  return await GET(new Request('http://localhost/api/payment/status') as any)
}

describe('get /api/payment/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns lifetime plan when completed lifetime payment exists', async () => {
    getLatestSubscriptionByUserIdMock.mockResolvedValueOnce(null)
    getPaymentPriceEnvMock.mockReturnValueOnce('price_lifetime')
    hasCompletedOneTimePaymentByPriceIdMock.mockResolvedValueOnce(true)

    const response = await callGet()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.currentPlanKey).toBe('lifetime')
    expect(body.hasLifetime).toBe(true)
  })

  it('returns subscription plan when subscription exists', async () => {
    getLatestSubscriptionByUserIdMock.mockResolvedValueOnce({
      priceId: 'price_pro_monthly',
      status: 'active',
      periodStart: null,
      periodEnd: null,
      cancelAtPeriodEnd: false,
    })
    getPaymentPriceEnvMock.mockReturnValueOnce('price_lifetime')
    hasCompletedOneTimePaymentByPriceIdMock.mockResolvedValueOnce(false)
    findCheckoutPlanByPriceIdMock.mockReturnValueOnce({
      key: 'pro_monthly',
      priceId: 'price_pro_monthly',
      mode: 'subscription',
      category: 'subscription',
    })

    const response = await callGet()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.currentPlanKey).toBe('pro_monthly')
    expect(body.subscription.status).toBe('active')
  })

  it('returns null current plan when nothing purchased', async () => {
    getLatestSubscriptionByUserIdMock.mockResolvedValueOnce(null)
    getPaymentPriceEnvMock.mockReturnValueOnce(undefined)

    const response = await callGet()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.currentPlanKey).toBe(null)
    expect(body.hasLifetime).toBe(false)
    expect(body.subscription).toBe(null)
    expect(hasCompletedOneTimePaymentByPriceIdMock).not.toHaveBeenCalled()
  })
})
