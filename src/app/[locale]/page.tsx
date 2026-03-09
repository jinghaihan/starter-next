'use client'
import { UserButton } from '@app-name/auth'
import { DarkToggle, GitHubButton, LanguageSelector } from '@app-name/ui'

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center overflow-hidden">
      <DarkToggle />
      <LanguageSelector />
      <GitHubButton />
      <UserButton size="icon" />
    </div>
  )
}
