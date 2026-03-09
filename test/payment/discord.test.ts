import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendDiscordNotification } from '../../packages/payment/src/notification/discord'

describe('discord notification', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('skips when DISCORD_WEBHOOK_URL is missing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await sendDiscordNotification('hello')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts to webhook when configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('DISCORD_WEBHOOK_URL', 'https://discord.example/webhook')

    await sendDiscordNotification('payment completed')

    expect(fetchMock).toHaveBeenCalledWith('https://discord.example/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ content: 'payment completed' }),
    })
  })

  it('does not throw when webhook request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('DISCORD_WEBHOOK_URL', 'https://discord.example/webhook')

    await expect(sendDiscordNotification('payment failed')).resolves.toBeUndefined()
  })
})
