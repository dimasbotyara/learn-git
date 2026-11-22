"""Загрузка курса из YAML + Markdown и отдача его в виде JSON-структур."""

from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from markdown_it import MarkdownIt

CONTAINER_RE = re.compile(r"^:::(note|tip|warning|danger)(?:\s+(.+?))?\s*$")
CONTAINER_END = re.compile(r"^:::\s*$")
CALLOUT_TITLES = {
    "note": "Note",
    "tip": "Tip",
    "warning": "Warning",
    "danger": "Danger",
}


class ContentError(RuntimeError):
    """Ошибка в структуре контента — лучше упасть громко, чем отдать пустой урок."""


def _md() -> MarkdownIt:
    md = MarkdownIt("commonmark", {"html": False, "linkify": False, "typographer": True})
    md.enable(["table", "strikethrough"])
    return md


_H1_RE = re.compile(r"^\s*#\s+.+?(?:\n\s*\n|\n|$)", re.M)


def strip_leading_h1(text: str) -> str:
    """Убирает первый заголовок H1: заголовок урока рендерит страница."""
    match = _H1_RE.match(text.lstrip("\ufeff\n "))
    if not match:
        return text
    return text.lstrip("\ufeff\n ")[match.end():].lstrip("\n")


def render_markdown(text: str, *, md: MarkdownIt | None = None, strip_h1: bool = False) -> str:
    """Markdown + поддержка контейнеров :::note / :::tip / :::warning."""
    if strip_h1:
        text = strip_leading_h1(text)
    md = md or _md()
    lines = text.splitlines()
    out: list[str] = []
    buffer: list[str] = []
    i = 0

    def flush() -> None:
        if buffer:
            out.append(md.render("\n".join(buffer)))
            buffer.clear()

    while i < len(lines):
        line = lines[i]
        match = CONTAINER_RE.match(line)
        if match:
            kind, title = match.group(1), (match.group(2) or CALLOUT_TITLES[match.group(1)])
            inner: list[str] = []
            i += 1
            while i < len(lines) and not CONTAINER_END.match(lines[i]):
                inner.append(lines[i])
                i += 1
            flush()
            inner_html = md.render("\n".join(inner))
            out.append(
                f'<div class="callout callout--{kind}">'
                f'<div class="callout__label">{_escape(title)}</div>'
                f'<div class="callout__body">{inner_html}</div>'
                f"</div>"
            )
            i += 1
            continue
        buffer.append(line)
        i += 1

    flush()
    return "\n".join(out)


def _escape(value: str) -> str:
    return (
        value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    )


