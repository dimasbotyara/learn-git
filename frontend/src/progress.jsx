/*
  Прогресс: пройденные уроки, XP, серия дней, пройденные квизы и чек-листы.
  Хранится в localStorage; экспорт/импорт — в настройках.
*/

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'learn-git:progress'
const XP_PER_LESSON = 25
const XP_PER_QUIZ = 10

const EMPTY = {
  version: 1,
  lessons: {}, // "module/lesson" -> { done: true, at: ISO }
  quizzes: {}, // stepId -> { correct: true, at }
  checklists: {}, // stepId -> [bool, ...]
  xp: 0,
  streak: { count: 0, last: null },
  updatedAt: null,
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY }
    return { ...EMPTY, ...parsed }
  } catch {
    return { ...EMPTY }
  }
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [state, setState] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota / private mode */
    }
  }, [state])

  const touchStreak = useCallback((current) => {
    const day = today()
    if (current.streak.last === day) return current
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const count = current.streak.last === yesterday ? current.streak.count + 1 : 1
    return { ...current, streak: { count, last: day } }
  }, [])

  const completeLesson = useCallback(
    (key) => {
      setState((current) => {
        if (current.lessons[key]?.done) return current
        const next = touchStreak({
          ...current,
          lessons: { ...current.lessons, [key]: { done: true, at: new Date().toISOString() } },
          xp: current.xp + XP_PER_LESSON,
          updatedAt: new Date().toISOString(),
        })
        return next
      })
    },
    [touchStreak],
  )

  const uncompleteLesson = useCallback((key) => {
    setState((current) => {
      const lessons = { ...current.lessons }
      delete lessons[key]
      return { ...current, lessons }
    })
  }, [])

  const recordQuiz = useCallback(
    (id, correct) => {
      if (!id) return
      setState((current) => {
        const previous = current.quizzes[id]
        const gained = correct && !previous?.correct ? XP_PER_QUIZ : 0
        return {
          ...current,
          quizzes: { ...current.quizzes, [id]: { correct: Boolean(correct), at: new Date().toISOString() } },
          xp: current.xp + gained,
        }
      })
    },
    [],
  )

  const setChecklist = useCallback((id, values) => {
    if (!id) return
    setState((current) => ({ ...current, checklists: { ...current.checklists, [id]: values } }))
  }, [])

  const resetProgress = useCallback(() => setState({ ...EMPTY }), [])

  const importProgress = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') return false
    setState({ ...EMPTY, ...payload })
    return true
  }, [])

  const value = useMemo(() => {
    const doneKeys = Object.keys(state.lessons).filter((key) => state.lessons[key]?.done)
    return {
      state,
      doneKeys,
      isLessonDone: (moduleSlug, lessonSlug) => Boolean(state.lessons[`${moduleSlug}/${lessonSlug}`]?.done),
      completeLesson,
      uncompleteLesson,
      recordQuiz,
      quizResult: (id) => state.quizzes[id] || null,
      setChecklist,
      checklist: (id) => state.checklists[id] || [],
      resetProgress,
      importProgress,
      xp: state.xp,
      streak: state.streak,
    }
  }, [state, completeLesson, uncompleteLesson, recordQuiz, setChecklist, resetProgress, importProgress])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside ProgressProvider')
  return context
}

export { XP_PER_LESSON, XP_PER_QUIZ }
