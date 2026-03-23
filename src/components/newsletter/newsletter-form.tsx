'use client'

import type { FormEvent } from 'react'
import { Button } from '@shadcn/components/ui/button'
import { Loader2Icon, MailCheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterForm() {
  const t = useTranslations('marketing.landing.newsletter')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state === 'loading')
      return

    setState('loading')
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json() as { success?: boolean, error?: string }
      if (!response.ok || !data.success)
        throw new Error(data.error || t('error'))

      setState('success')
      setEmail('')
      setMessage(t('success'))
    }
    catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : t('error'))
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="
        mt-4 grid gap-3
        sm:grid-cols-[1fr_auto]
      "
    >
      <label className="sr-only" htmlFor="newsletter-email">
        {t('label')}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        autoComplete="email"
        placeholder={t('placeholder')}
        value={email}
        onChange={event => setEmail(event.target.value)}
        className="
          h-10 rounded-lg border border-border bg-background px-3 text-sm ring-0
          transition outline-none
          focus:border-foreground/30
        "
      />
      <Button type="submit" disabled={state === 'loading'}>
        {state === 'loading'
          ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {t('submitting')}
              </>
            )
          : (
              t('submit')
            )}
      </Button>
      {message && (
        <p className={`
          flex items-center gap-1 text-xs
          ${state === 'success' ? 'text-emerald-600' : 'text-destructive'}
        `}
        >
          {state === 'success' && <MailCheckIcon className="size-3.5" />}
          {message}
        </p>
      )}
    </form>
  )
}
