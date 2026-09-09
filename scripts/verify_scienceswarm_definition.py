#!/usr/bin/env python3
"""Verify the approved ScienceSwarm homepage definition and preserved content."""

from __future__ import annotations

import hashlib
import re
from html.parser import HTMLParser
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
HOMEPAGE = ROOT / "swarm" / "index.html"

HERO_DEFINITION = (
    "A hackathon for building decentralized AI swarms that solve real scientific "
    "and technical problems."
)
META_DESCRIPTION_DEFINITION = (
    "ScienceSwarm is a hackathon for building decentralized AI swarms that solve "
    "real scientific and technical problems."
)
EXPECTED_META_DESCRIPTION = (
    f"{META_DESCRIPTION_DEFINITION} MIT Media Lab, Oct 30 – Nov 1, 2026."
)
REQUIRED_COPY = {
    "Purpose introduction": (
        "ScienceSwarm explores when decentralized collective intelligence can "
        "produce capabilities beyond a single agent or conventional workflow."
    ),
    "Purpose closing": (
        "Teams build working swarms of specialized agents, models, simulations, "
        "robots, sensors, and laboratory tools. Different parts of the swarm can "
        "hold distinct knowledge and capabilities, coordinate and adapt, and leave "
        "traceable scientific artifacts, provenance, findings, and unmet needs that "
        "the swarm can build upon—without requiring one central planner to prescribe "
        "the entire process."
    ),
    "Resources introduction": (
        "ScienceSwarm is model- and framework-agnostic. Teams can combine frontier "
        "models, open models, their own models, existing agent frameworks, scientific "
        "datasets, compute, robots, sensors, and laboratory infrastructure."
    ),
    "Resources closing": (
        "The goal is not to prove that one model is best. Teams can use, reuse, "
        "modify, and combine available technology—including capabilities developed "
        "during the event—to build a functioning decentralized system that "
        "accomplishes something scientifically meaningful."
    ),
    "Judging introduction": (
        "Science is the benchmark. Success is not simply whether an agent completed "
        "a task, but whether the system produced a scientifically meaningful result "
        "supported by evidence, validation, or measurable progress."
    ),
    "Judging closing": (
        "The judging rubric also asks whether organizing capabilities as a "
        "decentralized collective adds something beyond a single agent, isolated "
        "agents, or a conventional workflow."
    ),
}
FORBIDDEN_OLD_COPY = (
    "A hackathon on decentralized AI swarms",
    "Explore what becomes possible when collaborative, decentralized agentic systems",
    "Teams have access to a common pool of resources",
    "The rubric rewards systems where collective organization itself contributes capability",
)
EXPECTED_SECTION_06_SHA256 = (
    "7fb21fdbaa7d152847561b3dee9cbe15da4247da8b3e518c769090fb26794bb4"
)
SECTION_06_START = "<!-- MULTI-AGENT SYSTEM -->"
SECTION_06_END = "<!-- APPLY TEASER -->"
REQUIRED_SECTION_TITLES = (
    "Purpose",
    "Resources & Technology",
    "Judging",
    "The Hackathon as a Multi-Agent System",
)
VIEWPORTS = (("desktop", 1440, 900), ("mobile", 390, 844))


def normalize_whitespace(text: str) -> str:
    """Collapse source formatting so approved prose is checked independently of wrap."""
    return " ".join(text.split())


class HomepageParser(HTMLParser):
    """Collect the meta description and text of the hero headline subtitle."""

    def __init__(self) -> None:
        super().__init__()
        self.meta_descriptions: list[str] = []
        self.hero_subtitles: list[str] = []
        self._hero_subtitle_depth = 0
        self._hero_subtitle_chunks: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        attributes = dict(attrs)
        if tag == "meta" and attributes.get("name") == "description":
            self.meta_descriptions.append(attributes.get("content") or "")
        if self._hero_subtitle_depth:
            self._hero_subtitle_depth += 1
        elif tag == "span" and "hero__line--subtitle" in (
            attributes.get("class") or ""
        ).split():
            self._hero_subtitle_depth = 1
            self._hero_subtitle_chunks = []

    def handle_data(self, data: str) -> None:
        if self._hero_subtitle_depth:
            self._hero_subtitle_chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if not self._hero_subtitle_depth:
            return
        self._hero_subtitle_depth -= 1
        if self._hero_subtitle_depth == 0:
            self.hero_subtitles.append(
                normalize_whitespace("".join(self._hero_subtitle_chunks))
            )


