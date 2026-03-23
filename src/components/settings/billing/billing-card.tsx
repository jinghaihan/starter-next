'use client'

import type { PaymentPlanKey } from '@app-name/payment'
import { authClient } from '@app-name/auth/client'
import { Link } from '@app-name/i18n'
import { Button } from '@shadcn/components/ui/button'
import { Loader2Icon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { CustomerPortalButton } from '@/components/payment/customer-portal-button'

interface BillingStatusResponse {
  currentPlanKey: PaymentPlanKey | null
  hasLifetime: boolean
  subscription: {
    status: string
    priceId: string
    periodStart: string | null
    periodEnd: string | null
    cancelAtPeriodEnd: boolean | null
  } | null
}

export function BillingCard() {
  const locale = useLocale()
  const t = useTranslations('marketing.billing')
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [data, setData] = useState<BillingStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id)
      return

    let cancelled = false

    fetch('/api/payment/status', { method: 'GET' })
      .then(async (response) => {
        const payload = await response.json() as BillingStatusResponse & { error?: string }
        if (!response.ok)
          throw new Error(payload.error || t('loadError'))
        return payload
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload)
          setError(null)
        }
      })
      .catch((requestError) => {
        if (!cancelled)
          setError(requestError instanceof Error ? requestError.message : t('loadError'))
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, t])

  const currentPlanLabel = useMemo(() => {
    if (!data?.currentPlanKey)
      return t('plan.free')
    return t(`plan.${data.currentPlanKey}` as `plan.${PaymentPlanKey}`)
  }, [data?.currentPlanKey, t])

  const loading = Boolean(session?.user?.id) && !data && !error
  const hasPortal = Boolean(data?.subscription || data?.hasLifetime)
  const billingPath = `/${locale}/settings/billing`

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">
        {t('title')}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('description')}
      </p>

      {(sessionPending || loading) && (
        <div className="
          mt-6 flex items-center gap-2 text-sm text-muted-foreground
        "
        >
          <Loader2Icon className="size-4 animate-spin" />
          {t('loading')}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {!sessionPending && !loading && !error && (
        <div className="mt-6 space-y-3">
          <p className="text-sm">
            <span className="text-muted-foreground">{t('currentPlanLabel')}</span>
            {' '}
            <strong>{currentPlanLabel}</strong>
          </p>

          {data?.subscription && (
            <p className="text-sm text-muted-foreground">
              {t('subscriptionStatus')}
              {' '}
              <span className="font-medium text-foreground">{data.subscription.status}</span>
            </p>
          )}

          {!hasPortal && (
            <Button asChild className="mt-2">
              <Link href="/pricing">{t('upgrade')}</Link>
            </Button>
          )}

          {hasPortal && (
            <CustomerPortalButton returnPath={billingPath}>
              {t('manage')}
            </CustomerPortalButton>
          )}
        </div>
      )}
    </article>
  )
}
