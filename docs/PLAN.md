# learn-git — план каркаса и курсов

> Черновик для обсуждения. Ничего ещё не закодировано — сначала договариваемся.

## 0. Решения (зафиксировано)

| Вопрос | Решение |
|---|---|
| Практика | Симулятор-lite: виртуальный репозиторий, задания по модулям 1–2 глубоко, 3–5 через визуальные сценарии и квизы |
| Прогресс | localStorage в браузере (+ экспорт/импорт JSON), без аккаунтов |
| Темы | Все 10, по умолчанию Gruvbox Dark |
| Фронтенд | **Vite + React**, `node_modules/` и `dist/` в `.gitignore` |

### Как это стыкуется с Flask и портом 13444

Один публичный порт — Flask на `0.0.0.0:13444`:

- Flask = API (`/api/...`: программа курса, отрендеренные уроки, health) + раздача собранного SPA из `frontend/dist`.
- React собирается Vite в `frontend/dist` → Flask отдаёт `index.html` на всех «человеческих» маршрутах.
- Разработка: `npm run dev` (Vite, HMR) проксирует `/api` на Flask; прод/превью: `npm run build` + Flask.
- Всё офлайн: шрифты и `canvas-confetti` — npm-пакеты, Vite кладёт их в `dist/assets`, CDN нет.
- `npm run build` нужен после клонирования (dist в git не лежит) — опишем в README и добавим `scripts/start.sh`.

## 1. Чего хотим

Интерактивный сайт-курс по Git для новичков: теория простым языком, практика прямо в браузере,
прогресс, приятные экранные эффекты (конфетти, анимации), несколько тем оформления,
полная мобильная адаптация, **ноль обращений к CDN** — шрифты, CSS и JS лежат в репозитории.

## 2. Стек

| Слой | Выбор | Почему |
|---|---|---|
| Бэкенд | Python 3.11 + Flask 3 | как просил; app factory + blueprints, чтобы не превратилось в один `app.py` на 2000 строк |
| API | REST JSON (`/api/course`, `/api/lessons/<slug>`, `/api/health`) | фронт — SPA, контент приходит данными |
| Контент | `content/*.yaml` (метаданные) + `content/**/*.md` | курс = данные, а не хардкод; легко добавлять уроки |
| Фронт | **React 18 + Vite**, React Router | решение пользователя |
| Стили | чистый CSS + CSS-переменные (без Tailwind/UI-китов) | темы = один набор токенов, ноль лишних зависимостей |
| Подсветка кода | `highlight.js` (npm, офлайн) + тема из токенов | работает в браузере, красится под тему |
| Эффекты | `canvas-confetti` (npm, ~7 КБ) + CSS/Framer-подобные анимации на CSS | конфетти без CDN |
| Шрифты | `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` через npm | Vite кладёт woff2 в `dist/assets`, CDN нет |
| Прогресс | localStorage + экспорт/импорт JSON | без аккаунтов |
| Тесты | pytest (API) + `npm run build` как smoke | чтобы каркас не разваливался |

Структура:

```
backend/
  app/__init__.py          # create_app(): API + раздача frontend/dist
  app/routes/{course,lessons,meta}.py
  app/content.py           # парсинг YAML+Markdown, кэш, markdown-it/py
  app/static/              # (пусто; статика — в SPA)
  tests/                   # pytest
  requirements.txt
content/
  course.yaml              # модули, уроки, порядок
  modules/01-basics/*.md
frontend/
  package.json / vite.config.js
  index.html
  src/
    main.jsx, App.jsx
    api/                   # fetch-обёртки
    styles/{tokens.css, themes/*.css, base.css, layout.css, components.css}
    components/            # Header, Sidebar, ThemePicker, CodeBlock, Callout...
    pages/                 # Home, Module, Lesson, Cheatsheet, Sandbox
    features/
      terminal/            # симулятор git (движок + UI)
      quiz/
      conflict/            # визуальный резолвер
      progress/            # localStorage, XP, streak
      effects/             # конфетти, prefers-reduced-motion
scripts/
  start.sh                 # build если нет dist + запуск Flask на 0.0.0.0:13444
run.py                     # host 0.0.0.0, port 13444
```

