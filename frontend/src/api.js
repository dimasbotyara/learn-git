/* Тонкая обёртка над fetch: один base, понятные ошибки, отмена запроса. */

const BASE = '/api'

async function request(path, { signal } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    let payload = null
    try {
      payload = await response.json()
    } catch {
      /* not json */
    }
    const error = new Error(payload?.error || `HTTP ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }
  return response.json()
}

const withLang = (path, lang) => `${path}${path.includes('?') ? '&' : '?'}lang=${lang}`

export const api = {
  meta: (signal) => request('/meta', { signal }),
  course: (lang, signal) => request(withLang('/course', lang), { signal }),
  nav: (lang, signal) => request(withLang('/nav', lang), { signal }),
  cheatsheet: (lang, signal) => request(withLang('/cheatsheet', lang), { signal }),
  lesson: (moduleSlug, lessonSlug, lang, signal) =>
    request(withLang(`/lessons/${moduleSlug}/${lessonSlug}`, lang), { signal }),
}
