#!/usr/bin/env python3
"""Build the cinematic Swarm social flyer and social captions."""

from __future__ import annotations

import base64
from pathlib import Path

import cv2


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "v2" / "assets" / "social"
LOGO_DIR = ROOT / "v2" / "assets" / "logos"
SVG_PATH = OUTPUT_DIR / "swarm-hackathon-flyer-16x9.svg"
PNG_PATH = OUTPUT_DIR / "swarm-hackathon-flyer-16x9.png"
APPLICATION_URL = "https://infinite-hackathon.vercel.app/apply.html"


def data_uri(path: Path, media_type: str) -> str:
    """Return a file as an embeddable base64 data URI."""
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{media_type};base64,{encoded}"


def qr_row_runs(matrix) -> str:
    """Return compact horizontal SVG paths for runs of dark QR modules."""
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


def terrain_lines() -> str:
    """Build a lightweight perspective grid reminiscent of the website scene."""
    paths = []
    horizon = 635
    for x in range(-520, 2121, 120):
        paths.append(f'<path d="M800 {horizon} L{x} 900"/>')
    for y in (658, 684, 714, 748, 788, 834, 886):
        amplitude = max(4, (y - horizon) * 0.075)
        paths.append(
            f'<path d="M0 {y} C250 {y-amplitude:.1f} 430 {y+amplitude:.1f} 650 {y} '
            f'S1050 {y-amplitude:.1f} 1260 {y} S1480 {y+amplitude:.1f} 1600 {y}"/>'
        )
    return "".join(paths)


