/*
  Настройки приложения: тема (встроенная или своя), язык, эффекты.
  Всё живёт в localStorage, без сервера и аккаунтов.
*/

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { COLOR_KEYS, DEFAULT_THEME, THEME_PALETTES } from './themes'

export const SETTINGS_KEY = 'learn-git:settings'
const LOCALES = ['ru', 'en']

const DEFAULT_SETTINGS = {
  theme: DEFAULT_THEME,
  customThemes: [],
  customThemeId: null,
  locale: null, // null = определить по браузеру
  effects: true,
  fontSize: 'md',
}

function readStored() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function detectLocale() {
  const languages = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []
  for (const tag of languages) {
    if (!tag) continue
    const short = String(tag).toLowerCase().slice(0, 2)
    if (LOCALES.includes(short)) return short
  }
  return 'ru'
}

export function resolveLocale(setting) {
  return LOCALES.includes(setting) ? setting : detectLocale()
}

const SettingsContext = createContext(null)

function applyTheme(settings) {
  const root = document.documentElement
  COLOR_KEYS.forEach((key) => root.style.removeProperty(`--${key}`))

  const custom = settings.customThemes.find((theme) => theme.id === settings.customThemeId)
  if (settings.theme === 'custom' && custom) {
    root.dataset.theme = custom.base || DEFAULT_THEME
    Object.entries(custom.colors || {}).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--${key}`, value)
    })
    root.dataset.scheme = custom.scheme || 'dark'
    return
  }

  root.dataset.theme = settings.theme || DEFAULT_THEME
  const palette = THEME_PALETTES[settings.theme] || THEME_PALETTES[DEFAULT_THEME]
  root.dataset.scheme = isLightHex(palette.bg) ? 'light' : 'dark'
}

function isLightHex(hex) {
  if (!hex || !hex.startsWith('#')) return false
  const value = hex.replace('#', '')
  if (value.length !== 6) return false
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 140
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readStored() }))
  const locale = useMemo(() => resolveLocale(settings.locale), [settings.locale])

  useEffect(() => {
    applyTheme(settings)
    document.documentElement.lang = locale
    document.documentElement.dataset.effects = settings.effects ? 'on' : 'off'
    document.documentElement.dataset.fontSize = settings.fontSize || 'md'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      const palette = THEME_PALETTES[settings.theme] || THEME_PALETTES[DEFAULT_THEME]
      meta.setAttribute('content', palette.bg)
    }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      /* приватный режим — просто не сохраняем */
    }
  }, [settings, locale])

  const update = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const setTheme = useCallback((themeId) => update({ theme: themeId }), [update])

  const saveCustomTheme = useCallback((theme) => {
    setSettings((current) => {
      const exists = current.customThemes.some((item) => item.id === theme.id)
      const customThemes = exists
        ? current.customThemes.map((item) => (item.id === theme.id ? theme : item))
        : [...current.customThemes, theme]
      return { ...current, customThemes, theme: 'custom', customThemeId: theme.id }
    })
  }, [])

  const deleteCustomTheme = useCallback((id) => {
    setSettings((current) => {
      const customThemes = current.customThemes.filter((item) => item.id !== id)
      const wasActive = current.theme === 'custom' && current.customThemeId === id
      return {
        ...current,
        customThemes,
        customThemeId: wasActive ? null : current.customThemeId,
        theme: wasActive ? DEFAULT_THEME : current.theme,
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      ...settings,
      locale,
      setTheme,
      update,
      saveCustomTheme,
      deleteCustomTheme,
      resetSettings: () => setSettings({ ...DEFAULT_SETTINGS, locale: null }),
    }),
    [settings, locale, setTheme, update, saveCustomTheme, deleteCustomTheme],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used inside SettingsProvider')
  return context
}
