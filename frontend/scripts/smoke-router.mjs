/*
  Смоук-тест фронтенда без браузера: jsdom + заглушки API.
  Проверяет, что страницы рендерятся, темы переключаются, язык меняется,
  квиз работает и прогресс пишется в localStorage.

  Запуск: node scripts/smoke-router.mjs   (из папки frontend, после npm run build:test)
*/

import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'

const frontend = path.resolve(process.cwd())
const fixtureDir = path.join(frontend, '.smoke', 'fixtures')
const outDir = path.join(frontend, '.smoke', 'out')

function buildFixtures() {
  fs.mkdirSync(fixtureDir, { recursive: true })
  execSync('node .smoke/dump-fixtures.mjs', { cwd: frontend, stdio: 'inherit' })
}

function buildApp() {
  execSync('npx vite build --ssr .smoke/entry.jsx --outDir .smoke/out --emptyOutDir --logLevel error', {
    cwd: frontend,
    stdio: 'inherit',
  })
}

buildFixtures()
buildApp()

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.Element = window.Element
globalThis.Node = window.Node
globalThis.MutationObserver = window.MutationObserver
globalThis.getComputedStyle = window.getComputedStyle
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.localStorage = window.localStorage
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
window.scrollTo = () => {}
// canvas-confetti асинхронно трогает контекст — отдаём заглушку вместо null.
const fakeContext = new Proxy(
  {},
  {
    get: (target, key) => (key in target ? target[key] : () => undefined),
    set: (target, key, value) => {
      target[key] = value
      return true
    },
  },
)
window.HTMLCanvasElement.prototype.getContext = () => fakeContext

