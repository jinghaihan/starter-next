import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createCheckoutMock, getUserEmailByIdMock, resolveCheckoutPlanMock } = vi.hoisted(() => ({
  createCheckoutMock: vi.fn(),
  getUserEmailByIdMock: vi.fn(),
  resolveCheckoutPlanMock: vi.fn(),
}))

vi.mock('@app-name/auth/server', () => ({
  requestInterceptor: (handler: (userId: string, request: Request) => Promise<Response>) =>
    async (request: Request) => await handler('user_test', request),
}))

vi.mock('@app-name/database/services', () => ({
  billingService: {
    getUserEmailById: getUserEmailByIdMock,
  },
}))

vi.mock('@app-name/payment', () => ({
  createCheckout: createCheckoutMock,
  resolveCheckoutPlan: resolveCheckoutPlanMock,
}))

async function callPost(request: Request) {
  const { POST } = await import('../../../src/app/api/payment/checkout/route')
  return await POST(request as any)
}

describe('post /api/payment/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when user email is missing', async () => {
    resolveCheckoutPlanMock.mockReturnValueOnce({
      key: 'pro_monthly',
      priceId: 'price_pro_monthly',
      mode: 'subscription',
      category: 'subscription',
    })
    getUserEmailByIdMock.mockResolvedValueOnce(null)
    const request = new Request('http://localhost/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ planKey: 'pro_monthly' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('User email not found')
    expect(createCheckoutMock).not.toHaveBeenCalled()
  })

  it('creates checkout session and returns payload', async () => {
    resolveCheckoutPlanMock.mockReturnValueOnce({
      key: 'pro_monthly',
      priceId: 'price_pro_monthly',
      mode: 'subscription',
      category: 'subscription',
    })
    getUserEmailByIdMock.mockResolvedValueOnce('test@example.com')
    createCheckoutMock.mockResolvedValueOnce({
      id: 'cs_test',
      url: 'https://checkout.stripe.com/c/pay/cs_test',
    })

    const request = new Request('http://localhost/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ planKey: 'pro_monthly' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(createCheckoutMock).toHaveBeenCalledWith({
      userId: 'user_test',
      customerEmail: 'test@example.com',
      priceId: 'price_pro_monthly',
      mode: 'subscription',
      successUrl: 'http://localhost/dashboard',
      cancelUrl: 'http://localhost/dashboard',
      metadata: {
        planKey: 'pro_monthly',
      },
    })
    expect(body).toEqual({
      id: 'cs_test',
      url: 'https://checkout.stripe.com/c/pay/cs_test',
    })
  })

  it('creates lifetime checkout with payment mode', async () => {
    resolveCheckoutPlanMock.mockReturnValueOnce({
      key: 'lifetime',
      priceId: 'price_lifetime',
      mode: 'payment',
      category: 'lifetime',
    })
    getUserEmailByIdMock.mockResolvedValueOnce('test@example.com')
    createCheckoutMock.mockResolvedValueOnce({
      id: 'cs_lifetime',
      url: 'https://checkout.stripe.com/c/pay/cs_lifetime',
    })

    const request = new Request('http://localhost/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ planKey: 'lifetime' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(createCheckoutMock).toHaveBeenCalledWith(expect.objectContaining({
      priceId: 'price_lifetime',
      mode: 'payment',
      metadata: {
        planKey: 'lifetime',
      },
    }))
    expect(body.id).toBe('cs_lifetime')
  })

  it('creates credits checkout with payment mode', async () => {
    resolveCheckoutPlanMock.mockReturnValueOnce({
      key: 'credits_basic',
      priceId: 'price_credits_basic',
      mode: 'payment',
      category: 'credits',
    })
    getUserEmailByIdMock.mockResolvedValueOnce('test@example.com')
    createCheckoutMock.mockResolvedValueOnce({
      id: 'cs_credits',
      url: 'https://checkout.stripe.com/c/pay/cs_credits',
    })

    const request = new Request('http://localhost/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ planKey: 'credits_basic' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(createCheckoutMock).toHaveBeenCalledWith(expect.objectContaining({
      priceId: 'price_credits_basic',
      mode: 'payment',
      metadata: {
        planKey: 'credits_basic',
      },
    }))
    expect(body.id).toBe('cs_credits')
  })

  it('returns 400 when plan cannot be resolved', async () => {
    resolveCheckoutPlanMock.mockImplementationOnce(() => {
      throw new Error('Unsupported plan key: unknown')
    })
    const request = new Request('http://localhost/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ planKey: 'unknown' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Unsupported plan key: unknown')
    expect(createCheckoutMock).not.toHaveBeenCalled()
  })

  it('returns 400 when payload is invalid', async () => {
    const request = new Request('http://localhost/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(typeof body.error).toBe('string')
    expect(body.error.length).toBeGreaterThan(0)
  })
})
