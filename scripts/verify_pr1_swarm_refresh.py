#!/usr/bin/env python3
"""Verify that PR #1 contains the approved upstream Swarm model."""

from __future__ import annotations

import argparse
import hashlib
import re
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "swarm" / "js" / "scene.js"
INDEX = ROOT / "swarm" / "index.html"
APPLY = ROOT / "swarm" / "apply.html"
STYLES = ROOT / "swarm" / "css" / "styles.css"
LOGO = ROOT / "swarm" / "assets" / "logos" / "LOGO_LAMM_full_black.svg"
EXPECTED_MODEL_SHA256 = (
    "6a5bbfe9dcbe2210fb803e3595978b9bd2a54695ae4d195a077bad560967e19b"
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_model() -> None:
    if not MODEL.is_file():
        raise AssertionError(f"missing upstream Swarm model: {MODEL.relative_to(ROOT)}")
    actual = sha256(MODEL)
    if actual != EXPECTED_MODEL_SHA256:
        raise AssertionError(
            "Swarm model differs from approved upstream source: "
            f"expected {EXPECTED_MODEL_SHA256}, got {actual}"
        )


class LammLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.depth = 0
        self.tags: list[tuple[str, dict[str, str | None]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = (attributes.get("class") or "").split()
        if tag == "a" and "identity--lamm" in classes:
            self.depth = 1
            self.tags.append((tag, attributes))
        elif self.depth:
            self.depth += 1
            self.tags.append((tag, attributes))

    def handle_startendtag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if self.depth:
            self.tags.append((tag, dict(attrs)))

    def handle_endtag(self, tag: str) -> None:
        if self.depth:
            self.depth -= 1


def verify_logo(source: Path) -> None:
    if not source.is_file():
        raise AssertionError(f"logo source does not exist: {source}")
    if not LOGO.is_file():
        raise AssertionError(f"missing copied LAMM logo: {LOGO.relative_to(ROOT)}")
    if LOGO.read_bytes() != source.read_bytes():
        raise AssertionError("copied LAMM logo differs from the supplied source")

    parser = LammLinkParser()
    parser.feed(INDEX.read_text(encoding="utf-8"))
    images = [
        attrs
        for tag, attrs in parser.tags
        if tag == "img" and "identity__lamm-logo" in (attrs.get("class") or "").split()
    ]
    if len(images) != 1:
        raise AssertionError(f"LAMM header must contain exactly one static logo; found {len(images)}")
    image = images[0]
    if image.get("src") != "assets/logos/LOGO_LAMM_full_black.svg":
        raise AssertionError("LAMM header logo has the wrong asset path")
    if image.get("alt") != "Laboratory for Atomistic and Molecular Mechanics":
        raise AssertionError("LAMM header logo must have the approved accessible name")

    forbidden_tags = [tag for tag, _ in parser.tags if tag == "video"]
    forbidden_classes = {
        class_name
        for _, attrs in parser.tags
        for class_name in (attrs.get("class") or "").split()
        if class_name in {"identity__lattice", "identity__lamm-word"}
    }
    if forbidden_tags or forbidden_classes:
        raise AssertionError("animated or duplicate LAMM header treatment remains")

    css = STYLES.read_text(encoding="utf-8")
    logo_rule = re.search(
        r"\.identity--lamm\s+\.identity__lamm-logo\s*\{([^}]*)\}",
        css,
        re.DOTALL,
    )
    if not logo_rule or not re.search(r"filter\s*:\s*invert\(1\)", logo_rule.group(1)):
        raise AssertionError("LAMM logo CSS must invert the supplied black SVG")
    if not re.search(r"max-width\s*:\s*none", logo_rule.group(1)):
        raise AssertionError("LAMM logo must override generic flex-image max-width sizing")


def institution_block(path: Path) -> str:
    html = path.read_text(encoding="utf-8")
    match = re.search(
        r'<div class="identity__institutions">(.*?)</div>', html, re.DOTALL
    )
    if not match:
        raise AssertionError(f"missing organizer institution block: {path.relative_to(ROOT)}")
    return re.sub(r"\s+", " ", match.group(1)).strip()


def verify_application_header() -> None:
    if institution_block(APPLY) != institution_block(INDEX):
        raise AssertionError("application organizer logos do not match the homepage")

    application_block = institution_block(APPLY)
    forbidden = ("<video", "identity__lattice", "identity__lamm-word", ".webm", ".mp4")
    found = [token for token in forbidden if token in application_block]
    if found:
        raise AssertionError(f"legacy LAMM application header remains: {', '.join(found)}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-only", action="store_true")
    parser.add_argument("--logo-source", type=Path)
    args = parser.parse_args()

    try:
        verify_model()
        if not args.model_only:
            if args.logo_source is None:
                parser.error("--logo-source is required unless --model-only is used")
            verify_logo(args.logo_source)
            verify_application_header()
    except AssertionError as error:
        print(f"FAIL: {error}")
        return 1

    print(f"PASS model {EXPECTED_MODEL_SHA256}")
    if not args.model_only:
        print(f"PASS logo {sha256(LOGO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
