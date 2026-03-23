export const APP_CONFIG = {
  routes: {
    auth: {
      signIn: '/auth/sign-in',
      signUp: '/auth/sign-up',
    },
    defaultLoginRedirect: '/dashboard',
    protected: ['/dashboard', '/settings'],
    guestOnly: ['/auth/sign-in', '/auth/sign-up'],
  },
  features: {
    analytics: true,
    ai: false,
    billing: true,
    newsletter: true,
  },
} as const

export type AppConfig = typeof APP_CONFIG
