import type { LanguageConfig } from '../types'

export const DEFAULT_LOCALE = 'en'

export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const

export const LANGUAGE_CONFIG: LanguageConfig = {
  en: {
    flag: '🇺🇸',
    name: 'English',
  },
  zh: {
    flag: '🇨🇳',
    name: '简体中文',
  },
} as const
