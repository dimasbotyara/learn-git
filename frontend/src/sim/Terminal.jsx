import { useEffect, useMemo, useRef, useState } from 'react'
import { GitSim } from './git'
import { evaluateCheck } from './checks'
import { useI18n } from '../i18n'
import { useSettings } from '../settings'
import { useEffects } from '../effects'
import { IconCheck } from '../components/Icons'

const TONE_CLASS = {
  out: 'term__line',
  muted: 'term__line term__line--muted',
  success: 'term__line term__line--ok',
  error: 'term__line term__line--err',
  accent: 'term__line term__line--accent',
  input: 'term__line term__line--input',
}

let simCounter = 0

export function Terminal({ task, hints = [], check, setup = [], label, onSolved, autoHeight = false }) {
  const { t, locale } = useI18n()
  const { fontSize } = useSettings()
  const { fire, toast } = useEffects()
  const simRef = useRef(null)
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [solved, setSolved] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const simId = useMemo(() => {
    simCounter += 1
    return simCounter
  }, [])

  const createSim = () => new GitSim({ hints, setup, locale })

  useEffect(() => {
    simRef.current = createSim()
    setLines([
      { tone: 'muted', text: t('terminal.welcome') },
      { tone: 'muted', text: t('terminal.hintHelp') },
      { tone: 'out', text: '' },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simId, locale])

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [lines])

  const push = (items) => setLines((current) => [...current, ...items])

  const run = (raw) => {
    const command = raw.trim()
    push([{ tone: 'input', text: command }])
    if (!command) return
    setHistory((current) => [...current, command])
    setHistoryIndex(-1)
    const result = simRef.current.exec(command)
    if (result.clear) {
      setLines([])
      return
    }
    push(result.lines.length ? result.lines : [{ tone: 'out', text: '' }])
    if (command === 'help' || command === '?') {
      push([{ tone: 'muted', text: '' }])
    }

    if (check) {
      const verdict = evaluateCheck(simRef.current, check, [...history, command])
      if (verdict.passed && !solved) {
        setSolved(true)
        push([{ tone: 'success', text: '' }, { tone: 'success', text: `✔ ${t('terminal.passed')}` }])
        fire('big')
        toast(t('terminal.passed'), { tone: 'success' })
        onSolved?.()
      } else if (!verdict.passed) {
        setAttempts((current) => current + 1)
      }
    }
  }

  const reset = () => {
    simRef.current = createSim()
    setSolved(false)
    setAttempts(0)
    setHistory([])
    setLines([
      { tone: 'muted', text: t('terminal.welcome') },
      { tone: 'muted', text: t('terminal.hintHelp') },
      { tone: 'out', text: '' },
    ])
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      run(input)
      setInput('')
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!history.length) return
      const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setInput(history[next])
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex < 0) return
      const next = historyIndex + 1
      if (next >= history.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(next)
        setInput(history[next])
      }
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const suggestions = ['git status', 'git add .', 'git commit -m ""', 'git log --oneline', 'git diff']
      const match = suggestions.find((item) => item.startsWith(input) && item !== input)
      if (match) setInput(match)
    }
    if (event.key === 'l' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      setLines([])
    }
  }

  const quick = (command) => {
    run(command)
    inputRef.current?.focus()
  }

  return (
    <div className={`terminal ${autoHeight ? 'terminal--auto' : ''}`}>
      <div className="terminal__head">
        <div className="code__dots" aria-hidden="true">
          <span className="code__dot" />
          <span className="code__dot" />
          <span className="code__dot" />
        </div>
        <span className="code__lang">{label || '~/project'}</span>
        <div className="terminal__head-actions">
          {solved && (
            <span className="pill pill--accent">
              <IconCheck width={12} height={12} /> {t('terminal.solved')}
            </span>
          )}
          <button type="button" className="code__copy" onClick={reset}>
            {t('terminal.reset')}
          </button>
        </div>
      </div>

      <div className={`terminal__body terminal__body--${fontSize}`} ref={scrollRef} onClick={() => inputRef.current?.focus()}>
        {lines.map((line, index) => (
          <div key={index} className={TONE_CLASS[line.tone] || TONE_CLASS.out}>
            {line.tone === 'input' ? (
              <>
                <span className="term__prompt">~/project $</span>
                <span className="term__cmd">{line.text}</span>
              </>
            ) : (
              line.text || '\u00a0'
            )}
          </div>
        ))}
        <div className="term__line term__line--input">
          <span className="term__prompt">~/project $</span>
          <input
            ref={inputRef}
            className="term__input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="terminal input"
          />
        </div>
      </div>

      {hints.length > 0 && (
        <div className="terminal__hints">
          <span className="faint mono">help →</span>
          {hints.slice(0, 3).map((hint) => (
            <span key={hint} className="terminal__hint">
              {hint}
            </span>
          ))}
        </div>
      )}

      <div className="terminal__quick">
        <span className="faint mono">{t('terminal.try')}</span>
        {['git status', 'git log --oneline', 'git diff', 'help'].map((command) => (
          <button key={command} type="button" className="chip" onClick={() => quick(command)}>
            {command}
          </button>
        ))}
        {attempts >= 4 && !solved && (
          <span className="terminal__nudge">{t('terminal.nudge')}</span>
        )}
      </div>
    </div>
  )
}