def verify_copy(source: str) -> None:
    """Verify final, visitor-facing definition copy after formatting normalization."""
    parser = HomepageParser()
    parser.feed(source)

    assert parser.meta_descriptions == [EXPECTED_META_DESCRIPTION], (
        "meta description must contain the approved ScienceSwarm definition and date"
    )
    assert parser.hero_subtitles == [HERO_DEFINITION], (
        "hero headline subtitle must contain exactly the approved ScienceSwarm definition"
    )
    assert 'class="hero__sub"' not in source, (
        "duplicate hero description paragraph must be removed"
    )

    normalized_source = normalize_whitespace(source)
    for label, copy in REQUIRED_COPY.items():
        occurrences = normalized_source.count(copy)
        assert occurrences == 1, (
            f"{label} must appear exactly once after whitespace normalization; "
            f"found {occurrences}"
        )

    superseded = [text for text in FORBIDDEN_OLD_COPY if text in normalized_source]
    assert not superseded, f"superseded copy remains: {', '.join(superseded)}"


def verify_preserved_content(source: str) -> None:
    """Verify material excluded from the definition rewrite remains intact."""
    assert source.count('class="track reveal"') == 4, "challenge area count changed"
    assert source.count('class="card reveal"') >= 13, "card count dropped below 13"
    for resource_id in range(1, 7):
        marker = f'<span class="card__num">R{resource_id}</span>'
        assert marker in source, f"resource identifier R{resource_id} is missing"
    assert "Collaboration Bonus: +10" in source, "collaboration bonus is missing"
    assert "Oct 30 – Nov 1, 2026" in source, "event date is missing"
    assert 'href="apply.html"' in source, "application link is missing"
    for title in REQUIRED_SECTION_TITLES:
        marker = f'<h2 class="section__title">{title}</h2>'
        assert marker in source, f"{title} section title is missing"

    try:
        start = source.index(SECTION_06_START)
        end = source.index(SECTION_06_END, start)
    except ValueError as error:
        raise AssertionError("Section 06 boundaries are missing or out of order") from error
    section_06 = source[start:end]
    actual_digest = hashlib.sha256(section_06.encode("utf-8")).hexdigest()
    assert actual_digest == EXPECTED_SECTION_06_SHA256, (
        "Section 06 changed: "
        f"expected {EXPECTED_SECTION_06_SHA256}, got {actual_digest}"
    )


def verify_layout() -> None:
    """Open the real homepage at supported sizes and reject horizontal overflow."""
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        try:
            for label, width, height in VIEWPORTS:
                page = browser.new_page(viewport={"width": width, "height": height})
                try:
                    page.goto(HOMEPAGE.as_uri(), wait_until="load")
                    page.evaluate(
                        """async () => {
                            if (document.fonts && document.fonts.ready) {
                                await document.fonts.ready;
                            }
                        }"""
                    )
                    scroll_width, client_width = page.evaluate(
                        """() => [
                            document.documentElement.scrollWidth,
                            document.documentElement.clientWidth,
                        ]"""
                    )
                    assert scroll_width <= client_width, (
                        f"horizontal overflow at {label} viewport {width}x{height}: "
                        f"scrollWidth {scroll_width} exceeds clientWidth {client_width}"
                    )
                    primary_font_size, subtitle_font_size, subtitle_transform = page.evaluate(
                        """() => {
                            const primary = getComputedStyle(
                                document.querySelector(".hero__line--primary")
                            );
                            const subtitle = getComputedStyle(
                                document.querySelector(".hero__line--subtitle")
                            );
                            return [
                                parseFloat(primary.fontSize),
                                parseFloat(subtitle.fontSize),
                                subtitle.textTransform,
                            ];
                        }"""
                    )
                    assert primary_font_size > subtitle_font_size, (
                        f"hero primary font must exceed subtitle font at {label} "
                        f"viewport {width}x{height}: {primary_font_size}px <= "
                        f"{subtitle_font_size}px"
                    )
                    assert subtitle_transform == "none", (
                        f"hero subtitle must use sentence case at {label} viewport "
                        f"{width}x{height}; got text-transform {subtitle_transform!r}"
                    )
                finally:
                    page.close()
        finally:
            browser.close()


def main() -> int:
    try:
        source = HOMEPAGE.read_text(encoding="utf-8")
        verify_copy(source)
        verify_preserved_content(source)
        verify_layout()
    except AssertionError as error:
        print(f"FAIL: {error}")
        return 1
    except FileNotFoundError as error:
        print(f"FAIL: homepage file is unavailable: {error}")
        return 1
    except PlaywrightError as error:
        print(f"FAIL: browser layout verification failed: {error}")
        return 1

    print("PASS ScienceSwarm homepage definition")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
