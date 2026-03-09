import type { SUPPORTED_LANGUAGES } from '../constants'

export type Locale = (typeof SUPPORTED_LANGUAGES)[number]

export interface LanguageOption {
  flag: string
  name: string
}

export type LanguageConfig = Record<Locale, LanguageOption>
