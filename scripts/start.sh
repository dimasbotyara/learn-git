#!/usr/bin/env bash
# Запуск learn-git одной командой: Flask на 0.0.0.0:13444 + собранный React.
# Использование: ./scripts/start.sh [--dev]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-13444}"
PYTHON="${PYTHON:-python3}"

# 1. Python-окружение
if [ ! -d .venv ]; then
  echo "→ создаю виртуальное окружение .venv"
  "$PYTHON" -m venv .venv
fi
./.venv/bin/pip install -q -r backend/requirements.txt

# 2. Фронтенд
if [ ! -d frontend/node_modules ]; then
  echo "→ ставлю npm-зависимости (один раз)"
  (cd frontend && npm install --no-fund --no-audit)
fi

if [ "${1:-}" = "--dev" ]; then
  echo "→ dev-режим: Vite на 0.0.0.0:5173, Flask на $HOST:$PORT"
  (cd backend && "../.venv/bin/python" run.py --host "$HOST" --port "$PORT" --debug) &
  FLASK_PID=$!
  trap 'kill $FLASK_PID 2>/dev/null || true' EXIT
  (cd frontend && npm run dev)
  exit 0
fi

if [ ! -f frontend/dist/index.html ]; then
  echo "→ собираю фронтенд (vite build)"
  (cd frontend && npm run build)
fi

echo "→ http://localhost:$PORT"
exec ./.venv/bin/python backend/run.py --host "$HOST" --port "$PORT"
