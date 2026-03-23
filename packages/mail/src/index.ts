import { getMailEnv } from '@app-name/env/server'
import { Resend } from 'resend'
import { z } from 'zod'

const newsletterEmailSchema = z.string().trim().email()

function getResendClient() {
  const env = getMailEnv()
  return {
    client: new Resend(env.RESEND_API_KEY),
    audienceId: env.RESEND_AUDIENCE_ID,
  }
}

export interface SubscribeNewsletterParams {
  email: string
}

export async function subscribeNewsletter(params: SubscribeNewsletterParams): Promise<boolean> {
  const email = newsletterEmailSchema.parse(params.email)
  const { client, audienceId } = getResendClient()

  const getResult = await client.contacts.get({
    email,
    audienceId,
  })

  if (getResult.error) {
    const createResult = await client.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    })

    if (createResult.error)
      throw new Error(createResult.error.message)
    return true
  }

  const updateResult = await client.contacts.update({
    email,
    audienceId,
    unsubscribed: false,
  })

  if (updateResult.error)
    throw new Error(updateResult.error.message)

  return true
}
