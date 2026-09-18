#!/usr/bin/env python3
"""Verify the official LAMM flyer and its deployable copies."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SUPPLIED_LOGO = ROOT.parent / "logos" / "LOGO_LAMM_full_black.svg"
V2_LOGO = ROOT / "v2" / "assets" / "logos" / "LOGO_LAMM_full_black.svg"
SWARM_LOGO = ROOT / "swarm" / "assets" / "logos" / "LOGO_LAMM_full_black.svg"
FLYER_HTML = ROOT / "v2" / "flyer.html"
PUBLIC_PAIRS = {
    FLYER_HTML: ROOT / "swarm" / "flyer.html",
    ROOT / "v2" / "assets" / "social" / "scienceclaw-apply-qr.svg": ROOT
    / "swarm"
    / "assets"
    / "social"
    / "scienceclaw-apply-qr.svg",
    ROOT / "v2" / "assets" / "social" / "scienceclaw-hackathon-flyer-16x9.png": ROOT
    / "swarm"
    / "assets"
    / "social"
    / "scienceclaw-hackathon-flyer-16x9.png",
    ROOT / "v2" / "assets" / "social" / "scienceclaw-hackathon-flyer-16x9.pdf": ROOT
    / "swarm"
    / "assets"
    / "social"
    / "scienceclaw-hackathon-flyer-16x9.pdf",
}


class LammLogoParser(HTMLParser):
    """Collect official LAMM image sources from flyer markup."""

    def __init__(self) -> None:
        super().__init__()
        self.sources: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        source = attributes.get("src")
        if tag == "img" and "organizer__lamm-logo" in classes and source:
            self.sources.append(source)


def verify_logo_provenance() -> None:
    supplied = SUPPLIED_LOGO.read_bytes()
    for path in (V2_LOGO, SWARM_LOGO):
        if path.read_bytes() != supplied:
            raise AssertionError(f"{path.relative_to(ROOT)} differs from supplied LAMM logo")


def verify_flyer_markup() -> None:
    source = FLYER_HTML.read_text(encoding="utf-8")
    parser = LammLogoParser()
    parser.feed(source)
    expected = ["assets/logos/LOGO_LAMM_full_black.svg"]
    if parser.sources != expected:
        raise AssertionError(f"official LAMM flyer image differs: {parser.sources}")
    forbidden = (
        "organizer__lattice",
        "organizer__lamm-name",
        "lamm-lattice-white-poster.png",
    )
    found = [token for token in forbidden if token in source]
    if found:
        raise AssertionError(f"legacy LAMM flyer treatment remains: {', '.join(found)}")


def verify_publication_outputs() -> None:
    for source, published in PUBLIC_PAIRS.items():
        if published.read_bytes() != source.read_bytes():
            raise AssertionError(
                f"published {published.relative_to(ROOT)} differs from {source.relative_to(ROOT)}"
            )
    public_png = ROOT / "swarm" / "assets" / "social" / "scienceclaw-hackathon-flyer-16x9.png"
    with Image.open(public_png) as image:
        if image.format != "PNG" or image.size != (1600, 900):
            raise AssertionError("published flyer must be a 1600x900 PNG")


def main() -> int:
    try:
        verify_logo_provenance()
        verify_flyer_markup()
        verify_publication_outputs()
    except (AssertionError, FileNotFoundError) as error:
        print(f"FAIL: {error}")
        return 1
    print("PASS published official LAMM flyer")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
