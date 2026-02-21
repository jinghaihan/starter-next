import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./packages/i18n/src/request.ts')

export default withNextIntl({
  transpilePackages: [
    '@app-name/api',
    '@app-name/auth',
    '@app-name/database',
    '@app-name/i18n',
    '@app-name/shadcn',
    '@app-name/shared',
    '@app-name/store',
    '@app-name/ui',
  ],
})
