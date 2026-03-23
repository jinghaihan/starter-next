import { getTranslations } from 'next-intl/server'
import { SiteHeader } from '@/components/layout/site-header'
import { BillingCard } from '@/components/settings/billing/billing-card'

export default async function BillingPage() {
  const t = await getTranslations('marketing.billing')

  return (
    <div className="
      min-h-svh
      bg-[radial-gradient(circle_at_top,var(--color-muted),transparent_60%)]
    "
    >
      <SiteHeader />
      <main className="
        mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12
        md:px-6
      "
      >
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t('pageTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('pageDescription')}
          </p>
        </section>

        <BillingCard />
      </main>
    </div>
  )
}
