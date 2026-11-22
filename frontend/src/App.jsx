import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { SettingsPanel } from './components/SettingsPanel'
import { IconClose, IconChevronLeft, IconChevronRight, IconSettings } from './components/Icons'
import { HomePage } from './pages/HomePage'
import { LessonPage } from './pages/LessonPage'
import { CheatsheetPage } from './pages/CheatsheetPage'
import { SandboxPage } from './pages/SandboxPage'
import { useI18n } from './i18n'
import { useApi } from './useApi'
import { api } from './api'
import { useProgress } from './progress'
import { useEffects } from './effects'

export function App() {
  const { t, locale } = useI18n()
  const location = useLocation()
  const { importProgress } = useProgress()
  const { toast } = useEffects()
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lessonMeta, setLessonMeta] = useState(null)

  const { data } = useApi((signal) => api.course(locale, signal), [locale])
  const modules = data?.modules || []
  const totalLessons = useMemo(
    () => modules.reduce((sum, module) => sum + module.lessons.length, 0),
    [modules],
  )

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  const onLessonMeta = useCallback((meta) => setLessonMeta(meta), [])
  const isLessonRoute = location.pathname.startsWith('/lesson')
  const isWide = location.pathname === '/'

  const exportProgress = () => {
    const raw = localStorage.getItem('learn-git:progress') || '{}'
    const blob = new Blob([raw], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `learn-git-progress-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const onImport = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result))
        if (importProgress(payload)) toast(t('common.done'), { tone: 'success' })
      } catch {
        toast(t('common.error'))
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <Header
        totalLessons={totalLessons}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className={`shell ${isWide ? '' : 'shell--with-sidebar'}`}>
        {!isWide && (
          <div className="sidebar-wrap">
            <Sidebar modules={modules} active={lessonMeta} />
          </div>
        )}
        <main className={`main ${isWide ? 'main--wide' : ''}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lesson/:moduleSlug/:lessonSlug" element={<LessonPage onLessonMeta={onLessonMeta} />} />
            <Route path="/cheatsheet" element={<CheatsheetPage />} />
            <Route path="/sandbox" element={<SandboxPage />} />
            <Route
              path="*"
              element={
                <div className="main__inner">
                  <div className="empty">
                    <div className="empty__icon">🧭</div>
                    <h2>404</h2>
                    <p className="muted">{t('common.error')}</p>
                    <Link className="btn" to="/">
                      {t('nav.home')}
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>

      <footer className="footer">
        <div className="footer__inner">
          <span>
            learn-git · {t('footer.madeWith')} <span className="accent">♥</span>
          </span>
          <span className="mono">{t('footer.offline')}</span>
        </div>
      </footer>

      {menuOpen && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
          <div className="drawer__scrim" onClick={() => setMenuOpen(false)} />
          <div className="drawer__panel">
            <div className="drawer__head">
              <span className="sidebar__title" style={{ padding: 0 }}>
                {t('nav.course')}
              </span>
              <button type="button" className="icon-btn" onClick={() => setMenuOpen(false)} aria-label={t('common.close')}>
                <IconClose />
              </button>
            </div>
            <div className="drawer__body">
              <Sidebar modules={modules} active={lessonMeta} onNavigate={() => setMenuOpen(false)} />
              <div style={{ display: 'grid', gap: 8, marginTop: 'var(--space-5)' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setMenuOpen(false)
                    setSettingsOpen(true)
                  }}
                >
                  {t('nav.settings')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLessonRoute && (
        <div className="lesson-bar">
          <Link to="/" className="icon-btn" aria-label={t('nav.course')}>
            <IconChevronLeft />
          </Link>
          <span className="lesson-bar__label">{lessonMeta?.title || ''}</span>
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label={t('nav.openMenu')}>
            <IconChevronRight />
          </button>
        </div>
      )}

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} onExport={exportProgress} onImport={onImport} />
    </div>
  )
}
