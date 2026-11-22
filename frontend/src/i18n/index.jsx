import { createContext, useCallback, useContext, useMemo } from 'react'
import ru from './ru'
import en from './en'
import { useSettings } from '../settings'

const DICTS = { ru, en }

const I18nContext = createContext({ locale: 'ru', t: (key) => key, dict: ru })

function lookup(dict, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict)
}

export function translate(dict, key, vars) {
  const value = lookup(dict, key)
  if (typeof value !== 'string') return key
  if (!vars) return value
  return value.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`))
}

export function I18nProvider({ children }) {
  const { locale } = useSettings()
  const dict = DICTS[locale] || ru
  const t = useCallback((key, vars) => translate(dict, key, vars), [dict])
  const value = useMemo(() => ({ locale, t, dict }), [locale, t, dict])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