## 3. Шрифты (локально)

- **Inter** (variable) — интерфейс, кириллица + латиница.
- **JetBrains Mono** (variable) — команды, терминал, акценты (кириллица поддерживается).
- Пакеты `@fontsource-variable/inter` и `@fontsource-variable/jetbrains-mono` из npm;
  Vite инлайнит `@font-face` и копирует woff2 в `dist/assets` — никаких `fonts.googleapis.com`.
- Системный fallback: `ui-sans-serif`, `ui-monospace`.

## 4. Темы

Один набор CSS-переменных → все компоненты и подсветка кода красятся автоматически.
Тема = `data-theme` на `<html>`, выбор в `localStorage`, без «вспышки» белым при загрузке.

Планируемый набор:

| id | Название | Заметка |
|---|---|---|
| `gruvbox-dark` | Gruvbox Dark | **по умолчанию** |
| `gruvbox-light` | Gruvbox Light | тёплая светлая |
| `catppuccin-mocha` | Catppuccin Mocha | |
| `catppuccin-macchiato` | Catppuccin Macchiato | |
| `catppuccin-frappe` | Catppuccin Frappé | |
| `catppuccin-latte` | Catppuccin Latte | светлая |
| `ayu-dark` | Ayu Dark | |
| `ayu-mirage` | Ayu Mirage | |
| `ayu-light` | Ayu Light | светлая |
| `minimal-dark` | Minimal Dark | монохром, минимум цвета |

Токены (одинаковые имена во всех темах):
`--bg --bg-soft --bg-elev --border --fg --fg-muted --fg-faint --accent`
`--red --green --yellow --blue --purple --aqua --orange`
`--term-bg --term-fg` + 16 ANSI-цветов для симулятора терминала
`--selection --shadow --radius`.

Переключатель — аккуратный поповер в хедере (на мобиле — в drawer), с превью цветов.

## 5. Программа курса (5 модулей)

**📚 1. База** — Git vs GitHub (главная путаница), установка и `git --version`, `git init`,
`git clone`, `git status`, `git config --global user.name/user.email`. Практика: создать репозиторий и настроить себя.

**🛠️ 2. Ежедневная рутина** — staging area как корзина перед отправкой посылки, `git add`,
`git commit` и осмысленные сообщения (разбор «fix», «update», «oops» на примерах),
`git log`/`git diff`, `git push`/`git pull`, что такое remote.
Практика: «сделай 3 коммита и отправь».

**🌿 3. Ветки и слияние** — зачем ветки, `git branch`, `git switch`/`checkout`,
`git merge`, как читать вывод (fast-forward vs 3-way, `Already up to date`),
**интерактивный merge conflict**: экран с `<<<<<<<` / `=======` / `>>>>>>>`,
выбор ours/theirs/оба + разбор, почему так вышло. Это ключевой экран модуля.

**🚀 4. Продвинутое, но нужное** — `.gitignore` (пароли, `.env`, мусор; шаблоны для Python/Node),
`git stash` (спрятать и вернуть), `git reset --soft/--mixed/--hard` (что именно теряется),
`git revert` vs `reset` — почему в команде почти всегда revert, `git reflog` как «страховка».

**🤝 5. GitHub и команда** — SSH-ключи (`ssh-keygen`, `ssh -T git@github.com`),
лёгкий путь через `gh auth login`, форк vs клон, Pull Request, ревью и комментарии,
`git remote`, работа с upstream, ветка → PR → merge.

Плюс отдельные страницы: **Шпаргалка** (все команды с примерами и поиском) и
**Песочница** (свободный тренажёр без задания).

## 6. Интерактив

Типы шагов урока:

1. `theory` — Markdown + врезки (подсказка / ошибка / «запомни»), кнопки «скопировать».
2. `quiz` — один/несколько вариантов, разбор после ответа.
3. `terminal` — **симулятор git в браузере**: виртуальный репозиторий (файлы, staging, коммиты,
   ветки, HEAD, конфликты), задание + проверка состояния. Команды: `init status add commit log
   branch switch merge diff stash reset revert remote clone config` + `ls/cat/touch/echo`.
   Подсказки по `Tab`, история по ↑/↓, `help`.
