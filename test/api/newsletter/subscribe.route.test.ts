import { beforeEach, describe, expect, it, vi } from 'vitest'

const { subscribeNewsletterMock } = vi.hoisted(() => ({
  subscribeNewsletterMock: vi.fn(),
}))

vi.mock('@app-name/mail', () => ({
  subscribeNewsletter: subscribeNewsletterMock,
}))

async function callPost(request: Request) {
  const { POST } = await import('../../../src/app/api/newsletter/subscribe/route')
  return await POST(request as any)
}

describe('post /api/newsletter/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('subscribes with valid email', async () => {
    subscribeNewsletterMock.mockResolvedValueOnce(true)
    const request = new Request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(subscribeNewsletterMock).toHaveBeenCalledWith({ email: 'test@example.com' })
    expect(body.success).toBe(true)
  })

  it('returns 400 for invalid email', async () => {
    const request = new Request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(subscribeNewsletterMock).not.toHaveBeenCalled()
  })
})
