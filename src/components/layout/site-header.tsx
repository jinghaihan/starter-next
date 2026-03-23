import { UserButton } from '@app-name/auth'
import { Link } from '@app-name/i18n'
import { APPLICATION_NAME } from '@app-name/shared'
import { DarkToggle, GitHubButton, LanguageSelector } from '@app-name/ui'
import { Button } from '@shadcn/components/ui/button'
import { getTranslations } from 'next-intl/server'

export async function SiteHeader() {
  const t = await getTranslations('marketing.header')

  return (
    <header className="
      sticky top-0 z-20 w-full border-b border-border/60 bg-background/90
      backdrop-blur-sm
    "
    >
      <div className="
        mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4
        py-3
        md:px-6
      "
      >
        <Link
          href="/"
          className="
            text-sm font-semibold tracking-tight
            md:text-base
          "
        >
          {APPLICATION_NAME}
        </Link>

        <div className="
          flex items-center gap-1
          md:gap-2
        "
        >
          <Button asChild variant="ghost" size="sm">
            <Link href="/pricing">{t('pricing')}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">{t('dashboard')}</Link>
          </Button>
          <LanguageSelector />
          <DarkToggle />
          <GitHubButton />
          <UserButton size="icon" />
        </div>
      </div>
    </header>
  )
}
