import process from 'node:process'

export async function sendDiscordNotification(content: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim()
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
