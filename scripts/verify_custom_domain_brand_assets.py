#!/usr/bin/env python3
"""Verify custom-domain browser and social brand assets."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SWARM_DIR = ROOT / "swarm"
LOGO_DIR = SWARM_DIR / "assets" / "logos"
PUBLIC_PAGES = (SWARM_DIR / "index.html", SWARM_DIR / "apply.html")
EXPECTED_ICON_HREFS = {
    "assets/logos/scienceclaw-favicon.svg?v=3",
    "assets/logos/scienceclaw-favicon-32.png?v=3",
    "assets/logos/favicon.ico?v=3",
    "assets/logos/apple-touch-icon.png?v=3",
}


class IconLinkParser(HTMLParser):
    """Collect icon links from a document head."""

    def __init__(self) -> None:
        super().__init__()
        self.hrefs: set[str] = set()

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag != "link":
            return
        attributes = dict(attrs)
        rel = set((attributes.get("rel") or "").split())
        href = attributes.get("href")
        if href and rel.intersection({"icon", "apple-touch-icon"}):
            self.hrefs.add(href)


def verify_nonempty_alpha(image: Image.Image, name: str) -> None:
    alpha = image.convert("RGBA").getchannel("A")
    if alpha.getbbox() is None:
        raise AssertionError(f"{name} contains no visible pincer artwork")


def verify_favicons() -> None:
    for page in PUBLIC_PAGES:
        parser = IconLinkParser()
        parser.feed(page.read_text(encoding="utf-8"))
        if parser.hrefs != EXPECTED_ICON_HREFS:
            raise AssertionError(
                f"{page.relative_to(ROOT)} favicon links differ: {sorted(parser.hrefs)}"
            )

    png_targets = {
        LOGO_DIR / "scienceclaw-favicon-32.png": (32, 32),
        LOGO_DIR / "apple-touch-icon.png": (180, 180),
    }
    for path, expected_size in png_targets.items():
        with Image.open(path) as image:
            if image.format != "PNG" or image.size != expected_size:
                raise AssertionError(
                    f"{path.name} must be a {expected_size[0]}x{expected_size[1]} PNG"
                )
            verify_nonempty_alpha(image, path.name)

    ico_path = LOGO_DIR / "favicon.ico"
    with Image.open(ico_path) as image:
        if image.format != "ICO":
            raise AssertionError("favicon.ico is not a valid ICO file")
        sizes = image.ico.sizes()
        expected_sizes = {(16, 16), (32, 32), (48, 48)}
        if not expected_sizes.issubset(sizes):
            raise AssertionError(f"favicon.ico is missing sizes: {expected_sizes - sizes}")
        verify_nonempty_alpha(image, ico_path.name)

    print("PASS favicons")


def main() -> int:
    try:
        verify_favicons()
    except (AssertionError, FileNotFoundError) as error:
        print(f"FAIL: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
