"""Раздача собранного React-приложения и SPA-fallback."""

from __future__ import annotations

from pathlib import Path

from flask import Blueprint, current_app, send_from_directory

web = Blueprint("web", __name__)


def _dist() -> Path:
    return Path(current_app.config["FRONTEND_DIST"])


@web.get("/")
def index():
    dist = _dist()
    index_file = dist / "index.html"
    if not index_file.exists():
        return _build_hint(dist), 503
    return send_from_directory(dist, "index.html")


@web.get("/<path:filename>")
def assets(filename: str):
    dist = _dist()
    candidate = dist / filename
    if candidate.is_file():
        return send_from_directory(dist, filename)
    # SPA-роуты: /module/01-basics, /lesson/01-basics/what-is-git и т.д.
    if "." not in Path(filename).name:
        if (dist / "index.html").exists():
            return send_from_directory(dist, "index.html")
        return _build_hint(dist), 503
    return _build_hint(dist), 404


def _build_hint(dist: Path) -> str:
    return f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>learn-git — нужно собрать фронтенд</title>
<style>
  body {{ font: 16px/1.6 ui-monospace, monospace; background:#1d2021; color:#ebdbb2; padding:48px; }}
  code {{ background:#282828; padding:2px 6px; border-radius:4px; color:#fabd2f; }}
  h1 {{ color:#b8bb26; }}
  a {{ color:#83a598; }}
</style></head>
<body>
  <h1>learn-git: фронтенд ещё не собран</h1>
  <p>Flask запущен и API работает, но папки <code>{dist}</code> пока нет.</p>
  <p>Собери React-приложение:</p>
  <pre><code>cd frontend && npm install && npm run build</code></pre>
  <p>Или запусти всё одной командой из корня репозитория: <code>./scripts/start.sh</code></p>
  <p>Для разработки с горячей перезагрузкой: <code>cd frontend && npm run dev</code> — Vite проксирует <code>/api</code> в Flask.</p>
  <p>Проверка API: <a href="/api/health">/api/health</a></p>
</body></html>"""
