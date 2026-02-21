import type { Metadata } from 'next'
import { AuthProvider } from '@app-name/auth'
import { TooltipProvider } from '@shadcn/components/ui/tooltip'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'
import { description, name } from '../../../package.json'
import '@/assets/globals.css'
import '@/assets/main.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: `${name} - ${description}`,
  description,
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} className={geistSans.variable} suppressHydrationWarning>
      <body className={`
        ${geistSans.variable}
        ${geistMono.variable}
        antialiased
      `}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
