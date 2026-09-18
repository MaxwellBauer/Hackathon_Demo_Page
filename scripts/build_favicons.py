#!/usr/bin/env python3
"""Build cross-browser favicon formats from the canonical ScienceClaw pincer SVG."""

from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
LOGO_DIR = ROOT / "swarm" / "assets" / "logos"
SVG_PATH = LOGO_DIR / "scienceclaw-favicon.svg"
ICO_PATH = LOGO_DIR / "favicon.ico"
RASTER_TARGETS = {
    LOGO_DIR / "scienceclaw-favicon-32.png": (32, 32),
    LOGO_DIR / "apple-touch-icon.png": (180, 180),
}


def build_favicons() -> None:
    """Render the source SVG once, then derive PNG and ICO variants."""
    with TemporaryDirectory(prefix="scienceclaw-favicon-") as temporary_directory:
        capture_path = Path(temporary_directory) / "scienceclaw-favicon-512.png"
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(
                viewport={"width": 512, "height": 512},
                device_scale_factor=1,
            )
            page.goto(SVG_PATH.as_uri(), wait_until="load")
            page.evaluate(
                """() => {
                  const svg = document.documentElement;
                  svg.style.cssText = 'display:block;width:512px;height:512px';
                }"""
            )
            page.screenshot(path=str(capture_path), omit_background=True)
            browser.close()

        with Image.open(capture_path) as captured:
            master = captured.convert("RGBA")
            for output_path, size in RASTER_TARGETS.items():
                master.resize(size, Image.Resampling.LANCZOS).save(output_path, "PNG")
            master.save(
                ICO_PATH,
                format="ICO",
                sizes=[(16, 16), (32, 32), (48, 48)],
            )


if __name__ == "__main__":
    build_favicons()
