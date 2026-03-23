import process from 'node:process'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./packages/i18n/src/request.ts')

export default withNextIntl({
  turbopack: {
    root: process.cwd(),
  },
  transpilePackages: [
    '@app-name/api',
    '@app-name/analytics',
    '@app-name/auth',
    '@app-name/database',
    '@app-name/env',
    '@app-name/i18n',
    '@app-name/mail',
    '@app-name/payment',
    '@app-name/shadcn',
    '@app-name/shared',
    '@app-name/storage',
    '@app-name/store',
    '@app-name/ui',
  ],
})
