import { AuthView } from '@app-name/auth'
import { authViewPaths } from '@app-name/auth/paths'
import { routing } from '@app-name/i18n'

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap(locale => Object.values(authViewPaths).map(path => ({ locale, path })))
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params

  return (
    <main className="
      container flex grow flex-col items-center justify-center self-center p-4
      md:p-6
    "
    >
      <AuthView path={path} />
    </main>
  )
}
