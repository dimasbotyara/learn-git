/* Конфетти и тосты. Эффекты отключаются в настройках и при prefers-reduced-motion. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useSettings } from './settings'

const ToastContext = createContext(null)

function palette() {
  const styles = getComputedStyle(document.documentElement)
  const keys = ['--accent', '--green', '--yellow', '--blue', '--purple', '--aqua', '--red']
  return keys.map((key) => styles.getPropertyValue(key).trim()).filter(Boolean)
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function EffectsProvider({ children }) {
  const { effects } = useSettings()
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer))
    },
    [],
  )

  const toast = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((current) => [...current.slice(-2), { id, message, tone: options.tone || 'default' }])
    const timer = setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
      timers.current.delete(id)
    }, options.duration || 2600)
    timers.current.set(id, timer)
  }, [])

  const fire = useCallback(
    (kind = 'small') => {
      if (!effects || prefersReducedMotion()) return
      const colors = palette()
      try {
        if (kind === 'big') {
          confetti({ particleCount: 130, spread: 78, origin: { y: 0.62 }, colors, scalar: 1.05 })
          setTimeout(
            () => confetti({ particleCount: 70, spread: 110, origin: { y: 0.5 }, colors, startVelocity: 26 }),
            180,
          )
          return
        }
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.72 }, colors, scalar: 0.9, ticks: 140 })
      } catch {
        /* canvas недоступен (старый браузер, тесты) — эффекты не критичны */
      }
    },
    [effects],
  )

  const value = useMemo(() => ({ toast, fire }), [toast, fire])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast ${item.tone === 'success' ? 'toast--success' : ''}`}>
            <span className="toast__icon">{item.tone === 'success' ? '✅' : '💬'}</span>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useEffects() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useEffects must be used inside EffectsProvider')
  return context
}
