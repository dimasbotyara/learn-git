"""Тесты API: маршруты, локализация, рендер Markdown."""

from __future__ import annotations

import pytest

from app import create_app
from app.content import render_markdown


@pytest.fixture()
def client():
    app = create_app({"TESTING": True})
    return app.test_client()


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_meta(client):
    response = client.get("/api/meta")
    payload = response.get_json()
    assert payload["defaultLocale"] == "ru"
    assert payload["locales"] == ["ru", "en"]


def test_course_tree_localized(client):
    ru = client.get("/api/course?lang=ru").get_json()
    en = client.get("/api/course?lang=en").get_json()
    assert ru["modules"][0]["title"] == "База"
    assert en["modules"][0]["title"] == "Basics"
    assert ru["modules"][0]["lessons"][0]["slug"] == "what-is-git"


def test_unknown_locale_falls_back(client):
    payload = client.get("/api/course?lang=de").get_json()
    assert payload["locale"] == "ru"


def test_lesson_has_steps_and_nav(client):
    payload = client.get("/api/lessons/01-basics/status-and-config").get_json()
    types = [step["type"] for step in payload["steps"]]
    assert types == ["theory", "quiz", "checklist"]
    assert "Untracked" in payload["steps"][1]["options"][0]["text"]
    assert payload["next"]["lesson"] == "add-and-commit"


def test_lesson_english(client):
    payload = client.get("/api/lessons/01-basics/status-and-config?lang=en").get_json()
    assert "git status" in payload["steps"][0]["html"]
    assert payload["steps"][2]["title"].startswith("Set yourself up")


def test_lesson_404(client):
    response = client.get("/api/lessons/01-basics/nope")
    assert response.status_code == 404
    assert response.get_json()["error"] == "lesson_not_found"


def test_cheatsheet(client):
    payload = client.get("/api/cheatsheet?lang=en").get_json()
    assert payload["groups"][0]["title"] == "Every day"
    assert any(c["cmd"] == "git status" for c in payload["groups"][0]["commands"])


def test_spa_fallback(client):
    response = client.get("/lesson/01-basics/what-is-git")
    assert response.status_code in (200, 503)


def test_render_markdown_callout():
    html = render_markdown(":::tip Совет\nПривет\n:::")
    assert 'callout--tip' in html and "Совет" in html and "<p>Привет</p>" in html
