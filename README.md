# learn-git 🚀

Интерактивный курс по Git для новичков: теория простым языком, практика, симулятор терминала,
визуальные merge-конфликты и приятные экранные эффекты. Всё работает офлайн — без CDN,
с локальными шрифтами и библиотеками.

**Стек:** Flask (JSON API) + React 18 / Vite (SPA), чистый CSS на переменных, 10 тем + редактор своих.

## Быстрый старт

```bash
./scripts/start.sh
```

Скрипт создаст `.venv`, поставит зависимости, соберёт фронтенд и поднимет сервер
на **http://localhost:13444** (`0.0.0.0`).

Вручную:

```bash
# бэкенд
python3 -m venv .venv
./.venv/bin/pip install -r backend/requirements.txt

# фронтенд
cd frontend && npm install && npm run build && cd ..

# запуск (0.0.0.0:13444)
./.venv/bin/python backend/run.py
```

Разработка с горячей перезагрузкой:

```bash
./scripts/start.sh --dev   # или: (cd backend && ../.venv/bin/python run.py) + (cd frontend && npm run dev)
```

Vite на `0.0.0.0:5173` проксирует `/api` в Flask на `13444`, поэтому API и UI всегда рядом.

## Что уже работает

- **Каркас сайта**: хедер с прогрессом, сайдбар курса, мобильный drawer, sticky-навигация на телефоне.
- **Курс из контента, а не из кода**: `content/course.yaml` + Markdown-файлы уроков (RU/EN).
- **10 тем**: Gruvbox Dark (по умолчанию) и Light, Catppuccin Mocha / Macchiato / Frappé / Latte,
  Ayu Dark / Mirage / Light, Minimal Dark. Плюс **редактор своей темы** (20 цветов, база — любая встроенная).
- **Два языка**: RU/EN, автоопределение по браузеру, переключатель в хедере и в настройках.
- **Прогресс**: пройденные уроки, XP, серия дней, экспорт/импорт JSON — всё в `localStorage`.
- **Эффекты**: конфетти, анимации, тосты; уважают `prefers-reduced-motion` и настройку «Эффекты».
- **Курс**: 5 модулей, 7 уроков (модуль 1 написан полностью на двух языках, остальные — в работе).
- **Тесты**: 10 pytest-тестов API и 28 браузерных проверок фронтенда (jsdom, без Chromium).

## Структура

```
backend/
  app/__init__.py        # create_app: API + раздача SPA из frontend/dist
  app/content.py         # YAML + Markdown → JSON, локализация, выноски :::note
  app/routes/api.py      # /api/health, /api/course, /api/lessons/..., /api/cheatsheet
  app/routes/web.py      # SPA-fallback и подсказка «собери фронтенд»
  run.py                 # 0.0.0.0:13444
  tests/                 # pytest
content/
  course.yaml            # модули, уроки, шпаргалка
  modules/01-basics/*.md # уроки (ru) и *.en.md (en)
frontend/
  src/styles/            # tokens.css (все темы), base, layout, components
  src/settings.jsx       # темы, язык, эффекты, размер текста
  src/i18n/{ru,en}.js    # словари интерфейса
  src/progress.jsx       # localStorage-прогресс
  src/pages/             # Home, Lesson, Cheatsheet, Sandbox
  scripts/smoke-router.mjs
scripts/start.sh
docs/PLAN.md             # план этапов и принятые решения
```

## API

| Маршрут | Что отдаёт |
|---|---|
| `GET /api/health` | статус сервиса |
| `GET /api/meta` | локали по умолчанию и список языков |
| `GET /api/course?lang=ru` | дерево модулей и уроков |
| `GET /api/nav?lang=ru` | плоский список для навигации |
| `GET /api/lessons/<module>/<lesson>?lang=ru` | шаги урока: теория (HTML), квизы, чек-листы |
| `GET /api/cheatsheet?lang=ru` | команды шпаргалки |

## Как добавить урок

1. Создай `content/modules/<модуль>/<slug>.md` (и `<slug>.en.md` для английского).
2. Добавь урок в `content/course.yaml` — можно с `steps` (`theory`, `quiz`, `checklist`, `terminal`).
3. Перезапусти Flask (контент кэшируется в процессе).

В markdown есть выноски:

```markdown
:::tip Совет
Текст подсказки
:::
```

## Тесты

```bash
# API
cd backend && ../.venv/bin/python -m pytest -q

# фронтенд (нужен запущенный Flask — из него берутся фикстуры)
cd frontend && npm run smoke
```

## Темы и свои палитры

Встроенные темы описаны дважды: как CSS-переменные в `frontend/src/styles/tokens.css`
и как JS-палитры в `frontend/src/themes.js` (для превью и клонирования).
Своя тема хранится в `localStorage` как набор значений `--переменных` — она не требует сборки
и не ломает встроенные.

Далее по плану: симулятор терминала, визуальный резолвер конфликтов, модули 2–5 целиком —
см. `docs/PLAN.md`.

## Лицензия

MIT — см. [LICENSE](LICENSE).
