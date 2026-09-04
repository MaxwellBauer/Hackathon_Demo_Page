#!/usr/bin/env python3
"""Build the Swarm flyer QR code and export its HTML source to PNG and PDF."""

from __future__ import annotations

from pathlib import Path

import cv2


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "v2" / "assets" / "social"
HTML_PATH = ROOT / "v2" / "flyer.html"
QR_PATH = OUTPUT_DIR / "swarm-apply-qr.svg"
PNG_PATH = OUTPUT_DIR / "swarm-hackathon-flyer-16x9.png"
PDF_PATH = OUTPUT_DIR / "swarm-hackathon-flyer-16x9.pdf"
CAPTIONS_PATH = OUTPUT_DIR / "social-captions.md"
APPLICATION_URL = "https://infinite-hackathon.vercel.app/apply.html"


def qr_row_runs(matrix) -> str:
    """Return compact horizontal SVG rectangles for runs of dark QR modules."""
    runs = []
    for y, row in enumerate(matrix):
        start = None
        for x, value in enumerate(row):
            if value == 0 and start is None:
                start = x
            if start is not None and (value != 0 or x == len(row) - 1):
                end = x if value != 0 else x + 1
                runs.append(f'<rect x="{start}" y="{y}" width="{end - start}" height="1"/>')
                start = None
    return "".join(runs)


def build_qr_svg() -> str:
    """Create a crisp, high-contrast QR code with a four-module quiet zone."""
    matrix = cv2.QRCodeEncoder_create().encode(APPLICATION_URL)
    modules = len(matrix)
    field = modules + 8
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{field}" height="{field}"
  viewBox="0 0 {field} {field}" shape-rendering="crispEdges" role="img" aria-label="Application QR code">
  <rect width="{field}" height="{field}" fill="#f7f2e6"/>
  <g transform="translate(4 4)" fill="#020202">{qr_row_runs(matrix)}</g>
</svg>
'''


def build_captions() -> str:
    return f'''# Social captions

## LinkedIn

Applications are open for Swarm: The Internet of Agents Hackathon.

Join us at the MIT Media Lab from October 30–November 1, 2026 to build decentralized agent swarms that tackle meaningful scientific and engineering problems.

Apply directly: {APPLICATION_URL}

#AI #AgenticSystems #Hackathon #MITMediaLab #MultiAgentSystems

## X

Applications are open for Swarm: The Internet of Agents Hackathon.

Oct 30–Nov 1, 2026 · MIT Media Lab 6th floor

Build decentralized agent swarms for meaningful scientific and engineering problems.

Apply: {APPLICATION_URL}
'''


def export_flyer() -> None:
    """Render the same verified HTML page to a 1600 × 900 PNG and 16:9 PDF."""
    from playwright.sync_api import sync_playwright

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=["--font-render-hinting=none"])
        page = browser.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
        page.goto(HTML_PATH.as_uri(), wait_until="networkidle")
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

        checks = page.evaluate(
            """() => ({
              bitter: document.fonts.check('300 108.8px Bitter'),
              bitterItalic: document.fonts.check('italic 300 108.8px Bitter'),
              inter: document.fonts.check('300 25px Inter'),
              plex: document.fonts.check('700 24px "IBM Plex Mono"')
            })"""
        )
        if not all(checks.values()):
            raise RuntimeError(f"Website fonts were not ready for export: {checks}")

        styles = page.locator(".flyer__title").evaluate(
            """element => {
              const style = getComputedStyle(element);
              return {
                family: style.fontFamily,
                size: style.fontSize,
                weight: style.fontWeight,
                lineHeight: style.lineHeight,
                tracking: style.letterSpacing
              };
            }"""
        )
        expected = {
            "size": "108.8px",
            "weight": "300",
            "lineHeight": "121.856px",
            "tracking": "-2.176px",
        }
        if "Bitter" not in styles["family"] or any(styles[key] != value for key, value in expected.items()):
            raise RuntimeError(f"Headline styles do not match the website: {styles}")

        geometry = page.evaluate(
            """() => {
              const box = (selector) => {
                const rect = document.querySelector(selector).getBoundingClientRect();
                return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
              };
              const mit = box('.organizer--mit');
              const lamm = box('.organizer--lamm');
              const e14 = box('.organizer--e14');
              return {
                flyer: box('.flyer'),
                mitLammGap: lamm.left - mit.right,
                lammE14Gap: e14.left - lamm.right,
                pageOverflow: document.documentElement.scrollWidth > 1600 || document.documentElement.scrollHeight > 900,
                titleLines: document.querySelectorAll('.flyer__title-line').length,
                visibleText: document.querySelector('.flyer').innerText
              };
            }"""
        )
        if geometry["flyer"]["width"] != 1600 or geometry["flyer"]["height"] != 900:
            raise RuntimeError(f"Flyer canvas is not 1600 × 900: {geometry['flyer']}")
        if geometry["pageOverflow"]:
            raise RuntimeError("Flyer page overflows the 1600 × 900 canvas")
        if geometry["titleLines"] != 2:
            raise RuntimeError("Headline must use the approved two-line treatment")
        # The MIT and LAMM artwork have different internal transparent edges.
        # A four-pixel box-gap correction produces equal visible whitespace.
        if abs((geometry["lammE14Gap"] - geometry["mitLammGap"]) - 4) > 0.5:
            raise RuntimeError(f"Organizer optical-gap correction is missing: {geometry}")
        if "vercel.app" in geometry["visibleText"]:
            raise RuntimeError("The application URL must not be visible in the flyer")

        page.locator(".flyer").screenshot(path=str(PNG_PATH), omit_background=False)
        page.emulate_media(media="print")
        page.pdf(
            path=str(PDF_PATH),
            print_background=True,
            width="16in",
            height="9in",
            scale=0.96,
            prefer_css_page_size=False,
            page_ranges="1",
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        browser.close()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    QR_PATH.write_text(build_qr_svg(), encoding="utf-8")
    CAPTIONS_PATH.write_text(build_captions(), encoding="utf-8")
    export_flyer()


if __name__ == "__main__":
    main()
