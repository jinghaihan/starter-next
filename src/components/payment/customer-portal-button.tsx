'use client'

import type { ReactNode } from 'react'
import { Button } from '@shadcn/components/ui/button'
import { Loader2Icon } from 'lucide-react'
import { useState } from 'react'

interface CustomerPortalButtonProps {
  returnPath: string
  className?: string
  children: ReactNode
}

export function CustomerPortalButton({
  returnPath,
  className,
  children,
}: CustomerPortalButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    if (loading)
      return

    setLoading(true)
    setError(null)

    try {
      const origin = window.location.origin
      const response = await fetch('/api/payment/portal', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${origin}${returnPath}`,
        }),
      })

      const data = await response.json() as {
        url?: string
        error?: string
      }

      if (!response.ok || !data.url)
        throw new Error(data.error || 'Failed to create customer portal session')

      window.location.href = data.url
    }
    catch (portalError) {
      const message = portalError instanceof Error ? portalError.message : 'Portal request failed'
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
        variant="outline"
        onClick={onClick}
        disabled={loading}
      >
        {loading
          ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Opening...
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
