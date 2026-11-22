import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { useEffects } from '../effects'
import { useApi } from '../useApi'
import { api } from '../api'
import { LessonSteps } from '../components/LessonSteps'
import { IconArrowLeft, IconArrowRight, IconCheck, IconTerminal } from '../components/Icons'

export function LessonPage({ onLessonMeta }) {
  const { moduleSlug, lessonSlug } = useParams()
  const navigate = useNavigate()
  const { t, locale } = useI18n()
  const { isLessonDone, completeLesson, doneKeys } = useProgress()
  const { fire, toast } = useEffects()
  const topRef = useRef(null)
  const [marking, setMarking] = useState(false)

  const { data, loading, error } = useApi(
    (signal) => api.lesson(moduleSlug, lessonSlug, locale, signal),
    [moduleSlug, lessonSlug, locale],
  )

  const done = isLessonDone(moduleSlug, lessonSlug)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [moduleSlug, lessonSlug])

  useEffect(() => {
    if (data?.module) {
      onLessonMeta?.({ module: moduleSlug, lesson: lessonSlug, title: data.title })
    }
  }, [data, moduleSlug, lessonSlug, onLessonMeta])

  useEffect(() => {
    if (data?.title) document.title = `${data.title} — learn-git`
    return () => {
      document.title = 'learn-git — Git без страха'
    }
  }, [data?.title])

  const markDone = () => {
    if (done) return
    setMarking(true)
    completeLesson(`${moduleSlug}/${lessonSlug}`)
    fire('big')
    toast(t('effects.lessonDone'), { tone: 'success' })
    setTimeout(() => setMarking(false), 600)
  }

  const goNext = () => {
    if (!done) completeLesson(`${moduleSlug}/${lessonSlug}`)
    fire('big')
    const nextPath = data?.next ? `/lesson/${data.next.module}/${data.next.lesson}` : '/'
    navigate(nextPath)
  }

  const steps = data?.steps || []
  const stepCount = useMemo(() => steps.length, [steps])

  if (loading) {
    return (
      <div className="main__inner">
        <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 220 }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="main__inner">
        <div className="empty">
          <div className="empty__icon">🧭</div>
          <h2>{t('common.error')}</h2>
          <p className="muted">{error.message}</p>
          <Link to="/" className="btn">
            {t('lesson.toCourse')}
          </Link>
        </div>
      </div>
    )
  }

  if (data?.soon) {
    return (
      <div className="main__inner" ref={topRef}>
        <div className="breadcrumbs">
          <Link to="/">{data.module.icon} {data.module.title}</Link>
          <span>/</span>
          <span>{data.title}</span>
        </div>
        <div className="empty">
          <div className="empty__icon">✍️</div>
          <h2>{t('lesson.soonTitle')}</h2>
          <p className="muted" style={{ maxWidth: 460, margin: '0 auto var(--space-4)' }}>
            {t('lesson.soonText')}
          </p>
          <Link to="/" className="btn btn--primary">
            {t('lesson.toCourse')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="main__inner">
      <div className="lesson-head">
        <div className="breadcrumbs">
          <Link to="/">{t('nav.course')}</Link>
          <span>/</span>
          <span>
            {data.module.icon} {data.module.title}
          </span>
        </div>
        <h1 className="lesson-head__title">{data.title}</h1>
        <div className="lesson-head__meta">
          <span className="pill">
            <IconTerminal width={13} height={13} /> {data.minutes} {t('course.minutes')}
          </span>
          <span className="pill">
            {stepCount} {t('course.lessons')}
          </span>
          {done && (
            <span className="pill pill--accent">
              <IconCheck width={13} height={13} /> {t('course.completed')}
            </span>
          )}
        </div>
      </div>

      <LessonSteps steps={steps} onComplete={() => {}} />

      <div className="lesson-nav">
        {data.prev ? (
          <Link to={`/lesson/${data.prev.module}/${data.prev.lesson}`} className="lesson-nav__link">
            <span className="lesson-nav__dir">
              <IconArrowLeft width={12} height={12} /> {t('lesson.prev')}
            </span>
            <span className="lesson-nav__title">{data.prev.lesson}</span>
          </Link>
        ) : (
          <span />
        )}
        {data.next && (
          <button type="button" onClick={goNext} className="lesson-nav__link lesson-nav__link--next">
            <span className="lesson-nav__dir">
              {t('lesson.next')} <IconArrowRight width={12} height={12} />
            </span>
            <span className="lesson-nav__title">{data.next.lesson}</span>
          </button>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
        <button type="button" className={`btn ${done ? '' : 'btn--primary'}`} onClick={goNext} style={{ minWidth: 240 }}>
          {t('nav.finish')} <IconArrowRight width={18} height={18} />
        </button>
        {!done && (
          <button type="button" className="btn btn--ghost" onClick={markDone} disabled={marking}>
            {t('lesson.completing')}
          </button>
        )}
      </div>
    </div>
  )
}
