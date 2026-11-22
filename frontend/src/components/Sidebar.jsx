import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { IconCheck, IconChevronRight } from './Icons'

export function Sidebar({ modules, active, onNavigate, showCheatsheet = true }) {
  const { t } = useI18n()
  const { isLessonDone } = useProgress()

  const activeModule = active?.module
  const [open, setOpen] = useState(() => new Set(activeModule ? [activeModule] : []))

  useEffect(() => {
    if (activeModule) {
      setOpen((current) => (current.has(activeModule) ? current : new Set([...current, activeModule])))
    }
  }, [activeModule])

  const toggle = (slug) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })

  const total = useMemo(
    () => modules.reduce((sum, module) => sum + module.lessons.length, 0),
    [modules],
  )
  const done = useMemo(
    () =>
      modules.reduce(
        (sum, module) => sum + module.lessons.filter((lesson) => isLessonDone(module.slug, lesson.slug)).length,
        0,
      ),
    [modules, isLessonDone],
  )

  return (
    <nav className="sidebar" aria-label={t('nav.course')}>
      <div className="sidebar__title">
        {t('nav.course')} · {done}/{total}
      </div>
      {modules.map((module) => {
        const isOpen = open.has(module.slug)
        const doneInModule = module.lessons.filter((lesson) => isLessonDone(module.slug, lesson.slug)).length
        return (
          <div key={module.slug} className="sidebar__module">
            <button
              type="button"
              className="sidebar__module-head"
              onClick={() => toggle(module.slug)}
              aria-expanded={isOpen}
            >
              <span className="sidebar__module-icon" aria-hidden="true">
                {module.icon}
              </span>
              <span className="sidebar__module-title">{module.title}</span>
              <span className="faint mono" style={{ fontSize: 11 }}>
                {doneInModule}/{module.lessons.length}
              </span>
              <IconChevronRight
                width={16}
                height={16}
                className={`sidebar__chevron ${isOpen ? 'sidebar__chevron--open' : ''}`}
              />
            </button>
            {isOpen && (
              <ul className="sidebar__lessons">
                {module.lessons.map((lesson) => {
                  const isDone = isLessonDone(module.slug, lesson.slug)
                  const isActive = active?.module === module.slug && active?.lesson === lesson.slug
                  return (
                    <li key={lesson.slug}>
                      <NavLink
                        to={`/lesson/${module.slug}/${lesson.slug}`}
                        className={`sidebar__lesson ${isActive ? 'sidebar__lesson--active' : ''} ${
                          isDone ? 'sidebar__lesson--done' : ''
                        } ${lesson.available === false ? 'sidebar__lesson--soon' : ''}`}
                        onClick={onNavigate}
                      >
                        <span className={`sidebar__lesson-mark ${isDone ? 'sidebar__lesson-mark--done' : ''}`}>
                          {isDone ? <IconCheck width={10} height={10} strokeWidth={3} /> : null}
                        </span>
                        <span className="sidebar__lesson-text">{lesson.title}</span>
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
      {showCheatsheet && (
        <div className="sidebar__module" style={{ marginTop: 'var(--space-5)' }}>
          <NavLink to="/cheatsheet" className="sidebar__lesson" onClick={onNavigate}>
            <span className="sidebar__lesson-mark" aria-hidden="true">
              ⌘
            </span>
            <span className="sidebar__lesson-text">{t('nav.cheatsheet')}</span>
          </NavLink>
          <NavLink to="/sandbox" className="sidebar__lesson" onClick={onNavigate}>
            <span className="sidebar__lesson-mark" aria-hidden="true">
              ▸
            </span>
            <span className="sidebar__lesson-text">{t('nav.sandbox')}</span>
          </NavLink>
        </div>
      )}
    </nav>
  )
}
