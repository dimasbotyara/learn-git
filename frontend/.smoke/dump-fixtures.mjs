/* Сохраняет ответы API в fixtures, чтобы smoke-тест работал без сервера. */
import fs from 'node:fs'
import path from 'node:path'

const frontend = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
process.chdir(frontend)

const dir = path.join(frontend, '.smoke', 'fixtures')
const base = process.env.API_BASE || 'http://127.0.0.1:13444/api'
fs.mkdirSync(dir, { recursive: true })

const files = {
  'course-ru.json': '/course?lang=ru',
  'course-en.json': '/course?lang=en',
  'cheatsheet-ru.json': '/cheatsheet?lang=ru',
  'cheatsheet-en.json': '/cheatsheet?lang=en',
  'nav-ru.json': '/nav?lang=ru',
  'nav-en.json': '/nav?lang=en',
  'lesson-what-is-git-ru.json': '/lessons/01-basics/what-is-git?lang=ru',
  'lesson-what-is-git-en.json': '/lessons/01-basics/what-is-git?lang=en',
  'lesson-status-ru.json': '/lessons/01-basics/status-and-config?lang=ru',
  'lesson-status-en.json': '/lessons/01-basics/status-and-config?lang=en',
  'lesson-branches-ru.json': '/lessons/03-branching/branches?lang=ru',
}

for (const [name, url] of Object.entries(files)) {
  const response = await fetch(base + url)
  if (!response.ok) throw new Error(`fixture failed: ${url} -> ${response.status}`)
  fs.writeFileSync(path.join(dir, name), JSON.stringify(await response.json()))
}
// «Ненаписанный» урок: бэкенд отдаёт soon-структуру по реальному маршруту.
const missing = {
  locale: 'ru',
  soon: true,
  module: { slug: '02-daily', icon: '🛠️', title: 'Ежедневная рутина' },
  slug: 'add-and-commit',
  title: 'git add и git commit',
  summary: '',
  minutes: 9,
  steps: [],
  prev: null,
  next: null,
}
fs.writeFileSync(path.join(dir, 'lesson-missing-ru.json'), JSON.stringify(missing))
console.log('fixtures ready:', Object.keys(files).length + 1)
