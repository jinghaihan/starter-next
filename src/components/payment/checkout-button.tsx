'use client'

import type { PaymentPlanKey } from '@app-name/payment'
import type { ReactNode } from 'react'
import { Button } from '@shadcn/components/ui/button'
import { Loader2Icon } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useState } from 'react'

interface CheckoutButtonProps {
  planKey: PaymentPlanKey
  successPath: string
  cancelPath: string
  className?: string
  children: ReactNode
}

export function CheckoutButton({
  planKey,
  successPath,
  cancelPath,
  className,
  children,
}: CheckoutButtonProps) {
  const locale = useLocale()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    if (loading)
      return

    setLoading(true)
    setError(null)

    try {
      const origin = window.location.origin
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          planKey,
          successUrl: `${origin}${successPath}`,
          cancelUrl: `${origin}${cancelPath}`,
        }),
      })

      if (response.status === 401) {
        const callbackURL = encodeURIComponent(window.location.pathname)
        window.location.href = `/${locale}/auth/sign-in?callbackURL=${callbackURL}`
        return
      }

      const data = await response.json() as {
        url?: string
        error?: string
      }

      if (!response.ok || !data.url)
        throw new Error(data.error || 'Failed to create checkout session')

      window.location.href = data.url
    }
    catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Checkout failed'
      setError(message)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        className="w-full"
        onClick={onClick}
        disabled={loading}
      >
        {loading
          ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Processing...
              </>
            )
          : children}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
