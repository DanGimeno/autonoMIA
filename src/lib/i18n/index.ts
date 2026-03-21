import { es } from './translations/es'
import { ca } from './translations/ca'
import { useLocale } from './context'
import type { Locale, Translations } from './types'

export { LocaleProvider, useLocale } from './context'
export { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_NAMES } from './types'
export type { Locale, Translations } from './types'

const translations: Record<Locale, Translations> = {
  es,
  ca,
}

/**
 * Client-side hook to get translations for the current locale.
 * Must be used within a LocaleProvider.
 */
export function useTranslation(): { t: Translations; locale: Locale } {
  const { locale } = useLocale()
  return {
    t: translations[locale],
    locale,
  }
}

/**
 * Server-side function to get translations for a given locale.
 * Use this in Server Components where hooks are not available.
 */
export function getTranslation(locale: Locale = 'es'): Translations {
  return translations[locale] ?? translations.es
}
