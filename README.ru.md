<p align="center">
  <img src="docs/banners/banner-ru.svg" alt="learn-git — Git без страха" width="100%">
</p>

<h1 align="center">learn-git 🚀</h1>

<p align="center">
  <b>Интерактивный курс по Git для настоящих новичков.</b><br>
  Простая теория, 11 уроков, тренажёр-терминал, квизы и 10 тем — два языка, всё офлайн, без CDN.
</p>

<p align="center">
  <a href="README.md"><img src="docs/badges/lang-en.svg" alt="English version" height="26"></a>
  <img src="docs/badges/badge-flask.svg" alt="Flask 3.1" height="26">
  <img src="docs/badges/badge-react.svg" alt="React 18" height="26">
  <img src="docs/badges/badge-vite.svg" alt="Vite 6" height="26">
  <img src="docs/badges/badge-python.svg" alt="Python 3.11" height="26">
  <img src="docs/badges/badge-offline.svg" alt="No CDN" height="26">
  <img src="docs/badges/badge-mit.svg" alt="MIT" height="26">
</p>

<p align="center">
  <img src="docs/screenshots/ru-home.png" alt="Главная страница learn-git (тема Gruvbox Dark)" width="100%">
</p>

---

## 🌍 Выбор языка

| Язык | Файл |
|---|---|
| 🇷🇺 **Русский** | **вы здесь** |
| 🇬🇧 **English** | **[README.md](README.md)** |

> Сам сайт говорит **на двух языках**: интерфейс сам подхватывает язык браузера при первом входе,
> а переключить можно в любой момент кнопкой 🌐 в хедере или в ⚙️ настройках.

---

## ✨ Что это

Небольшой сайт-курс, который отвечает на вопросы, обо которые спотыкается каждый новичок:

- 😵 **«Git и GitHub — это одно и то же?»** — на эту путаницу выделен отдельный урок.
- 🧺 **«Что такое staging area?»** — объясняем через корзину перед отправкой посылки.
- 🌿 **«Зачем ветки?»** и как читать вывод `git merge`, не паникуя.
- 💥 **«Merge conflict?!»** — сначала создаём его руками, потом спокойно решаем.
- 🔐 **«.env в репозитории?»** — `.gitignore`, `stash`, `reset` против `revert`.
- 🤝 **SSH-ключи, Pull Request, форки, code review.**

## 🧩 Возможности

| | |
|---|---|
| 🎨 **10 тем + своя** | По умолчанию Gruvbox Dark. Ещё Catppuccin (Mocha / Macchiato / Frappé / Latte), Ayu (Dark / Mirage / Light), Gruvbox Light, Minimal Dark — и встроенный редактор, где из 20 цветов собирается собственная палитра. |
| 🌐 **Два языка** | Русский и английский, автоопределение по браузеру, переключатель в хедере и в настройках. Уроки написаны дважды, а не прогнаны через переводчик. |
| 📈 **Прогресс не теряется** | Пройденные уроки, XP и серия дней в `localStorage`, плюс экспорт/импорт JSON — чтобы чистка браузера не стёрла старания. |
| 🎉 **Приятные эффекты** | Конфетти, тосты и микроанимации. Уважают `prefers-reduced-motion` и отключаются одной кнопкой. |
| 📱 **Сначала мобильные** | Drawer-навигация, липкая панель урока, тач-таргеты 44px, safe-area для iOS. |
| 📴 **Работает офлайн** | Inter, JetBrains Mono, Noto Color Emoji, `highlight.js` и `canvas-confetti` ставятся из npm и попадают в сборку — в рантайме ноль запросов к CDN. |
| 🖥️ **Терминал-тренажёр** | Настоящий фейковый git прямо в уроке: `init`, `add`, `commit`, `branch`, `merge` с конфликтами, `stash`, `reset`, `revert`, `push`. Вывод как у настоящего, рабочую папку можно смело ломать — кнопка «Сбросить» вернёт всё в один клик. |
| ✅ **Задания с проверкой** | В каждом уроке — квиз с разбором, чек-лист и практика: тренажёр сам проверяет состояние репозитория и зажигает «решено», когда всё сделано. |
| 🧪 **С тестами** | 12 pytest-тестов API + 39 проверок фронтенда в jsdom (Chromium не нужен). |

## 🖼️ Скриншоты

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/ru-home.png" alt="Главная страница"><br><sub><b>Главная</b> — программа курса и прогресс</sub></td>
    <td width="50%"><img src="docs/screenshots/ru-lesson.png" alt="Страница урока"><br><sub><b>Урок</b> — теория, подсветка кода, выноски</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/ru-terminal.png" alt="Терминал-тренажёр"><br><sub><b>Тренажёр</b> — вводишь git-команды, видишь настоящий вывод</sub></td>
    <td width="50%"><img src="docs/screenshots/ru-quiz.png" alt="Квиз и чек-лист"><br><sub><b>Практика</b> — квиз с разбором и чек-лист</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/ru-conflict.png" alt="Разрешение merge-конфликта в тренажёре"><br><sub><b>Конфликт</b> — создаём руками и решаем</sub></td>
    <td width="50%"><img src="docs/screenshots/ru-settings.png" alt="Настройки"><br><sub><b>Настройки</b> — темы, язык, размер текста, эффекты</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/ru-cheatsheet.png" alt="Шпаргалка"><br><sub><b>Шпаргалка</b> — все команды, клик копирует</sub></td>
    <td width="50%"><img src="docs/screenshots/ru-course.png" alt="Модули курса"><br><sub><b>Модули</b> — 5 штук, от базы до GitHub</sub></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/ru-mobile.png" alt="Мобильная вёрстка" width="30%">
  &nbsp;
  <img src="docs/screenshots/ru-mobile-lesson.png" alt="Урок на телефоне" width="30%">
  <img src="docs/screenshots/ru-mobile-terminal.png" alt="Тренажёр на телефоне" width="30%">
