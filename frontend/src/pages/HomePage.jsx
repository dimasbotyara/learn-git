import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { useApi } from '../useApi'
import { api } from '../api'
import { CodeBlock } from '../components/CodeBlock'
import { IconArrowRight, IconBolt, IconSparkle, IconTerminal } from '../components/Icons'
import { ProgressRing } from '../components/ProgressRing'

const FEATURES = [
  { key: 'terminal', icon: IconTerminal, accent: 'var(--green)' },
  { key: 'conflict', icon: IconBolt, accent: 'var(--red)' },
  { key: 'themes', icon: IconSparkle, accent: 'var(--purple)' },
]

export function HomePage() {
  const { t, locale } = useI18n()
  const { data, loading, error } = useApi((signal) => api.course(locale, signal), [locale])
  const { isLessonDone, doneKeys, xp, solvedTasks } = useProgress()

  const modules = data?.modules || []
  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0)
  const totalMinutes = modules.reduce(
    (sum, module) => sum + module.lessons.reduce((inner, lesson) => inner + (lesson.minutes || 0), 0),
    0,
  )
  const totalTasks = modules.reduce(
    (sum, module) => sum + module.lessons.reduce((inner, lesson) => inner + (lesson.tasks || 0), 0),
    0,
  )
  const firstLesson = modules[0]?.lessons[0]
  const percent = totalLessons ? Math.round((doneKeys.length / totalLessons) * 100) : 0

  return (
    <div className="main__inner main--wide" style={{ maxWidth: 1080 }}>
      <section className="hero">
        <div className="hero__grid">
          <div>
            <span className="pill pill--accent hero__eyebrow">
              <IconBolt width={14} height={14} /> {t('home.eyebrow')}
            </span>
            <h1 className="hero__title">
              {t('home.title').split(':')[0]}:
              <br />
              <em>{t('home.title').split(':').slice(1).join(':').trim()}</em>
            </h1>
            <p className="hero__lead">{t('home.lead')}</p>
            <div className="hero__actions">
              {firstLesson && (
                <Link to={`/lesson/${modules[0].slug}/${firstLesson.slug}`} className="btn btn--primary">
                  {doneKeys.length ? t('nav.continue') : t('nav.start')}
                  <IconArrowRight width={18} height={18} />
                </Link>
              )}
              <Link to="/cheatsheet" className="btn">
                {t('home.cheatsheetCta')}
              </Link>
            </div>
            <div className="hero__stats">
              <div className="stat">
                <div className="stat__value">{loading ? '—' : modules.length}</div>
                <div className="stat__label">{t('home.stats.modules')}</div>
              </div>
              <div className="stat">
                <div className="stat__value">{loading ? '—' : totalLessons}</div>
                <div className="stat__label">{t('home.stats.lessons')}</div>
              </div>
              <div className="stat">
                <div className="stat__value">{loading ? '—' : totalMinutes}</div>
                <div className="stat__label">{t('home.stats.minutes')}</div>
              </div>
              <div className="stat">
                <div className="stat__value">
                  {solvedTasks}
                  {totalTasks > 0 && <span className="stat__of">/{totalTasks}</span>}
                </div>
                <div className="stat__label">{t('home.stats.tasks')}</div>
              </div>
            </div>
          </div>

          <div className="hero__terminal">
            <div className="card" style={{ padding: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <ProgressRing value={percent} size={44} stroke={4} />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{t('home.progress')}</div>
                  <div className="faint mono" style={{ fontSize: 'var(--text-xs)' }}>
                    {doneKeys.length}/{totalLessons} · {solvedTasks} {t('home.stats.tasksShort')} · {xp} {t('common.xp')}
                  </div>
                </div>
              </div>
              <CodeBlock
                headless
                language="bash"
                code={`$ git init\nInitialized empty Git repository\n$ git status\nOn branch main\nnothing to commit`}
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="banner">
          <span aria-hidden="true">⚠️</span>
          <span>
            {t('common.error')}: {error.message}. Проверь, что бэкенд запущен на порту 13444.
          </span>
        </div>
      )}

      <div className="section-title">
        <h2>{t('home.courseTitle')}</h2>
        <span className="section-title__hint">{t('home.courseHint')}</span>
      </div>

      <div className="modules-grid">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton" style={{ height: 172 }} />
          ))}
        {modules.map((module) => {
          const doneInModule = module.lessons.filter((lesson) => isLessonDone(module.slug, lesson.slug)).length
          const first = module.lessons[0]
          return (
            <Link key={module.slug} to={`/lesson/${module.slug}/${first.slug}`} className={`module-card accent-${module.accent}`}>
              <div className="module-card__top">
                <span className="module-card__icon" aria-hidden="true">
                  {module.icon}
                </span>
                <div>
                  <h3 className="module-card__title">{module.title}</h3>
                  <div className="module-card__subtitle">{module.subtitle}</div>
                </div>
              </div>
              <p className="module-card__desc">{module.description}</p>
              <div className="module-card__foot">
                <span className="pill">
                  {doneInModule}/{module.lessons.length} {t('course.lessons')}
                </span>
                <span>{t('course.start')} →</span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="section-title">
        <h2>{t('home.sourceTitle')}</h2>
      </div>
      <div className="modules-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {FEATURES.map(({ key, icon: Icon, accent }) => (
          <div key={key} className="card">
            <div className="module-card__icon" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>
              <Icon />
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', marginTop: 'var(--space-3)' }}>{t(`home.features.${key}.title`)}</h3>
            <p className="muted" style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
              {t(`home.features.${key}.text`)}
            </p>
          </div>
        ))}
      </div>

      <div className="hero__actions" style={{ marginTop: 'var(--space-6)' }}>
        <Link to="/sandbox" className="btn">
          {t('home.sandboxCta')}
        </Link>
      </div>
    </div>
  )
}
