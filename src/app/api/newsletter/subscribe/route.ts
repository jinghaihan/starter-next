import { subscribeNewsletter } from '@app-name/mail'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  email: z.string().trim().email(),
})

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = requestSchema.parse(await request.json())
    await subscribeNewsletter({ email: body.email })
    return NextResponse.json({ success: true })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to subscribe'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
