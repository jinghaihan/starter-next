import { getTranslations } from 'next-intl/server'
import { SiteHeader } from '@/components/layout/site-header'
import { PricingTable } from '@/components/pricing/pricing-table'

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('marketing.pricing')
  const billingPath = `/${locale}/settings/billing`

  return (
    <div className="
      min-h-svh
      bg-[radial-gradient(circle_at_top,var(--color-muted),transparent_60%)]
    "
    >
      <SiteHeader />
      <main className="
        mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12
        md:px-6 md:py-16
      "
      >
        <section className="max-w-2xl space-y-3">
          <p className="
            text-xs font-semibold tracking-[0.2em] text-muted-foreground
            uppercase
          "
          >
            {t('eyebrow')}
          </p>
          <h1 className="
            text-3xl font-semibold tracking-tight
            md:text-4xl
          "
          >
            {t('title')}
          </h1>
          <p className="
            text-sm text-muted-foreground
            md:text-base
          "
          >
            {t('description')}
          </p>
        </section>

        <PricingTable billingPath={billingPath} />
      </main>
    </div>
  )
}