const read = (name) => {
  const file = path.join(fixtureDir, name)
  if (!fs.existsSync(file)) throw new Error(`Нет фикстуры ${name} — предупреждение: смоук без API`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
const fixtures = {
  'course?lang=ru': read('course-ru.json'),
  'course?lang=en': read('course-en.json'),
  'cheatsheet?lang=ru': read('cheatsheet-ru.json'),
  'cheatsheet?lang=en': read('cheatsheet-en.json'),
  'nav?lang=ru': read('nav-ru.json'),
  'nav?lang=en': read('nav-en.json'),
  'lessons/01-basics/what-is-git?lang=ru': read('lesson-what-is-git-ru.json'),
  'lessons/01-basics/what-is-git?lang=en': read('lesson-what-is-git-en.json'),
  'lessons/01-basics/status-and-config?lang=ru': read('lesson-status-ru.json'),
  'lessons/01-basics/status-and-config?lang=en': read('lesson-status-en.json'),
  'lessons/02-daily/add-and-commit?lang=ru': read('lesson-missing-ru.json'),
  'lessons/03-branching/branches?lang=ru': read('lesson-branches-ru.json'),
}

globalThis.fetch = async (url) => {
  const key = String(url).replace('/api/', '')
  if (!(key in fixtures)) return { ok: false, status: 404, json: async () => ({ error: 'not_found' }) }
  return { ok: true, status: 200, json: async () => fixtures[key] }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const checks = []
const check = (name, condition, detail = '') => {
  checks.push({ name, ok: Boolean(condition), detail })
  console.log(`${condition ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const { mount, rerender } = await import(path.join(outDir, 'entry.js'))
const root = document.getElementById('root')
const count = (sel) => document.querySelectorAll(sel).length
const text = () => document.body.textContent.replace(/\s+/g, ' ').trim()

localStorage.setItem('learn-git:settings', JSON.stringify({ locale: 'ru' }))
mount('/', root)
await sleep(300)

check('главная: 5 модулей', count('.module-card') === 5)
check('главная: статистика курса', document.querySelector('.stat__value')?.textContent === '5')
check('главная: русский заголовок', text().includes('Git без страха'))
check('тема по умолчанию gruvbox-dark', document.documentElement.dataset.theme === 'gruvbox-dark')

document.querySelector('button[aria-label="Настройки"]').click()
await sleep(150)
check('настройки: 10 встроенных тем', count('.theme-card') === 10)

const cards = [...document.querySelectorAll('.theme-card')]
cards.find((card) => card.textContent.includes('Catppuccin Mocha'))?.querySelector('.theme-card__preview').click()
await sleep(150)
check('тема меняется на Catppuccin Mocha', document.documentElement.dataset.theme === 'catppuccin-mocha')
check(
  'тема сохраняется в localStorage',
  JSON.parse(localStorage.getItem('learn-git:settings')).theme === 'catppuccin-mocha',
)

const newThemeBtn = [...document.querySelectorAll('.modal__body button')].find((b) => b.textContent.includes('Новая тема'))
newThemeBtn.click()
await sleep(150)
check('редактор своей темы: 20 цветов', count('.editor-color') === 20)
const nameInput = document.querySelector('#theme-name')
const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
setValue.call(nameInput, 'Sunset')
nameInput.dispatchEvent(new window.Event('input', { bubbles: true }))
await sleep(60)
const saveBtn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Сохранить тему')
check('кнопка сохранения активируется после имени', saveBtn && !saveBtn.disabled)
saveBtn.click()
await sleep(200)
const stored = JSON.parse(localStorage.getItem('learn-git:settings'))
check('своя тема сохранена', stored.customThemes.some((theme) => theme.name === 'Sunset'))
check('своя тема применяется через CSS-переменные', document.documentElement.style.getPropertyValue('--accent').trim() !== '')
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
await sleep(100)

rerender('/lesson/01-basics/what-is-git')
await sleep(350)
check('урок: заголовок', document.querySelector('.lesson-head__title')?.textContent?.includes('Что такое Git'))
check('урок: markdown отрендерен', count('.md') >= 1)
check('урок: выноски :::note/:tip', count('.callout') >= 2)
check('урок: подсветка кода', count('pre code.hljs') >= 1)
check('сайдбар: уроки в списке', count('.sidebar__lesson') >= 4)

rerender('/lesson/01-basics/status-and-config')
await sleep(350)
check('урок с квизом: 3 варианта', count('.quiz__option') === 3)
const options = [...document.querySelectorAll('.quiz__option')]
options[0].click()
await sleep(200)
check('квиз: верный ответ подсвечен', count('.quiz__option--correct') === 1)
check('квиз: разбор показан', count('.quiz__explain') === 1)
check(
  'квиз: XP начислен',
  JSON.parse(localStorage.getItem('learn-git:progress') || '{}').xp >= 10,
)

const finish = [...document.querySelectorAll('.lesson-head ~ * button, button')].find((b) =>
  b.textContent.includes('Завершить урок'),
)
finish?.click()
await sleep(300)
check(
  'урок отмечается пройденным',
  Boolean(JSON.parse(localStorage.getItem('learn-git:progress')).lessons['01-basics/status-and-config']),
)

rerender('/lesson/02-daily/add-and-commit')
await sleep(300)
check('урок без текста: заглушка «ещё пишется»', text().includes('Этот урок ещё пишется') || text().includes('ещё пишется'))

rerender('/cheatsheet')
await sleep(300)
check('шпаргалка: строки команд', count('.cheat-row') >= 5)
const search = document.querySelector('.search input')
setValue.call(search, 'merge')
search.dispatchEvent(new window.Event('input', { bubbles: true }))
await sleep(120)
const allRows = count('.cheat-row')
check(
  'шпаргалка: поиск фильтрует',
  allRows > 0 && allRows < 28 && [...document.querySelectorAll('.cheat-row')].every((row) => row.textContent.toLowerCase().includes('merge')),
  `${allRows} строк`,
)

/* --- терминал-тренажёр ------------------------------------------------- */

rerender('/lesson/03-branching/branches')
await sleep(350)
check('урок с терминалом: задание показано', count('.task') === 1)
check('терминал отрендерен', count('.terminal') === 1 && count('.term__input') === 1)
check('терминал: приглашение и приветствие', text().includes('Виртуальный репозиторий'))
check('терминал: чипы «Попробуй»', count('.terminal__quick .chip') >= 3)

const runCmd = async (command) => {
  const input = document.querySelector('.term__input')
  setValue.call(input, command)
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
  await sleep(30)
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await sleep(120)
}

await runCmd('help')
check('терминал: help показывает команды', text().includes('git init') && text().includes('создать репозиторий'))
check('терминал: help показывает подсказки к заданию', text().includes('Подсказки к этому заданию'))

await runCmd('git status')
check('терминал: git status отвечает как настоящий', text().includes('On branch main'))
await runCmd('git switch -c feature/notes')
await runCmd('echo "идеи" > ideas.txt')
await runCmd('git add .')
await runCmd('git commit -m "feat: notes"')
await runCmd('git switch main')
await sleep(200)
check('терминал: коммит виден в логе', (await runCmd('git log --oneline'), text().includes('feat: notes')))
check('терминал: задание засчитано', count('.task--done') === 1)
check('терминал: плашка «решено»', text().includes('решено') || text().includes('Задание выполнено'))
check('терминал: подсказки сворачиваются', count('.task__actions button') === 1)

const progress = JSON.parse(localStorage.getItem('learn-git:progress') || '{}')
check('терминал: XP за задание начислен', progress.terminals?.['branch-practice']?.solved === true)
check('терминал: XP в общем счёте', progress.xp >= 15, `${progress.xp} XP`)
const solvedXp = progress.xp

/* Повторное решение после «Сбросить» не должно давать XP второй раз. */
document.querySelector('.code__copy').click()
await sleep(150)
for (const command of ['git switch -c feature/notes', 'echo "x" > ideas.txt', 'git add .', 'git commit -m "feat: notes"', 'git switch main']) {
  await runCmd(command)
}
await sleep(200)
check(
  'терминал: XP не начисляется повторно',
  JSON.parse(localStorage.getItem('learn-git:progress')).xp === solvedXp,
  `${JSON.parse(localStorage.getItem('learn-git:progress')).xp} XP`,
)

/* Песочница: тот же терминал, но без задания и без XP. */
const xpAfterTasks = JSON.parse(localStorage.getItem('learn-git:progress') || '{}').xp
rerender('/sandbox')
await sleep(350)
check('песочница: терминал есть', count('.terminal') === 1 && count('.term__input') === 1)
check('песочница: без блока задания', count('.task') === 0)
await runCmd('git init')
await runCmd('echo "hi" > a.txt')
await runCmd('git add .')
await runCmd('git commit -m "docs: hello"')
check('песочница: команды работают', text().includes('docs: hello'))
check(
  'песочница: XP не начисляется',
  JSON.parse(localStorage.getItem('learn-git:progress') || '{}').xp === xpAfterTasks,
  `${JSON.parse(localStorage.getItem('learn-git:progress') || '{}').xp} XP`,
)
check(
  'песочница: прогресс не тронут',
  !JSON.parse(localStorage.getItem('learn-git:progress') || '{}').terminals?.['sandbox'],
)

rerender('/nope')
await sleep(200)
check('404 страница', text().includes('404'))

rerender('/cheatsheet')
await sleep(300)
document.querySelector('.header__actions button[aria-label*="English"]').click()
await sleep(500)
check('переключение языка в хедере', document.documentElement.lang === 'en')
check('английский текст на странице', text().includes('Cheatsheet'))
check(
  'язык сохранён',
  JSON.parse(localStorage.getItem('learn-git:settings')).locale === 'en',
)

const failed = checks.filter((item) => !item.ok)
console.log(`\n${failed.length ? '❌' : '✅'} Итого: ${checks.length - failed.length}/${checks.length}`)
process.exit(failed.length ? 1 : 0)
