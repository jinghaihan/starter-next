import { getNotificationEnv } from '@app-name/env/server'

export async function sendDiscordNotification(content: string): Promise<void> {
  const webhookUrl = getNotificationEnv().DISCORD_WEBHOOK_URL
  if (!webhookUrl)
    return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
  }
  catch {}
}