</p>

## 📚 Программа курса

| | Модуль | Уроки |
|---|---|---|
| 📚 | **1. База** | 1. Что такое Git и чем он отличается от GitHub · 2. Первый репозиторий: `init` и `clone` · 3. `git status` и первичный `config` |
| 🛠️ | **2. Ежедневная рутина** | 4. `git add` и `git commit` · 5. `git push` и `git pull` |
| 🌿 | **3. Ветки и слияние** | 6. Ветки: `branch` и `switch` · 7. Слияние и настоящий merge conflict |
| 🚀 | **4. Продвинутые, но нужные фишки** | 8. `.gitignore` для паролей · 9. `stash`, `reset` и `revert` |
| 🤝 | **5. GitHub и команда** | 10. SSH-ключи · 11. Pull Request и code review |

В каждом уроке — теория, а дальше по вкусу: квиз с разбором, чек-лист привычек
и практика в терминале (12 заданий на курс, от `git init` до `push` ветки с PR).

**Все 11 уроков написаны на двух языках** — это 5 модулей, ~134 минуты чтения,
28 команд в шпаргалке и 12 заданий в тренажёре. Что сделано и что дальше — в
[`docs/PLAN.md`](docs/PLAN.md).

### 🖥️ Терминал-тренажёр

Внутри урока есть окно, куда можно вводить настоящие git-команды. Под ним —
`help`, который показывает список команд и, **только в части уроков**, маленькие
подсказки под конкретное задание. Если подсказок для урока нет, `help` честно
об этом скажет и оставит общий список.

Задание проверяется по состоянию виртуального репозитория: «есть хотя бы один
коммит», «файл `notes.txt` в истории», «конфликтов не осталось», «`push` дошёл
до `origin`». Поэтому решать можно по-своему — тренажёру важен результат, а не
дословная команда. Кнопка «Сбросить» откатывает всё к началу задания.

## 🚀 Быстрый старт

```bash
./scripts/start.sh
```

Скрипт создаст `.venv`, поставит зависимости, соберёт фронтенд и поднимет всё
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
./scripts/start.sh --dev   # Vite на 0.0.0.0:5173 проксирует /api в Flask на 13444
```

## 🏗️ Как устроено

```
backend/
  app/content.py        # YAML + Markdown → JSON, локализация, выноски :::note
  app/routes/api.py     # /api/health, /api/course, /api/lessons/…, /api/cheatsheet
  app/routes/web.py     # отдаёт собранный SPA + подсказку «собери фронтенд»
  run.py                # 0.0.0.0:13444
content/
  course.yaml           # модули, уроки, шпаргалка
  modules/01-basics/    # lesson.md (ru) + lesson.en.md (en)
frontend/src/
  styles/tokens.css     # все темы как CSS-переменные
  settings.jsx          # тема, язык, эффекты, размер текста
  i18n/{ru,en}.js       # словари интерфейса
  progress.jsx          # прогресс в localStorage
  pages/                # Home, Lesson, Cheatsheet, Sandbox
  sim/git.js            # виртуальный git: state, команды, конфликты
  sim/checks.js         # проверки заданий из course.yaml
  sim/Terminal.jsx      # окно тренажёра
scripts/
  start.sh              # сборка + запуск одной командой
  smoke-router.mjs      # 28 проверок фронтенда в jsdom
  make_banner.py        # генерирует SVG-баннеры (docs/banners) и бейджи (docs/badges)
docs/
  PLAN.md  banners/  screenshots/
```

Один порт, один origin: Flask отдаёт и JSON API, и собранное React-приложение,
поэтому `/api` не нужен CORS, а превью работает через один туннель.

## 🎨 Как добавить урок

1. Создай `content/modules/<модуль>/<slug>.md` (и `<slug>.en.md` для английского).
2. Добавь урок в `content/course.yaml` — можно с `steps` (`theory`, `quiz`, `checklist`, `terminal`).
3. Перезапусти Flask: контент кэшируется в процессе.

Выноски в Markdown:

```markdown
:::tip Полезный совет
Текст подсказки
:::
```

## 🧪 Тесты

```bash
# API
cd backend && ../.venv/bin/python -m pytest -q

# фронтенд (нужен запущенный Flask — из него берутся фикстуры)
cd frontend && npm run smoke

# все задания тренажёра из course.yaml: решаются — и не решаются «ничем»
cd frontend && npm run check:tasks
```

## 🖌️ Пересобрать баннер

Баннер — чистый SVG, нарисованный кодом: текст переведён в кривые, поэтому он одинаково
выглядит везде и не зависит от шрифтов:

```bash
./.venv/bin/pip install fonttools brotli
./.venv/bin/python scripts/make_banner.py
```

Этот же скрипт рисует локальные бейджи в `docs/badges` — никакого shields.io и внешних картинок.

## 📄 Лицензия

MIT — см. [LICENSE](LICENSE).

<p align="center">
  <sub>Сделано с ♥ для всех, кто пока боится терминала.</sub><br>
  <sub>🇬🇧 <a href="README.md">Read in English</a></sub>
</p>