class Course:
    """План курса и локализованные тексты уроков."""

    def __init__(self, content_dir: Path) -> None:
        self.dir = Path(content_dir)
        self.data = self._load_yaml()
        self.default_locale: str = self.data.get("default_locale", "ru")
        self.locales: list[str] = list(self.data.get("locales", ["ru"]))
        self._validate()
        self._order = self._flatten()

    # --- загрузка ---------------------------------------------------------

    def _load_yaml(self) -> dict[str, Any]:
        path = self.dir / "course.yaml"
        if not path.exists():
            raise ContentError(f"Не найден {path}")
        with path.open(encoding="utf-8") as fh:
            data = yaml.safe_load(fh) or {}
        if not isinstance(data, dict):
            raise ContentError("course.yaml должен содержать словарь на верхнем уровне")
        return data

    def lesson_available(self, module_slug: str, lesson: dict) -> bool:
        """Урок есть в программе, но текст может быть ещё не написан."""
        return self._lesson_file(module_slug, lesson, self.default_locale).exists()

    def _validate(self) -> None:
        modules = self.data.get("modules") or []
        missing: list[str] = []
        if not modules:
            raise ContentError("В course.yaml нет модулей")
        seen_modules: set[str] = set()
        for module in modules:
            slug = module.get("slug")
            if not slug:
                raise ContentError("У модуля нет slug")
            if slug in seen_modules:
                raise ContentError(f"Дублирующийся модуль: {slug}")
            seen_modules.add(slug)
            if not module.get("lessons"):
                raise ContentError(f"Модуль {slug} без уроков")
            for lesson in module["lessons"]:
                if not lesson.get("slug"):
                    raise ContentError(f"В модуле {slug} у урока нет slug")
                if not self.lesson_available(module["slug"], lesson):
                    missing.append(f"{module['slug']}/{lesson['slug']}")
        self.missing_lessons = missing

    def _flatten(self) -> list[dict[str, str]]:
        items: list[dict[str, str]] = []
        for module in self.data["modules"]:
            for lesson in module["lessons"]:
                items.append({"module": module["slug"], "lesson": lesson["slug"]})
        return items

    # --- хелперы ----------------------------------------------------------

    def has_locale(self, locale: str | None) -> bool:
        return bool(locale) and locale in self.locales

    def resolve_locale(self, locale: str | None) -> str:
        return locale if self.has_locale(locale) else self.default_locale

    def localize(self, value: Any, locale: str) -> Any:
        """Достаёт строку нужной локали из {"ru": ..., "en": ...}."""
        if isinstance(value, dict) and ("ru" in value or "en" in value):
            return value.get(locale) or value.get(self.default_locale) or ""
        if isinstance(value, list):
            return [self.localize(item, locale) for item in value]
        return value

    def _lesson_file(self, module_slug: str, lesson: dict, locale: str) -> Path:
        folder = self.dir / "modules" / module_slug
        base = lesson.get("slug")
        if locale == self.default_locale:
            return folder / f"{base}.md"
        return folder / f"{base}.{locale}.md"

    def _step_markdown(self, module_slug: str, lesson: dict, step: dict, locale: str) -> str:
        filename = step.get("file") or f"{lesson['slug']}.md"
        path = self.dir / "modules" / module_slug / filename
        if locale != self.default_locale:
            localized = path.with_name(f"{path.stem}.{locale}{path.suffix}")
            if localized.exists():
                path = localized
        if not path.exists():
            raise ContentError(f"Нет файла шага: {path}")
        return path.read_text(encoding="utf-8")

    # --- публичные структуры ---------------------------------------------

    def modules(self, locale: str) -> list[dict[str, Any]]:
        locale = self.resolve_locale(locale)
        result = []
        for module in self.data["modules"]:
            result.append(
                {
                    "slug": module["slug"],
                    "icon": module.get("icon", "📘"),
                    "accent": module.get("accent", "blue"),
                    "title": self.localize(module.get("title"), locale),
                    "subtitle": self.localize(module.get("subtitle"), locale),
                    "description": self.localize(module.get("description"), locale),
                    "lessons": [
                        {
                            "slug": lesson["slug"],
                            "title": self.localize(lesson.get("title"), locale),
                            "summary": self.localize(lesson.get("summary"), locale),
                            "minutes": lesson.get("minutes", 5),
                            "steps": len(self._steps_meta(lesson)),
                            "available": self.lesson_available(module["slug"], lesson),
                        }
                        for lesson in module["lessons"]
                    ],
                }
            )
        return result

    def _steps_meta(self, lesson: dict) -> list[dict]:
        steps = lesson.get("steps")
        if steps:
            return steps
        return [{"type": "theory"}]

    def lesson(self, module_slug: str, lesson_slug: str, locale: str) -> dict[str, Any] | None:
        locale = self.resolve_locale(locale)
        module = next((m for m in self.data["modules"] if m["slug"] == module_slug), None)
        if module is None:
            return None
        lesson = next((l for l in module["lessons"] if l["slug"] == lesson_slug), None)
        if lesson is None:
            return None
        if not self.lesson_available(module_slug, lesson):
            return {
                "module": {
                    "slug": module["slug"],
                    "icon": module.get("icon", "📘"),
                    "title": self.localize(module.get("title"), locale),
                },
                "slug": lesson["slug"],
                "title": self.localize(lesson.get("title"), locale),
                "summary": self.localize(lesson.get("summary"), locale),
                "minutes": lesson.get("minutes", 5),
                "steps": [],
                "soon": True,
                "prev": None,
                "next": None,
            }

        steps: list[dict[str, Any]] = []
        for index, step in enumerate(self._steps_meta(lesson)):
            kind = step.get("type", "theory")
            item: dict[str, Any] = {"type": kind, "index": index}
            if kind == "theory":
                item["html"] = render_markdown(
                    self._step_markdown(module_slug, lesson, step, locale), strip_h1=True
                )
            elif kind == "quiz":
                item.update(
                    {
                        "id": step.get("id"),
                        "question": self.localize(step.get("question"), locale),
                        "options": [
                            {
                                "id": option["id"],
                                "text": self.localize(option.get("text"), locale),
                                "correct": bool(option.get("correct")),
                                "explain": self.localize(option.get("explain", ""), locale),
                            }
                            for option in step.get("options", [])
                        ],
                    }
                )
            elif kind == "checklist":
                item.update(
                    {
                        "id": step.get("id"),
                        "title": self.localize(step.get("title"), locale),
                        "items": self.localize(step.get("items", []), locale),
                    }
                )
            elif kind == "terminal":
                item.update(
                    {
                        "id": step.get("id"),
                        "title": self.localize(step.get("title", ""), locale),
                        "task": self.localize(step.get("task", ""), locale),
                        "check": step.get("check", {}),
                    }
                )
            steps.append(item)

        position = self._position(module_slug, lesson_slug)
        prev_item = self._order[position - 1] if position > 0 else None
        next_item = self._order[position + 1] if position + 1 < len(self._order) else None

        return {
            "module": {
                "slug": module["slug"],
                "icon": module.get("icon", "📘"),
                "title": self.localize(module.get("title"), locale),
            },
            "slug": lesson["slug"],
            "title": self.localize(lesson.get("title"), locale),
            "summary": self.localize(lesson.get("summary"), locale),
            "minutes": lesson.get("minutes", 5),
            "steps": steps,
            "prev": prev_item,
            "next": next_item,
        }

    def _position(self, module_slug: str, lesson_slug: str) -> int:
        for index, item in enumerate(self._order):
            if item["module"] == module_slug and item["lesson"] == lesson_slug:
                return index
        return 0

    def nav(self, locale: str) -> dict[str, Any]:
        locale = self.resolve_locale(locale)
        items = []
        for item in self._order:
            module = next(m for m in self.data["modules"] if m["slug"] == item["module"])
            lesson = next(l for l in module["lessons"] if l["slug"] == item["lesson"])
            items.append(
                {
                    "module": item["module"],
                    "lesson": item["lesson"],
                    "title": self.localize(lesson.get("title"), locale),
                    "moduleTitle": self.localize(module.get("title"), locale),
                    "moduleIcon": module.get("icon", "📘"),
                    "available": self.lesson_available(module["slug"], lesson),
                }
            )
        return {"items": items}

    def cheatsheet(self, locale: str) -> list[dict[str, Any]]:
        locale = self.resolve_locale(locale)
        groups = []
        for group in self.data.get("cheatsheet", []):
            groups.append(
                {
                    "title": self.localize(group.get("group"), locale),
                    "commands": [
                        {
                            "cmd": command.get("cmd", ""),
                            "desc": self.localize(command.get("desc"), locale),
                        }
                        for command in group.get("commands", [])
                    ],
                }
            )
        return groups


@lru_cache(maxsize=4)
def _cached_course(path: str) -> Course:
    return Course(Path(path))


def get_course(content_dir: str | Path) -> Course:
    return _cached_course(str(Path(content_dir).resolve()))
