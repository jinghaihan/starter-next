import type { NextRequest } from 'next/server'
import { getSessionCookie } from '@app-name/auth/cookies'
import { routing } from '@app-name/i18n'
import { APP_CONFIG, escapeRegExp } from '@app-name/shared'
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)
const protectedRoutePatterns = APP_CONFIG.routes.protected.map(toRoutePattern)
const guestOnlyRoutePatterns = APP_CONFIG.routes.guestOnly.map(toRoutePattern)

export default function proxy(request: NextRequest) {
  const pathnameWithoutLocale = getPathnameWithoutLocale(request.nextUrl.pathname)
  const hasSession = Boolean(getSessionCookie(request.headers))
  const locale = getLocaleFromPathname(request.nextUrl.pathname) ?? routing.defaultLocale

  if (!hasSession && matchesRoute(pathnameWithoutLocale, protectedRoutePatterns)) {
    const signInPath = withLocale(APP_CONFIG.routes.auth.signIn, locale)
    const callbackURL = `${request.nextUrl.pathname}${request.nextUrl.search}`
    const loginURL = new URL(signInPath, request.url)
    loginURL.searchParams.set('callbackURL', callbackURL)
    return NextResponse.redirect(loginURL)
  }

  if (hasSession && matchesRoute(pathnameWithoutLocale, guestOnlyRoutePatterns)) {
    const dashboardPath = withLocale(APP_CONFIG.routes.defaultLoginRedirect, locale)
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return intlMiddleware(request)
}

function matchesRoute(pathname: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(pathname))
}

function toRoutePattern(path: string): RegExp {
  const normalized = normalizePath(path)
  return new RegExp(`^${escapeRegExp(normalized)}(?:/.*)?$`)
}

function normalizePath(path: string): string {
  return path === '/' ? '/' : path.replace(/\/+$/, '')
}

function getPathnameWithoutLocale(pathname: string): string {
  for (const locale of routing.locales) {
    const prefix = `/${locale}`
    if (pathname === prefix)
      return '/'
    if (pathname.startsWith(`${prefix}/`))
      return pathname.slice(prefix.length)
  }
  return pathname
}

function getLocaleFromPathname(pathname: string): string | null {
  for (const locale of routing.locales) {
    const prefix = `/${locale}`
    if (pathname === prefix || pathname.startsWith(`${prefix}/`))
      return locale
  }
  return null
}

function withLocale(path: string, locale: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${normalized}`
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
