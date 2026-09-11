#!/usr/bin/env python3
"""Export the ScienceSwarm sponsor deck and one-pager from their HTML sources."""

from __future__ import annotations

import argparse
from pathlib import Path

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "sponsor_pitches"
DEFAULT_OUTPUT_DIR = SOURCE_DIR / "exports"


def wait_for_assets(page: Page) -> None:
    page.evaluate(
        """async () => {
          await document.fonts.ready;
          await Promise.all(Array.from(document.images).map((image) => {
            if (image.complete && image.naturalWidth > 0) return Promise.resolve();
            return new Promise((resolve, reject) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', reject, { once: true });
            });
          }));
        }"""
    )
    loaded_fonts = page.evaluate(
        """() => Array.from(document.fonts)
          .filter((font) => font.status === 'loaded')
          .map((font) => font.family.replaceAll('"', '').replaceAll("'", ''))"""
    )
    required_fonts = {"Bitter", "Inter", "IBM Plex Mono"}
    missing_fonts = required_fonts.difference(loaded_fonts)
    if missing_fonts:
        raise RuntimeError(
            "Sponsor-pitch fonts were not actually loaded for export: "
            f"missing {sorted(missing_fonts)}; loaded {sorted(set(loaded_fonts))}"
        )
    missing = page.locator("img").evaluate_all(
        "images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src)"
    )
    if missing:
        raise RuntimeError(f"Sponsor-pitch images failed to load: {missing}")


def export_pdf(page: Page, source: Path, output: Path, width: str, height: str, scale: float) -> None:
    page.goto(source.as_uri(), wait_until="networkidle")
    page.emulate_media(media="print")
    wait_for_assets(page)
    page.pdf(
        path=str(output),
        print_background=True,
        width=width,
        height=height,
        scale=scale,
        prefer_css_page_size=False,
        margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory for generated PDFs (defaults to sponsor_pitches/exports).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=["--font-render-hinting=none"])
        page = browser.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
        export_pdf(
            page,
            SOURCE_DIR / "deck.html",
            output_dir / "scienceswarm-founding-partnership-deck.pdf",
            "16in",
            "9in",
            0.96,
        )
        page.set_viewport_size({"width": 816, "height": 1056})
        export_pdf(
            page,
            SOURCE_DIR / "one-pager.html",
            output_dir / "scienceswarm-sponsorship-opportunity.pdf",
            "8.5in",
            "11in",
            1,
        )
        browser.close()
    print(f"Exported sponsor PDFs to {output_dir}")


if __name__ == "__main__":
    main()
