#!/usr/bin/env python3
"""
Генератор SVG-баннеров для README.

Рисуется целиком из кода: сетка, свечение, логотип, окно терминала,
полоски прогресса и текст, переведённый в кривые (чтобы баннер выглядел
одинаково везде, где нет нужных шрифтов).

Запуск:  ./.venv/bin/python scripts/make_banner.py
Нужно:   pip install -r backend/requirements.txt fonttools brotli
Шрифты:  frontend/node_modules/@fontsource-variable/{inter,jetbrains-mono}
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

from fontTools.merge import Merger
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "frontend" / "node_modules" / "@fontsource-variable"
OUT = ROOT / "docs" / "banners"


# --------------------------------------------------------------------------
# Шрифты → кривые
# --------------------------------------------------------------------------


@dataclass
class Face:
    path: str
    units: int
    ascent: int
    descent: int


class FontRegistry:
    """Склеивает латиницу и кириллицу в один шрифт и отдаёт глифы как SVG-пути."""

    def __init__(self) -> None:
        self._faces: dict[tuple[str, int], Face] = {}
        self._cache: dict[tuple[str, int], TTFont] = {}

    def _build(self, family: str, weight: int) -> TTFont:
        key = (family, weight)
        if key in self._cache:
            return self._cache[key]
        package = "inter" if family == "sans" else "jetbrains-mono"
        merged_inputs: list[str] = []
        for subset in ("latin", "cyrillic"):
            source = FONTS / package / "files" / f"{package}-{subset}-wght-normal.woff2"
            if not source.exists():
                raise FileNotFoundError(f"Нет файла шрифта: {source}")
            stem = package
            font = instantiateVariableFont(TTFont(source), {"wght": weight})
            tmp = Path(f"/tmp/_banner_{stem}_{subset}_{weight}.ttf")
            font.save(tmp)
            merged_inputs.append(str(tmp))
        if not merged_inputs:
            raise FileNotFoundError(f"Не нашёл шрифт {stem} в {FONTS}")
        merged = Merger().merge(merged_inputs) if len(merged_inputs) > 1 else TTFont(merged_inputs[0])
        self._cache[key] = merged
        return merged

    def text_width(self, text: str, family: str, weight: int, size: float, tracking: float = 0) -> float:
        font = self._build(family, weight)
        cmap = font.getBestCmap()
        hmtx = font["hmtx"]
        upm = font["head"].unitsPerEm
        total = 0
        for char in text:
            glyph = cmap.get(ord(char))
            if glyph is None:
                total += upm * 0.25
                continue
            total += hmtx[glyph][0]
        total += tracking * upm * max(0, len(text) - 1)
        return total / upm * size

    def text_to_path(
        self,
        text: str,
        x: float,
        y: float,
        family: str,
        weight: int,
        size: float,
        tracking: float = 0,
    ) -> str:
        """Координаты — baseline, как в SVG-тексте."""
        font = self._build(family, weight)
        glyph_set = font.getGlyphSet()
        cmap = font.getBestCmap()
        upm = font["head"].unitsPerEm
        scale = size / upm
        cursor = 0.0
        parts: list[str] = []
        previous: str | None = None
        for char in text:
            glyph_name = cmap.get(ord(char))
            if glyph_name is None:
                cursor += upm * 0.25
                continue
            if previous is not None:
                cursor += self._kerning(font, previous, glyph_name)
            pen = SVGPathPen(glyph_set)
            glyph_set[glyph_name].draw(pen)
            commands = pen.getCommands()
            if commands:
                parts.append(
                    f'<path transform="translate({x + cursor * scale:.2f} {y:.2f}) scale({scale:.5f} {-scale:.5f})" d="{commands}"/>'
                )
            cursor += font["hmtx"][glyph_name][0] + tracking * upm
            previous = glyph_name
        return "".join(parts)

    @staticmethod
    def _kerning(font: TTFont, left: str, right: str) -> int:
        """Кернинг из горизонтальной таблицы GPOS (если она есть)."""
        try:
            gpos = font["GPOS"].table
        except KeyError:
            return 0
        if not gpos or not gpos.LookupList:
            return 0
        pair = (left, right)
        total = 0
        for lookup in gpos.LookupList.Lookup:
            if lookup.LookupType != 2:
                continue
            subtables = lookup.SubTable
            if not isinstance(subtables, list):
                subtables = [subtables]
            for sub in subtables:
                if getattr(sub, "Format", None) != 1:
                    continue
                coverage = getattr(sub, "Coverage", None)
                if coverage is None or not coverage.glyphs:
                    continue
                if left not in coverage.glyphs:
                    continue
                try:
                    index = coverage.glyphs.index(left)
                    pair_set = sub.PairSet[index]
                except (ValueError, IndexError, AttributeError):
                    continue
                for record in pair_set.PairValueRecord:
                    if record.SecondGlyph == right:
                        total += getattr(getattr(record, "Value1", None), "XAdvance", 0) or 0
        return total


FONT_CACHE = FontRegistry()


# --------------------------------------------------------------------------
# Палитра
# --------------------------------------------------------------------------

PALETTES = {
    "ru": {
        "bg": "#1d2021",
        "bg_soft": "#282828",
        "panel": "#161819",
        "border": "#3c3836",
        "fg": "#ebdbb2",
        "muted": "#bdae93",
        "faint": "#7c6f64",
        "accent": "#fabd2f",
        "green": "#b8bb26",
        "red": "#fb4934",
        "aqua": "#8ec07c",
        "blue": "#83a598",
        "purple": "#d3869b",
    },
    "en": {
        "bg": "#1e1e2e",
        "bg_soft": "#181825",
        "panel": "#11111b",
        "border": "#313244",
        "fg": "#cdd6f4",
        "muted": "#a6adc8",
        "faint": "#6c7086",
        "accent": "#cba6f7",
        "green": "#a6e3a1",
        "red": "#f38ba8",
        "aqua": "#94e2d5",
        "blue": "#89b4fa",
        "purple": "#f5c2e7",
    },
}

TEXT = {
    "ru": {
        "wordmark": ["learn", "-git"],
        "tagline": "Git без страха",
        "h1": ["от первого коммита", "до Pull Request"],
        "terminal": [
            ("$ git status", "cmd"),
            ("On branch main", "out"),
            ("nothing to commit, working tree clean", "dim"),
            ("$ git switch -c feature", "cmd"),
            ("Switched to a new branch 'feature'", "ok"),
        ],
        "chips": ["5 модулей", "7 уроков", "2 языка", "10 тем"],
        "footer": "интерактивный курс · работает офлайн",
    },
    "en": {
        "wordmark": ["learn", "-git"],
        "tagline": "Git without the fear",
        "h1": ["from your first commit", "to your first Pull Request"],
        "terminal": [
            ("$ git status", "cmd"),
            ("On branch main", "out"),
            ("nothing to commit, working tree clean", "dim"),
            ("$ git switch -c feature", "cmd"),
            ("Switched to a new branch 'feature'", "ok"),
        ],
        "chips": ["5 modules", "7 lessons", "2 languages", "10 themes"],
        "footer": "interactive course · works offline",
    },
}

W, H = 1280, 420


def banner(locale: str) -> str:
    p = PALETTES[locale]
    t = TEXT[locale]
    sans, mono = "sans", "mono"

    def path(text: str, x: float, y: float, *, weight=600, size=24, family=sans, tracking=0, fill=None, opacity=None) -> str:
        d = FONT_CACHE.text_to_path(text, x, y, family, weight, size, tracking)
        attrs = f'fill="{fill or p["fg"]}"'
        if opacity:
            attrs += f' opacity="{opacity}"'
        return f'<g {attrs}>{d}</g>'

    def width(text: str, weight=600, size=24, family=sans, tracking=0) -> float:
        return FONT_CACHE.text_width(text, family, weight, size, tracking)

    parts: list[str] = []
    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
        f'role="img" aria-labelledby="title desc">'
    )
    parts.append(f'<title id="title">learn-git — {t["tagline"]}</title>')
    parts.append(
        f'<desc id="desc">{t["footer"]}. Dark terminal-style banner: logo, headline and a git terminal window.</desc>'
    )

    # --- фон ---
    parts.append("<defs>")
    parts.append(
        f'<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{p["bg_soft"]}"/><stop offset="0.55" stop-color="{p["bg"]}"/>'
        f'<stop offset="1" stop-color="{p["bg"]}"/></linearGradient>'
    )
    parts.append(
        f'<radialGradient id="glow" cx="0.12" cy="0" r="0.9">'
        f'<stop offset="0" stop-color="{p["accent"]}" stop-opacity="0.30"/>'
        f'<stop offset="0.55" stop-color="{p["accent"]}" stop-opacity="0.06"/>'
        f'<stop offset="1" stop-color="{p["accent"]}" stop-opacity="0"/></radialGradient>'
    )
    parts.append(
        f'<radialGradient id="glow2" cx="0.95" cy="1" r="0.7">'
        f'<stop offset="0" stop-color="{p["green"]}" stop-opacity="0.18"/>'
        f'<stop offset="1" stop-color="{p["green"]}" stop-opacity="0"/></radialGradient>'
    )
    parts.append(
        f'<linearGradient id="line" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0" stop-color="{p["accent"]}" stop-opacity="0.9"/>'
        f'<stop offset="1" stop-color="{p["accent"]}" stop-opacity="0"/></linearGradient>'
    )
    parts.append(
        f'<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">'
        f'<path d="M32 0H0V32" fill="none" stroke="{p["fg"]}" stroke-opacity="0.045" stroke-width="1"/></pattern>'
    )
    parts.append("</defs>")

    parts.append(f'<rect width="{W}" height="{H}" rx="20" fill="url(#bg)"/>')
    parts.append(f'<rect width="{W}" height="{H}" rx="20" fill="url(#grid)"/>')
    parts.append(f'<rect width="{W}" height="{H}" rx="20" fill="url(#glow)"/>')
    parts.append(f'<rect width="{W}" height="{H}" rx="20" fill="url(#glow2)"/>')
    parts.append(
        f'<rect x="0.5" y="0.5" width="{W - 1}" height="{H - 1}" rx="20" fill="none" '
        f'stroke="{p["border"]}" stroke-width="1"/>'
    )

    # --- логотип: ветка git в скруглённом квадрате ---
    parts.append('<g transform="translate(56 52)">')
    parts.append(
        f'<rect width="60" height="60" rx="16" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="1.5"/>'
    )
    parts.append(
        f'<path d="M21 17v24a6 6 0 0 0 6 6h6" fill="none" stroke="{p["accent"]}" '
        f'stroke-width="3.4" stroke-linecap="round"/>'
    )
    parts.append(f'<circle cx="21" cy="16" r="4.6" fill="{p["accent"]}"/>')
    parts.append(f'<circle cx="21" cy="42" r="4.2" fill="{p["green"]}"/>')
    parts.append(f'<circle cx="37" cy="46" r="4.2" fill="{p["blue"]}"/>')
    parts.append(
        f'<path d="M33 15h5.5a6 6 0 0 1 6 6v13" fill="none" stroke="{p["muted"]}" stroke-width="2.2" '
        f'stroke-linecap="round" stroke-dasharray="3 5" opacity="0.9"/>'
    )
    parts.append("</g>")

    # --- wordmark ---
    x = 136
    baseline = 82
    parts.append(path(t["wordmark"][0], x, baseline, weight=700, size=38, tracking=-0.01))
    x += width(t["wordmark"][0], weight=700, size=38, tracking=-0.01)
    parts.append(path(t["wordmark"][1], x, baseline, weight=700, size=38, tracking=-0.01, fill=p["accent"]))
    parts.append(path(t["tagline"], 137, 110, weight=500, size=17, family=mono, fill=p["muted"]))

    # --- заголовок ---
    parts.append(path(t["h1"][0], 56, 196, weight=700, size=34, tracking=-0.015))
    parts.append(path(t["h1"][1], 56, 240, weight=700, size=34, tracking=-0.015, fill=p["accent"]))
    parts.append(f'<rect x="56" y="258" width="150" height="3" rx="1.5" fill="url(#line)"/>')

    # --- чипсы-факты ---
    cx = 56
    for chip in t["chips"]:
        chip_width = width(chip, weight=600, size=15, family=mono) + 28
        parts.append(
            f'<rect x="{cx:.1f}" y="292" width="{chip_width:.1f}" height="32" rx="16" '
            f'fill="{p["bg_soft"]}" stroke="{p["border"]}" stroke-width="1"/>'
        )
        parts.append(path(chip, cx + 14, 313, weight=600, size=15, family=mono, fill=p["muted"]))
        cx += chip_width + 10

    # --- окно терминала ---
    tx, ty, tw, th = 664, 60, 560, 300
    parts.append(
        f'<rect x="{tx + 6}" y="{ty + 10}" width="{tw}" height="{th}" rx="16" fill="{p["bg"]}" opacity="0.55"/>'
    )
    parts.append(
        f'<rect x="{tx}" y="{ty}" width="{tw}" height="{th}" rx="16" fill="{p["panel"]}" '
        f'stroke="{p["border"]}" stroke-width="1.5"/>'
    )
    for i, color in enumerate((p["red"], p["accent"], p["green"])):
        parts.append(
            f'<circle cx="{tx + 26 + i * 18}" cy="{ty + 24}" r="5" fill="{color}" opacity="0.85"/>'
        )
    parts.append(
        f'<path d="M{tx} {ty + 44}h{tw}" stroke="{p["border"]}" stroke-width="1"/>'
    )
    parts.append(path("~/learn-git", tx + 78, ty + 29, weight=500, size=13, family=mono, fill=p["faint"]))
    parts.append(
        f'<rect x="{tx + tw - 132}" y="{ty + 17}" width="112" height="22" rx="11" '
        f'fill="{p["bg_soft"]}" stroke="{p["border"]}" stroke-width="1"/>'
    )
    parts.append(path("main", tx + tw - 118, ty + 33, weight=600, size=12, family=mono, fill=p["green"]))

    line_y = ty + 78
    for text, kind in t["terminal"]:
        color = {
            "cmd": p["fg"],
            "out": p["muted"],
            "dim": p["faint"],
            "ok": p["green"],
        }[kind]
        if kind == "cmd":
            parts.append(path("$", tx + 26, line_y, weight=600, size=15, family=mono, fill=p["accent"]))
            parts.append(path(text[2:], tx + 44, line_y, weight=500, size=15, family=mono, fill=color))
        else:
            parts.append(path(text, tx + 26, line_y, weight=400, size=15, family=mono, fill=color))
        line_y += 30

    # курсор
    last_len = width(t["terminal"][-1][0], weight=400, size=15, family=mono)
    parts.append(path("$", tx + 26, line_y, weight=600, size=15, family=mono, fill=p["accent"]))
    parts.append(f'<rect x="{tx + 44}" y="{line_y - 13}" width="9" height="17" rx="2" fill="{p["accent"]}"/>')
    line_y += 4
    _ = last_len

    # мини-граф веток внизу окна
    gx, gy = tx + 26, ty + th - 46
    parts.append(
        f'<path d="M{gx} {gy - 10}V{gy + 16}a10 10 0 0 0 10 10h26" fill="none" stroke="{p["accent"]}" '
        f'stroke-width="2.4" stroke-linecap="round" opacity="0.95"/>'
    )
    parts.append(f'<circle cx="{gx}" cy="{gy - 12}" r="4.6" fill="{p["accent"]}"/>')
    parts.append(f'<circle cx="{gx}" cy="{gy + 18}" r="4.6" fill="{p["green"]}"/>')
    parts.append(f'<circle cx="{gx + 40}" cy="{gy + 18}" r="4.6" fill="{p["blue"]}"/>')
    parts.append(path("feature", gx + 58, gy + 23, weight=600, size=12, family=mono, fill=p["blue"]))
    parts.append(path("→", gx + 112, gy + 23, weight=500, size=12, family=mono, fill=p["faint"]))
    parts.append(path("HEAD", gx + 130, gy + 23, weight=500, size=12, family=mono, fill=p["faint"]))

    # подпись справа снизу
    parts.append(path(t["footer"], 56, H - 30, weight=500, size=13, family=mono, fill=p["faint"]))

    parts.append("</svg>")
    return "\n".join(parts) + "\n"


# --------------------------------------------------------------------------
# Бейджи (локальные SVG вместо внешних картинок)
# --------------------------------------------------------------------------

BADGES = [
    # (файл, левая часть, значение, цвет значения)
    ("flask", "flask", "3.1", "#fabd2f"),
    ("react", "react", "18", "#83a598"),
    ("vite", "vite", "6", "#d3869b"),
    ("mit", "license", "MIT", "#b8bb26"),
    ("python", "python", "3.11", "#8ec07c"),
    ("offline", "CDN", "none", "#fe8019"),
]


def badge(slug: str) -> str:
    _, label, value, color = next(item for item in BADGES if item[0] == slug)
    size = 13
    weight = 600
    padding = 10
    label_w = FONT_CACHE.text_width(label, "sans", weight, size) + padding * 2
    value_w = FONT_CACHE.text_width(value, "sans", weight, size) + padding * 2
    height = 24
    total = label_w + value_w
    dark = "#1d2021"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{total:.0f}" height="{height}" viewBox="0 0 {total:.0f} {height}" role="img" aria-label="{label}: {value}">
  <title>{label}: {value}</title>
  <rect width="{total:.0f}" height="{height}" rx="6" fill="{dark}"/>
  <rect x="{label_w:.1f}" width="{value_w:.1f}" height="{height}" rx="6" fill="{color}" fill-opacity="0.18"/>
  <rect x="{label_w:.1f}" width="6" height="{height}" fill="{color}" fill-opacity="0.18"/>
  <g fill="#ebdbb2">{FONT_CACHE.text_to_path(label, padding, 16.5, "sans", weight, size)}</g>
  <g fill="{color}">{FONT_CACHE.text_to_path(value, label_w + padding, 16.5, "sans", weight, size)}</g>
  <rect x="0.5" y="0.5" width="{total - 1:.0f}" height="{height - 1}" rx="6" fill="none" stroke="#3c3836"/>
</svg>
"""


