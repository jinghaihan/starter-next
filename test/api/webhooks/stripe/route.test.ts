import { beforeEach, describe, expect, it, vi } from 'vitest'

const { handleWebhookEventMock } = vi.hoisted(() => ({
  handleWebhookEventMock: vi.fn(),
}))

vi.mock('@app-name/payment', () => ({
  handleWebhookEvent: handleWebhookEventMock,
}))

async function callPost(request: Request) {
  const { POST } = await import('../../../../src/app/api/webhooks/stripe/route')
  return await POST(request)
}

describe('post /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when signature header is missing', async () => {
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{"id":"evt_test"}',
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Missing stripe-signature header')
    expect(handleWebhookEventMock).not.toHaveBeenCalled()
  })

  it('returns 200 when webhook is handled', async () => {
    handleWebhookEventMock.mockResolvedValueOnce(undefined)
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{"id":"evt_test"}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 't=123,v1=signature',
      },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(handleWebhookEventMock).toHaveBeenCalledWith(
      '{"id":"evt_test"}',
      't=123,v1=signature',
    )
    expect(body).toEqual({ received: true })
  })

  it('returns 400 when webhook handler throws', async () => {
    handleWebhookEventMock.mockRejectedValueOnce(new Error('invalid signature'))
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{"id":"evt_test"}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'bad',
      },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('invalid signature')
  })
})
