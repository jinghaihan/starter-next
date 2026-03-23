'use client'

import { Button } from '@shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@shadcn/components/ui/card'
import { CheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CheckoutButton } from '@/components/payment/checkout-button'

interface PricingTableProps {
  billingPath: string
}

export function PricingTable({ billingPath }: PricingTableProps) {
  const t = useTranslations('marketing.pricing')

  return (
    <section className="
      grid gap-6
      md:grid-cols-3
    "
    >
      <Card className="flex flex-col">
        <CardHeader>
          <p className="
            text-xs font-semibold tracking-[0.2em] text-muted-foreground
            uppercase
          "
          >
            {t('subscription.label')}
          </p>
          <CardTitle className="mt-3 text-2xl">
            {t('subscription.title')}
          </CardTitle>
          <CardDescription className="mt-2">
            {t('subscription.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <hr className="border-dashed" />
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5" />
              {t('subscription.feature1')}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5" />
              {t('subscription.feature2')}
            </li>
          </ul>
        </CardContent>

        <CardFooter className="mt-auto w-full flex-col gap-3">
          <CheckoutButton
            className="w-full"
            planKey="pro_monthly"
            successPath={billingPath}
            cancelPath={billingPath}
          >
            {t('subscription.monthlyCta')}
          </CheckoutButton>
          <CheckoutButton
            className="w-full"
            planKey="pro_yearly"
            successPath={billingPath}
            cancelPath={billingPath}
          >
            {t('subscription.yearlyCta')}
          </CheckoutButton>
        </CardFooter>
      </Card>

      <Card className="relative flex flex-col border-primary/30 shadow-md">
        <span className="
          absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center
          rounded-full bg-primary/90 px-3 py-1 text-xs font-medium
          text-primary-foreground
        "
        >
          {t('lifetime.label')}
        </span>

        <CardHeader>
          <CardTitle className="mt-3 text-2xl">
            {t('lifetime.title')}
          </CardTitle>
          <CardDescription className="mt-2">
            {t('lifetime.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <hr className="border-dashed" />
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5" />
              {t('lifetime.feature1')}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5" />
              {t('lifetime.feature2')}
            </li>
          </ul>
        </CardContent>

        <CardFooter className="mt-auto w-full">
          <CheckoutButton
            className="w-full"
            planKey="lifetime"
            successPath={billingPath}
            cancelPath={billingPath}
          >
            {t('lifetime.cta')}
          </CheckoutButton>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <p className="
            text-xs font-semibold tracking-[0.2em] text-muted-foreground
            uppercase
          "
          >
            {t('credits.label')}
          </p>
          <CardTitle className="mt-3 text-2xl">
            {t('credits.title')}
          </CardTitle>
          <CardDescription className="mt-2">
            {t('credits.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <hr className="border-dashed" />
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5" />
              {t('credits.feature1')}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5" />
              {t('credits.feature2')}
            </li>
          </ul>
        </CardContent>

        <CardFooter className="mt-auto w-full flex-col gap-3">
          <CheckoutButton
            className="w-full"
            planKey="credits_basic"
            successPath={billingPath}
            cancelPath={billingPath}
          >
            {t('credits.basicCta')}
          </CheckoutButton>
          <Button type="button" variant="ghost" className="w-full" disabled>
            {t('credits.more')}
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
