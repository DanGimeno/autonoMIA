'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Locale } from './types'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './types'

const LOCALE_STORAGE_KEY = 'autonomia-locale'
const LOCALE_COOKIE_NAME = 'locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  // Check localStorage first
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale
  }

  // Check cookie
  const cookieMatch = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
  if (cookieMatch) {
    const cookieLocale = cookieMatch.split('=')[1]
    if (SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
      return cookieLocale as Locale
    }
  }

  return DEFAULT_LOCALE
}

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;SameSite=Lax`
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setLocaleState(getInitialLocale())
    setIsHydrated(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    setLocaleCookie(newLocale)
  }, [])

  // Prevent hydration mismatch by rendering with default locale on server
  const value: LocaleContextValue = {
    locale: isHydrated ? locale : DEFAULT_LOCALE,
    setLocale,
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
