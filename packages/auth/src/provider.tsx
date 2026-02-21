'use client'

import type { ReactNode } from 'react'
import { Link, useRouter } from '@app-name/i18n'
import { AuthUIProvider } from '@better-auth/ui'
import { authClient } from './client'
import { zh } from './locales/zh'

export function AuthProvider({ children, locale }: { children: ReactNode, locale: string }) {
  const router = useRouter()
  const localization = locale === 'zh' ? zh : undefined

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={router.refresh}
      Link={Link}
      localization={localization}
      social={{ providers: ['github'] }}
    >
      {children}
    </AuthUIProvider>
  )
}