def build_svg(qr_rects: str, qr_modules: int) -> str:
    crane = data_uri(LOGO_DIR / "swarm-crane.svg", "image/svg+xml")
    mit = data_uri(LOGO_DIR / "mit-lockup.svg", "image/svg+xml")
    e14 = data_uri(LOGO_DIR / "e14-logo.svg", "image/svg+xml")
    lattice = data_uri(LOGO_DIR / "lamm-lattice-white-poster.png", "image/png")

    qr_scale = 7
    qr_quiet = 4
    qr_field = (qr_modules + qr_quiet * 2) * qr_scale
    qr_x = 1196 + (336 - qr_field) / 2
    qr_y = 319

    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title description">
  <title id="title">Swarm — The Internet of Agents Hackathon</title>
  <desc id="description">A black-and-gold social flyer for the Swarm hackathon at the MIT Media Lab from October 30 through November 1, 2026, with a QR code to apply.</desc>
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,300;0,400;1,300&amp;family=IBM+Plex+Mono:wght@400;700&amp;family=Inter:wght@300;400;500;600&amp;display=swap');
      .serif {{ font-family: "Bitter", Georgia, "DejaVu Serif", serif; }}
      .sans {{ font-family: "Inter", Arial, "DejaVu Sans", sans-serif; }}
      .mono {{ font-family: "IBM Plex Mono", "DejaVu Sans Mono", monospace; }}
    </style>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffdf8a"/>
      <stop offset=".48" stop-color="#e1aa3e"/>
      <stop offset="1" stop-color="#9b6816"/>
    </linearGradient>
    <radialGradient id="atmosphere" cx="47%" cy="45%" r="66%">
      <stop offset="0" stop-color="#342307" stop-opacity=".38"/>
      <stop offset=".55" stop-color="#161003" stop-opacity=".12"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="terrainFade" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#d9a038" stop-opacity=".12"/>
      <stop offset="1" stop-color="#d9a038" stop-opacity=".46"/>
    </linearGradient>
    <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="2" seed="11"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="latticeCrop"><circle cx="687" cy="94" r="30"/></clipPath>
  </defs>

  <rect width="1600" height="900" fill="#020202"/>
  <rect width="1600" height="900" fill="url(#atmosphere)"/>
  <ellipse cx="770" cy="651" rx="720" ry="105" fill="#d9a038" opacity=".035" filter="url(#softGlow)"/>

  <g aria-hidden="true" fill="none" stroke="url(#terrainFade)" stroke-width="1.2" opacity=".72">
    {terrain_lines()}
  </g>
  <rect y="610" width="1600" height="290" fill="url(#atmosphere)" opacity=".32"/>

  <g aria-label="Hackathon organizers">
    <image href="{crane}" x="78" y="62" width="92" height="59"/>
    <text x="187" y="102" class="mono" font-size="24" font-weight="700" letter-spacing="7" fill="#f7f2e6">SWARM</text>
    <line x1="336" y1="70" x2="336" y2="117" stroke="#d9a038" stroke-opacity=".3"/>

    <image href="{mit}" x="390" y="72" width="190" height="46" style="filter:brightness(0) invert(1);opacity:.62"/>

    <circle cx="687" cy="94" r="29" fill="#080808" stroke="#d9a038" stroke-opacity=".18"/>
    <image href="{lattice}" x="652" y="59" width="70" height="70" preserveAspectRatio="xMidYMid slice" clip-path="url(#latticeCrop)" opacity=".72"/>
    <text x="735" y="88" class="sans" font-size="22" font-weight="500" fill="#f7f2e6" opacity=".62">Laboratory for Atomistic and</text>
    <text x="735" y="114" class="sans" font-size="22" font-weight="500" fill="#f7f2e6" opacity=".62">Molecular Mechanics</text>

    <image href="{e14}" x="1090" y="69" width="52" height="52" style="filter:brightness(0) invert(1);opacity:.62"/>
  </g>

  <g aria-hidden="true">
    <image href="{crane}" x="924" y="230" width="122" height="78" opacity=".33" transform="rotate(-8 985 269)"/>
    <image href="{crane}" x="788" y="527" width="76" height="49" opacity=".24" transform="rotate(9 826 552)"/>
    <image href="{crane}" x="1024" y="486" width="54" height="35" opacity=".18" transform="rotate(-11 1051 504)"/>
    <image href="{crane}" x="671" y="204" width="48" height="31" opacity=".17" transform="rotate(12 695 220)"/>
    <circle cx="1075" cy="338" r="2" fill="#ffdf8a" opacity=".45"/>
    <circle cx="866" cy="235" r="1.5" fill="#ffdf8a" opacity=".32"/>
    <circle cx="1098" cy="559" r="1.5" fill="#ffdf8a" opacity=".28"/>
  </g>

  <g aria-label="Event title">
    <text x="86" y="330" class="serif" font-size="78" font-weight="300" letter-spacing="-2" fill="#f7f2e6">The Internet of</text>
    <text x="82" y="472" class="serif" font-size="142" font-weight="300" font-style="italic" letter-spacing="-5" fill="url(#gold)">Agents</text>
    <text x="86" y="590" class="serif" font-size="108" font-weight="300" letter-spacing="-3" fill="#f7f2e6">Hackathon</text>
    <line x1="88" y1="632" x2="1076" y2="632" stroke="#d9a038" stroke-opacity=".24"/>
  </g>

  <g aria-label="Event details">
    <circle cx="96" cy="785" r="5" fill="#d9a038"/>
    <text x="121" y="796" class="sans" font-size="30" font-weight="400" fill="#f7f2e6">Oct 30 – Nov 1, 2026 · MIT Media Lab 6th floor</text>
  </g>

  <g aria-label="Application QR code">
    <rect x="1168" y="219" width="384" height="526" rx="8" fill="#070603" fill-opacity=".94" stroke="#d9a038" stroke-width="2"/>
    <path d="M1168 283V219h64 M1488 219h64v64 M1168 681v64h64 M1488 745h64v-64" fill="none" stroke="#ffdf8a" stroke-width="3"/>
    <text x="1360" y="276" text-anchor="middle" class="mono" font-size="22" letter-spacing="5" fill="#d9a038">APPLICATIONS OPEN</text>
    <g transform="translate({qr_x:.1f} {qr_y})" shape-rendering="crispEdges">
      <rect width="{qr_field}" height="{qr_field}" rx="3" fill="#f7f2e6"/>
      <g transform="translate({qr_quiet * qr_scale} {qr_quiet * qr_scale}) scale({qr_scale})" fill="#020202">{qr_rects}</g>
    </g>
    <text x="1360" y="691" text-anchor="middle" class="sans" font-size="44" font-weight="600" letter-spacing="2" fill="#ffdf8a">Apply</text>
  </g>

  <rect width="1600" height="900" filter="url(#grain)" opacity=".026" style="mix-blend-mode:screen" pointer-events="none"/>
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


def export_png() -> None:
    """Render the SVG through Chromium for a deterministic 1600 × 900 PNG."""
    from playwright.sync_api import sync_playwright

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=["--font-render-hinting=none"])
        page = browser.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
        page.goto(SVG_PATH.as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.screenshot(path=str(PNG_PATH), omit_background=False)
        browser.close()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    qr = cv2.QRCodeEncoder_create().encode(APPLICATION_URL)
    SVG_PATH.write_text(build_svg(qr_row_runs(qr), len(qr)), encoding="utf-8")
    (OUTPUT_DIR / "social-captions.md").write_text(build_captions(), encoding="utf-8")
    export_png()


if __name__ == "__main__":
    main()