def badge_lang(locale: str) -> str:
    """Кликабельный бейдж-переключатель языка."""
    text = "🇷🇺 Русский" if locale == "ru" else "🇬🇧 English"
    color = "#fabd2f" if locale == "ru" else "#cba6f7"
    width = FONT_CACHE.text_width(text, "sans", 600, 14) + 28
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="26" viewBox="0 0 {width:.0f} 26" role="img" aria-label="{text}">
  <title>{text}</title>
  <rect width="{width:.0f}" height="26" rx="13" fill="{color}" fill-opacity="0.16"/>
  <rect x="0.5" y="0.5" width="{width - 1:.0f}" height="25" rx="12.5" fill="none" stroke="{color}" stroke-opacity="0.55"/>
  <g fill="{color}">{FONT_CACHE.text_to_path(text, 14, 18, "sans", 600, 14)}</g>
</svg>
"""


def main() -> None:
    badges_dir = OUT.parent / "badges"
    badges_dir.mkdir(parents=True, exist_ok=True)
    for slug, *_ in BADGES:
        target = badges_dir / f"badge-{slug}.svg"
        target.write_text(badge(slug), encoding="utf-8")
        print(f"✓ {target.relative_to(ROOT)} ({target.stat().st_size / 1024:.1f} КБ)")
    for locale in ("ru", "en"):
        target = badges_dir / f"lang-{locale}.svg"
        target.write_text(badge_lang(locale), encoding="utf-8")
        print(f"✓ {target.relative_to(ROOT)} ({target.stat().st_size / 1024:.1f} КБ)")
    OUT.mkdir(parents=True, exist_ok=True)
    for locale in ("ru", "en"):
        target = OUT / f"banner-{locale}.svg"
        target.write_text(banner(locale), encoding="utf-8")
        print(f"✓ {target.relative_to(ROOT)} ({target.stat().st_size / 1024:.1f} КБ)")


if __name__ == "__main__":
    main()
