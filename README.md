<p align="center">
  <img src="docs/banners/banner-en.svg" alt="learn-git — Git without the fear" width="100%">
</p>

<h1 align="center">learn-git 🚀</h1>

<p align="center">
  <b>An interactive Git course for absolute beginners.</b><br>
  Plain-language theory, hands-on practice, 10 themes and two languages — fully offline, no CDN.
</p>

<p align="center">
  <a href="README.ru.md"><img src="docs/badges/lang-ru.svg" alt="Русская версия" height="26"></a>
  <img src="docs/badges/badge-flask.svg" alt="Flask 3.1" height="26">
  <img src="docs/badges/badge-react.svg" alt="React 18" height="26">
  <img src="docs/badges/badge-vite.svg" alt="Vite 6" height="26">
  <img src="docs/badges/badge-python.svg" alt="Python 3.11" height="26">
  <img src="docs/badges/badge-offline.svg" alt="No CDN" height="26">
  <img src="docs/badges/badge-mit.svg" alt="MIT" height="26">
</p>

<p align="center">
  <img src="docs/screenshots/en-home.png" alt="learn-git home page in English (Catppuccin Mocha theme)" width="100%">
</p>

---

## 🌍 Language selector

| Language | File |
|---|---|
| 🇬🇧 **English** | **you are here** |
| 🇷🇺 **Русский** | **[README.ru.md](README.ru.md)** |

> The app itself speaks **both languages**: the UI picks your browser language on the first visit,
> and you can switch anytime with the 🌐 button in the header or in ⚙️ Settings.

---

## ✨ What it is

A little course site that answers the questions every beginner stumbles over:

- 😵 **“Is Git the same as GitHub?”** — a whole lesson on this mix-up alone.
- 🧺 **“What is the staging area?”** — explained as a basket before shipping a parcel.
- 🌿 **“What is a branch?”** and how to read `git merge` output without panic.
- 💥 **“A merge conflict?!”** — built step by step, then resolved calmly.
- 🔐 **“.env in a repository?”** — `.gitignore`, `stash`, `reset` vs `revert`.
- 🤝 **SSH keys, Pull Requests, forks, code review.**

## 🧩 Features

| | |
|---|---|
| 🎨 **10 themes + your own** | Gruvbox Dark is the default. Catppuccin (Mocha / Macchiato / Frappé / Latte), Ayu (Dark / Mirage / Light), Gruvbox Light, Minimal Dark — plus a built-in editor that lets you build a custom palette from 20 colors and save it in your browser. |
| 🌐 **Two languages** | Russian and English, auto-detected from the browser, switchable in the header and in Settings. Lessons are written twice, not machine-translated. |
| 📈 **Progress that sticks** | Completed lessons, XP and a day streak in `localStorage`, with JSON export/import so a browser cleanup doesn't hurt. |
| 🎉 **Delightful effects** | Confetti, toasts and micro-animations that respect `prefers-reduced-motion` and can be turned off. |
| 📱 **Mobile first** | Drawer navigation, sticky lesson bar, 44px touch targets, safe-area padding for iOS. |
| 📴 **Works offline** | Inter, JetBrains Mono, Noto Color Emoji, `highlight.js` and `canvas-confetti` are installed from npm and bundled — zero requests to a CDN at runtime. |
| 🧪 **Tested** | 10 pytest API tests + 28 frontend checks in jsdom (no Chromium needed). |

## 🖼️ Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/en-home.png" alt="Home page"><br><sub><b>Home</b> — course outline and progress</sub></td>
    <td width="50%"><img src="docs/screenshots/en-lesson.png" alt="Lesson page"><br><sub><b>Lesson</b> — theory, highlighted code, callouts</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/en-settings.png" alt="Settings panel"><br><sub><b>Settings</b> — 10 themes, language, text size, effects</sub></td>
    <td width="50%"><img src="docs/screenshots/en-cheatsheet.png" alt="Cheatsheet"><br><sub><b>Cheatsheet</b> — every command, click to copy</sub></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/ru-mobile.png" alt="Mobile layout" width="30%">
  &nbsp;
  <img src="docs/screenshots/ru-mobile-lesson.png" alt="Mobile lesson view" width="30%">
