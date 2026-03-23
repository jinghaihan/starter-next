import { getTranslations } from 'next-intl/server'
import HeroSectionNine from '@/components/landing/tailark/hero-section-nine'
import PricingSectionFour from '@/components/landing/tailark/pricing-section-four'
import { NewsletterForm } from '@/components/newsletter/newsletter-form'

export default async function Page() {
  const t = await getTranslations('marketing.landing.newsletter')

  return (
    <div className="min-h-svh bg-background">
      <HeroSectionNine />
      <PricingSectionFour />

      <section className="
        mx-auto w-full max-w-6xl px-4 pb-16
        md:px-6
      "
      >
        <div className="
          rounded-2xl border border-border bg-card p-6
          md:p-8
        "
        >
          <h2 className="text-xl font-semibold">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('description')}
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
