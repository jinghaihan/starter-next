import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createCustomerPortalMock, getLatestCustomerIdByUserIdMock } = vi.hoisted(() => ({
  createCustomerPortalMock: vi.fn(),
  getLatestCustomerIdByUserIdMock: vi.fn(),
}))

vi.mock('@app-name/auth/server', () => ({
  requestInterceptor: (handler: (userId: string, request: Request) => Promise<Response>) =>
    async (request: Request) => await handler('user_test', request),
}))

vi.mock('@app-name/database/services', () => ({
  billingService: {
    getLatestCustomerIdByUserId: getLatestCustomerIdByUserIdMock,
  },
}))

vi.mock('@app-name/payment', () => ({
  createCustomerPortal: createCustomerPortalMock,
}))

async function callPost(request: Request) {
  const { POST } = await import('../../../src/app/api/payment/portal/route')
  return await POST(request as any)
}

describe('post /api/payment/portal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when customer id is missing', async () => {
    getLatestCustomerIdByUserIdMock.mockResolvedValueOnce(null)
    const request = new Request('http://localhost/api/payment/portal', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('No billing customer found for user')
    expect(createCustomerPortalMock).not.toHaveBeenCalled()
  })

  it('creates customer portal session and returns payload', async () => {
    getLatestCustomerIdByUserIdMock.mockResolvedValueOnce('cus_123')
    createCustomerPortalMock.mockResolvedValueOnce({
      url: 'https://billing.stripe.com/session/test',
    })

    const request = new Request('http://localhost/api/payment/portal', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(createCustomerPortalMock).toHaveBeenCalledWith({
      customerId: 'cus_123',
      returnUrl: 'http://localhost/dashboard',
    })
    expect(body).toEqual({
      url: 'https://billing.stripe.com/session/test',
    })
  })

  it('returns 400 when payload is invalid', async () => {
    const request = new Request('http://localhost/api/payment/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl: 'not-a-url' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(typeof body.error).toBe('string')
    expect(body.error.length).toBeGreaterThan(0)
  })
})