</p>

## 📚 Course outline

| | Module | What's inside |
|---|---|---|
| 📚 | **1. Basics** | Git vs GitHub, `git init`, `git clone`, `git status`, first-time `git config` |
| 🛠️ | **2. Daily routine** | The staging area, `git add`, `git commit`, meaningful messages, `push` / `pull` |
| 🌿 | **3. Branching and merging** | Why branches exist, `git branch`, `switch`, `merge`, and a real merge conflict |
| 🚀 | **4. Advanced (but essential)** | `.gitignore` for secrets, `git stash`, `reset --soft/--mixed/--hard`, `revert` |
| 🤝 | **5. GitHub and teamwork** | SSH keys, forks, Pull Requests, code review |

Module 1 is fully written in both languages; the rest are scaffolded and land next
(see [`docs/PLAN.md`](docs/PLAN.md) for the roadmap).

## 🚀 Quick start

```bash
./scripts/start.sh
```

The script creates `.venv`, installs dependencies, builds the frontend and serves everything
at **http://localhost:13444** (`0.0.0.0`).

Manual route:

```bash
# backend
python3 -m venv .venv
./.venv/bin/pip install -r backend/requirements.txt

# frontend
cd frontend && npm install && npm run build && cd ..

# run (0.0.0.0:13444)
./.venv/bin/python backend/run.py
```

Development with hot reload:

```bash
./scripts/start.sh --dev   # Vite on 0.0.0.0:5173 proxies /api to Flask on 13444
```

## 🏗️ How it's built

```
backend/
  app/content.py        # YAML + Markdown → JSON, localization, :::note callouts
  app/routes/api.py     # /api/health, /api/course, /api/lessons/…, /api/cheatsheet
  app/routes/web.py     # serves the built SPA + a “build the frontend” hint
  run.py                # 0.0.0.0:13444
content/
  course.yaml           # modules, lessons, cheatsheet
  modules/01-basics/    # lesson.md (ru) + lesson.en.md (en)
frontend/src/
  styles/tokens.css     # every theme as CSS variables
  settings.jsx          # theme, language, effects, text size
  i18n/{ru,en}.js       # UI dictionaries
  progress.jsx          # localStorage progress
  pages/                # Home, Lesson, Cheatsheet, Sandbox
scripts/
  start.sh              # build + run in one command
  smoke-router.mjs      # 28 frontend checks in jsdom
  make_banner.py        # generates SVG banners (docs/banners) and badges (docs/badges)
docs/
  PLAN.md  banners/  screenshots/
```

One port, one origin: Flask serves the JSON API **and** the built React app, so `/api` never
needs CORS and the preview works through a single tunnel.

## 🎨 Adding a lesson

1. Create `content/modules/<module>/<slug>.md` (plus `<slug>.en.md` for English).
2. Add it to `content/course.yaml`, optionally with `steps` (`theory`, `quiz`, `checklist`, `terminal`).
3. Restart Flask — content is cached in-process.

Callouts in Markdown:

```markdown
:::tip A handy tip
Text of the tip
:::
```

## 🧪 Tests

```bash
# API
cd backend && ../.venv/bin/python -m pytest -q

# frontend (needs Flask running — it dumps API fixtures first)
cd frontend && npm run smoke
```

## 🖌️ Regenerating the banner

The banner is pure SVG, drawn by code — text is converted to outlines so it renders identically
everywhere and needs no fonts:

```bash
./.venv/bin/pip install fonttools brotli
./.venv/bin/python scripts/make_banner.py
```

The same script draws the local badges in `docs/badges` — no shields.io, no external images.

## 📄 License

MIT — see [LICENSE](LICENSE).

<p align="center">
  <sub>Made with ♥ for everyone who is still afraid of the terminal.</sub><br>
  <sub>🇷🇺 <a href="README.ru.md">Читать по-русски</a></sub>
</p>
