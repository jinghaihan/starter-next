import { usePathname, useRouter } from '@app-name/i18n'
import { LANGUAGE_CONFIG } from '@app-name/shared'
import { LanguagesIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { Dropdown } from './dropdown'
import { IconButton } from './icon-button'

export function LanguageSelector() {
  const t = useTranslations()
  const [isPending, startTransition] = useTransition()

  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (data: string) => {
    startTransition(() => router.replace(pathname, { locale: data }))
  }

  return (
    <Dropdown
      title={t('button.select-langauge')}
      value={locale}
      options={Object.entries(LANGUAGE_CONFIG).map(([language, config]) => ({ label: config.name, value: language }))}
      onChange={handleLocaleChange}
    >
      <IconButton icon={<LanguagesIcon />} disabled={isPending} />
    </Dropdown>
  )
}
