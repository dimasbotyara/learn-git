import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { useEffects } from '../effects'
import { Link } from 'react-router-dom'
import { Markdown } from './Markdown'
import { InlineCode } from './InlineCode'
import { Terminal } from '../sim/Terminal'
import { IconCheck } from './Icons'

export function LessonSteps({ steps, onComplete }) {
  const { t } = useI18n()
  const { recordQuiz, recordTask } = useProgress()

  return (
    <div className="lesson-steps">
      {steps.map((step, index) => (
        <Step
          key={`${step.type}-${index}`}
          step={step}
          index={index}
          total={steps.length}
          onComplete={onComplete}
          recordQuiz={recordQuiz}
          recordTask={recordTask}
          t={t}
        />
      ))}
    </div>
  )
}

function Step({ step, index, total, onComplete, recordQuiz, recordTask, t }) {
  const label = (
    <div className="steps" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`steps__item ${i < index ? 'steps__item--done' : i === index ? 'steps__item--current' : ''}`}
        />
      ))}
    </div>
  )

  if (step.type === 'theory') {
    return (
      <article className="animate-in">
        {label}
        <Markdown html={step.html} />
      </article>
    )
  }

  if (step.type === 'quiz') {
    return (
      <article className="animate-in">
        {label}
        <QuizStep step={step} recordQuiz={recordQuiz} onComplete={onComplete} t={t} />
      </article>
    )
  }

  if (step.type === 'checklist') {
    return (
      <article className="animate-in">
        {label}
        <ChecklistStep step={step} onComplete={onComplete} t={t} />
      </article>
    )
  }

  if (step.type === 'terminal') {
    return (
      <article className="animate-in">
        {label}
        <TerminalStep step={step} onComplete={onComplete} recordTask={recordTask} t={t} />
      </article>
    )
  }

  return null
}

export function QuizStep({ step, recordQuiz, onComplete, t }) {
  const [picked, setPicked] = useState(null)
  const { toast, fire } = useEffects()

  const pick = (option) => {
    if (picked) return
    setPicked(option.id)
    recordQuiz(step.id, option.correct)
    if (option.correct) {
      fire('small')
      onComplete?.()
      toast(t('effects.quizCorrect'), { tone: 'success' })
    }
  }

  const pickedOption = step.options.find((option) => option.id === picked)

  return (
    <div className="card" style={{ marginTop: 'var(--space-4)' }}>
      <div className="pill pill--accent" style={{ marginBottom: 'var(--space-3)' }}>
        🧠 {t('lesson.quizHint')}
      </div>
      <h3 style={{ marginTop: 0 }}>
        <InlineCode text={step.question} />
      </h3>
      <div className="quiz__options">
        {step.options.map((option, index) => {
          const isPicked = picked === option.id
          const revealed = Boolean(picked)
          const className = [
            'quiz__option',
            revealed && option.correct ? 'quiz__option--correct' : '',
            revealed && isPicked && !option.correct ? 'quiz__option--wrong' : '',
            revealed && !isPicked && !option.correct ? 'quiz__option--dim' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button key={option.id} type="button" className={className} onClick={() => pick(option)} disabled={revealed}>
              <span className="quiz__letter">{String.fromCharCode(65 + index)}</span>
              <span>
                <InlineCode text={option.text} />
              </span>
            </button>
          )
        })}
      </div>
      {picked && (
        <div className={`quiz__explain ${pickedOption?.correct ? '' : 'quiz__explain--wrong'}`}>
          <strong>{pickedOption?.correct ? t('lesson.correct') : t('lesson.tryAgain')}</strong>{' '}
          <InlineCode text={pickedOption?.explain || ''} />
        </div>
      )}
    </div>
  )
}

export function ChecklistStep({ step, onComplete, t }) {
  const { setChecklist, checklist } = useProgress()
  const saved = checklist(step.id)
  const [values, setValues] = useState(() =>
    step.items.map((_, index) => Boolean(saved[index])),
  )
  const { fire } = useEffects()

  useEffect(() => {
    setChecklist(step.id, values)
    if (values.length && values.every(Boolean)) {
      onComplete?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const toggle = (index) => {
    setValues((current) => {
      const next = [...current]
      next[index] = !next[index]
      if (next.every(Boolean)) fire('small')
      return next
    })
  }

  return (
    <div className="card" style={{ marginTop: 'var(--space-4)' }}>
      <h3 style={{ marginTop: 0 }}>{step.title}</h3>
      <div className="checklist">
        {step.items.map((item, index) => (
          <button
            key={index}
            type="button"
            className={`checklist__item ${values[index] ? 'checklist__item--done' : ''}`}
            onClick={() => toggle(index)}
            aria-pressed={Boolean(values[index])}
          >
            <span className="checklist__box">{values[index] ? <IconCheck width={12} height={12} strokeWidth={3} /> : null}</span>
            <span className="checklist__text">
              <InlineCode text={item} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TerminalStep({ step, onComplete, recordTask, t }) {
  const { isTaskSolved } = useProgress()
  const [solved, setSolved] = useState(() => isTaskSolved(step.id))

  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      <div className={`task ${solved ? 'task--done' : ''}`}>
        <span className="task__label">{solved ? t('terminal.taskDone') : t('terminal.task')}</span>
        <p className="task__text">
          <InlineCode text={step.task} />
        </p>
        {step.hints?.length > 0 && <Hints hints={step.hints} t={t} />}
      </div>
      <Terminal
        task={step.task}
        hints={step.hints || []}
        check={step.check}
        setup={step.setup || []}
        label={step.id || '~/project'}
        onSolved={() => {
          setSolved(true)
          recordTask?.(step.id)
          onComplete?.()
        }}
      />
    </div>
  )
}

function Hints({ hints, t }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="task__actions">
      <button type="button" className="btn btn--sm" onClick={() => setOpen((value) => !value)}>
        {open ? t('terminal.hideHint') : t('terminal.showHint')}
      </button>
      {open && (
        <ul style={{ margin: 0, paddingLeft: '1.1em', fontSize: 'var(--text-sm)' }}>
          {hints.map((hint) => (
            <li key={hint} className="muted">
              {hint}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
