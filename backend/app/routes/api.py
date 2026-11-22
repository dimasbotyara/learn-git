"""REST API курса. Фронтенд — SPA, поэтому здесь только JSON."""

from __future__ import annotations

from flask import Blueprint, current_app, jsonify, request

from ..content import get_course

api = Blueprint("api", __name__, url_prefix="/api")


def _course():
    return get_course(current_app.config["CONTENT_DIR"])


def _locale() -> str:
    return _course().resolve_locale(request.args.get("lang"))


@api.get("/health")
def health():
    return jsonify({"status": "ok", "service": "learn-git"})


@api.get("/meta")
def meta():
    course = _course()
    return jsonify(
        {
            "slug": course.data.get("slug", "learn-git"),
            "version": course.data.get("version", 1),
            "defaultLocale": course.default_locale,
            "locales": course.locales,
        }
    )


@api.get("/course")
def course_tree():
    course = _course()
    locale = _locale()
    return jsonify({"locale": locale, "modules": course.modules(locale)})


@api.get("/nav")
def nav():
    course = _course()
    locale = _locale()
    return jsonify({"locale": locale, **course.nav(locale)})


@api.get("/cheatsheet")
def cheatsheet():
    course = _course()
    locale = _locale()
    return jsonify({"locale": locale, "groups": course.cheatsheet(locale)})


@api.get("/lessons/<module_slug>/<lesson_slug>")
def lesson(module_slug: str, lesson_slug: str):
    course = _course()
    locale = _locale()
    payload = course.lesson(module_slug, lesson_slug, locale)
    if payload is None:
        return jsonify({"error": "lesson_not_found", "module": module_slug, "lesson": lesson_slug}), 404
    return jsonify({"locale": locale, **payload})
