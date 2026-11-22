"""learn-git — Flask-бэкенд: JSON API + раздача React SPA."""

from __future__ import annotations

from pathlib import Path

from flask import Flask

BASE_DIR = Path(__file__).resolve().parents[2]


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config.update(
        CONTENT_DIR=BASE_DIR / "content",
        FRONTEND_DIST=BASE_DIR / "frontend" / "dist",
        JSON_AS_ASCII=False,
        JSON_SORT_KEYS=False,
    )
    app.json.ensure_ascii = False
    if test_config:
        app.config.update(test_config)

    from .routes.api import api

    app.register_blueprint(api)

    @app.after_request
    def no_store_for_api(response):
        if response.content_type and "application/json" in response.content_type:
            # Контент меняется редко, но кэш мешает живой правке уроков.
            response.headers["Cache-Control"] = "no-cache"
        return response

    from .routes.web import web

    app.register_blueprint(web)
    return app
