#!/usr/bin/env python3
"""Verify every flyer application artifact uses the custom domain."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import xml.etree.ElementTree as ET

import cv2
import numpy as np

from build_social_flyer import APPLICATION_URL


ROOT = Path(__file__).resolve().parents[1]
V2_DIR = ROOT / "v2"
FLYER_HTML = V2_DIR / "flyer.html"
QR_PATH = V2_DIR / "assets" / "social" / "scienceclaw-apply-qr.svg"
CAPTIONS_PATH = V2_DIR / "assets" / "social" / "social-captions.md"
EXPECTED_APPLICATION_URL = "https://scienceclaw.dev/apply.html"
OLD_APPLICATION_HOST = "infinite-hackathon.vercel.app"


class ApplicationLinkParser(HTMLParser):
    """Collect the flyer application's interactive destination."""

    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        href = attributes.get("href")
        if tag == "a" and "apply-panel" in classes and href:
            self.hrefs.append(href)


def decode_qr_svg(path: Path) -> str:
    """Rasterize the generated SVG modules and return their decoded payload."""
    root = ET.parse(path).getroot()
    field = int(root.attrib["width"])
    scale = 12
    pixels = np.full((field * scale, field * scale), 255, dtype=np.uint8)

    namespace = root.tag.partition("}")[0].lstrip("{")
    prefix = f"{{{namespace}}}" if namespace else ""
    group = root.find(f"{prefix}g")
    if group is None:
        raise AssertionError("application QR SVG has no module group")
    transform = group.attrib.get("transform", "")
    match = re.fullmatch(r"translate\((\d+) (\d+)\)", transform)
    if not match:
        raise AssertionError(f"application QR has an unsupported transform: {transform}")
    offset_x, offset_y = map(int, match.groups())

    for rectangle in group.findall(f"{prefix}rect"):
        x = (int(rectangle.attrib["x"]) + offset_x) * scale
        y = (int(rectangle.attrib["y"]) + offset_y) * scale
        width = int(rectangle.attrib["width"]) * scale
        height = int(rectangle.attrib["height"]) * scale
        pixels[y : y + height, x : x + width] = 0

    decoded, points, _ = cv2.QRCodeDetector().detectAndDecode(pixels)
    if points is None or not decoded:
        raise AssertionError("application QR code could not be decoded")
    return decoded


def verify_flyer() -> None:
    if APPLICATION_URL != EXPECTED_APPLICATION_URL:
        raise AssertionError(
            f"flyer generator targets {APPLICATION_URL}, expected {EXPECTED_APPLICATION_URL}"
        )

    flyer_source = FLYER_HTML.read_text(encoding="utf-8")
    parser = ApplicationLinkParser()
    parser.feed(flyer_source)
    if parser.hrefs != [EXPECTED_APPLICATION_URL]:
        raise AssertionError(f"flyer application links differ: {parser.hrefs}")

    captions = CAPTIONS_PATH.read_text(encoding="utf-8")
    if captions.count(EXPECTED_APPLICATION_URL) != 2:
        raise AssertionError("social captions do not contain both custom-domain links")
    if OLD_APPLICATION_HOST in flyer_source or OLD_APPLICATION_HOST in captions:
        raise AssertionError("old Vercel application URL remains in flyer text artifacts")

    decoded = decode_qr_svg(QR_PATH)
    if decoded != EXPECTED_APPLICATION_URL:
        raise AssertionError(f"application QR decodes to {decoded}")

    print(f"PASS flyer {EXPECTED_APPLICATION_URL}")


def main() -> int:
    try:
        verify_flyer()
    except (AssertionError, FileNotFoundError, ET.ParseError) as error:
        print(f"FAIL: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
