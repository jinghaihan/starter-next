export const APP_CONFIG = {
  routes: {
    auth: {
      signIn: '/auth/sign-in',
      signUp: '/auth/sign-up',
    },
    defaultLoginRedirect: '/dashboard',
    protected: ['/dashboard'],
    guestOnly: ['/auth/sign-in', '/auth/sign-up'],
  },
  features: {
    analytics: false,
    ai: false,
    billing: false,
    newsletter: false,
  },
} as const

export type AppConfig = typeof APP_CONFIG
