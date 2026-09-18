#!/usr/bin/env python3
"""Verify MIT domain-required footer links on every public HTML page."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PAGES = ("index.html", "apply.html", "flyer.html")
REQUIRED_HREFS = {
    "mailto:fw2@mit.edu",
    "https://accessibility.mit.edu/",
}


class FooterParser(HTMLParser):
    """Collect footer count, footer links, and visible footer text."""

    def __init__(self) -> None:
        super().__init__()
        self.footer_depth = 0
        self.footer_count = 0
        self.footer_hrefs: set[str] = set()
        self.footer_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "footer":
            self.footer_count += 1
            self.footer_depth += 1
            return
        if self.footer_depth and tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.footer_hrefs.add(href)

    def handle_endtag(self, tag: str) -> None:
        if tag == "footer" and self.footer_depth:
            self.footer_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.footer_depth and data.strip():
            self.footer_text.append(data.strip())


def verify_page(page_name: str) -> None:
    parser = FooterParser()
    parser.feed((ROOT / "v2" / page_name).read_text(encoding="utf-8"))
    if parser.footer_count != 1:
        raise AssertionError(f"{page_name}: expected one footer, found {parser.footer_count}")
    missing = REQUIRED_HREFS - parser.footer_hrefs
    if missing:
        raise AssertionError(f"{page_name}: footer missing links: {sorted(missing)}")
    visible_text = " ".join(parser.footer_text)
    if "fw2@mit.edu" not in visible_text or "Accessibility" not in visible_text:
        raise AssertionError(f"{page_name}: footer labels are incomplete")
    print(f"PASS {page_name}")


def main() -> None:
    for page_name in PUBLIC_PAGES:
        verify_page(page_name)


if __name__ == "__main__":
    main()