4. `conflict` — визуальный резолвер конфликта с пошаговым объяснением.
5. `checklist` — «сделал / не сделал» для реальных действий на своём компьютере.

## 7. Прогресс и мотивация

- Отметка урока пройденным, прогресс по модулю (кольцо) и по курсу (полоса в хедере).
- XP, серия дней (streak), «модуль пройден» → конфетти.
- Конфетти/пульс на верном ответе квиза; всё уважает `prefers-reduced-motion`.
- Экспорт/импорт прогресса JSON (чтобы не потерять при чистке браузера).

## 8. Мобильная адаптация

- Mobile-first CSS, брейкпоинты 480 / 768 / 1024.
- Навигация: sidebar → drawer с оверлеем, sticky-низ на мобиле («назад / далее»).
- Терминал: горизонтальный скролл, шрифт 13–14px, кнопки-подсказки команд вместо Tab.
- Таблицы команд → карточки, никакого горизонтального скролла страницы.
- Тач-таргеты ≥ 44px, safe-area для iOS.

## 9. Этапы

Статус на сегодня: **все пять этапов закрыты**, 11 уроков написаны на двух языках.

1. ✅ **Каркас** — Flask API + Vite/React, layout, все 10 тем, шрифты, мобильное меню, страницы курса и урока.
2. ✅ **Контент** — модули 1–2 (теория + квизы + задания тренажёра), RU + EN.
3. ✅ **Практика** — `frontend/src/sim/` : виртуальный git (`git.js`), декларативные проверки
   (`checks.js`), окно тренажёра (`Terminal.jsx`), merge-конфликт с маркерами, модули 3–4.
4. ✅ **Соцчасть** — модуль 5 (SSH, PR, code review), шпаргалка на 28 команд, песочница.
5. ✅ **Полировка** — эффекты, доступность, 12 pytest + 39 jsdom-проверок, README с запуском.

### Как устроен тренажёр

- Задание живёт в `content/course.yaml` рядом с уроком:
  `terminal: {id, title, task, hints?, setup?, check}`.
- `setup` — необязательная «предыстория»: команды, которые выполняются до ученика
  (создать конфликт, спрятать черновик в ветке и т. п.).
- `check` — набор правил: `initialized`, `commits`, `files`, `fileInHistory`, `indexHas`,
  `ignored`, `status.clean`, `branch`, `branchExists`, `pushed`, `remoteBranch`,
  `mergeInProgress`, `conflicts`, `stashCount`, `logContains`, `ranCommands`.
  Правила комбинируются через `all` / `any` / `not`.
- Проверка идёт по **состоянию** репозитория, а не по точной команде, поэтому решение
  может быть любым. `ranCommands` используется только там, где важен сам инструмент
  (например, `git stash pop`).
- `help` внутри тренажёра печатает общий список команд и подсказки к заданию —
  но **только в тех уроках, где они заданы**; остальным достаётся общий список и
  честная приписка, что отдельных подсказок нет.
- Вывод движка двуязычный (`locale`), как и весь интерфейс.

### Что можно добавить дальше

- Визуальный diff-конфликт (две колонки «наше / их» вместо маркеров в тексте).
- XP за решённые задания тренажёра (сейчас XP даёт только квиз) — карта `terminals`
  в `learn-git:progress`.
- Второй набор заданий «со звёздочкой»: `rebase`, `cherry-pick`, `git bisect`.

## 10. Открытые мелочи (можно решать по ходу)

1. Название/логотип проекта — «learn-git» текстом или сделаем небольшой SVG-логотип?
2. Нужна ли тёмная/светлая «системная» тема, которая следует за ОС (сверх 10 ручных)?
3. Язык интерфейса: только русский или RU/EN переключатель?
4. Английские термины (staging area, merge) — оставляем в скобках для привыкания (предлагаю да).
