#!/usr/bin/env python3
"""Build the self-contained INFINITE social flyer SVG and post captions."""

from pathlib import Path

import cv2


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "v2" / "assets" / "social"
APPLICATION_URL = "https://infinite-hackathon.vercel.app/apply.html"


def qr_row_runs(matrix):
    """Return compact horizontal SVG rects for each run of dark QR modules."""
    rects = []
    for y, row in enumerate(matrix):
        start = None
        for x, value in enumerate(row):
            if value == 0 and start is None:
                start = x
            if start is not None and (value != 0 or x == len(row) - 1):
                end = x if value != 0 else x + 1
                rects.append(f'<rect x="{start}" y="{y}" width="{end - start}" height="1"/>')
                start = None
    return "".join(rects)


def build_svg(qr_rects):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title description">
  <title id="title">INFINITE — The Internet of Agents Hackathon</title>
  <desc id="description">Social flyer for the October 30 through November 1, 2026 hackathon at MIT Media Lab, with a QR code linking to the application.</desc>
  <defs>
    <radialGradient id="halo" cx="77%" cy="39%" r="64%">
      <stop offset="0" stop-color="#d9a038" stop-opacity=".12"/>
      <stop offset=".55" stop-color="#8a5a0f" stop-opacity=".035"/>
      <stop offset="1" stop-color="#050505" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#ffdf8a"/>
      <stop offset=".52" stop-color="#d9a038"/>
      <stop offset="1" stop-color="#8f641a"/>
    </linearGradient>
    <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="microGrid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#d9a038" stroke-opacity=".045" stroke-width="1"/>
    </pattern>
    <style>
      .sans {{ font-family: Inter, Arial, sans-serif; }}
      .serif {{ font-family: Bitter, Georgia, serif; }}
      .mono {{ font-family: "IBM Plex Mono", "DejaVu Sans Mono", monospace; }}
    </style>
  </defs>

  <rect width="1600" height="900" fill="#050505"/>
  <rect width="1600" height="900" fill="url(#microGrid)"/>
  <rect width="1600" height="900" fill="url(#halo)"/>
  <circle cx="1340" cy="350" r="330" fill="none" stroke="#d9a038" stroke-opacity=".08"/>
  <circle cx="1340" cy="350" r="260" fill="none" stroke="#d9a038" stroke-opacity=".05"/>

  <rect x="56" y="56" width="1488" height="788" rx="2" fill="none" stroke="#d9a038" stroke-opacity=".58" stroke-width="2"/>
  <path d="M56 126V56h70 M1474 56h70v70 M56 774v70h70 M1474 844h70v-70" fill="none" stroke="#ffdf8a" stroke-width="4"/>

  <g aria-label="INFINITE brand">
    <text x="96" y="165" class="serif" font-size="110" font-weight="400" fill="url(#gold)" filter="url(#softGlow)">∞</text>
    <text x="224" y="139" class="mono" font-size="29" font-weight="700" letter-spacing="10" fill="#f7f2e6">INFINITE</text>
    <line x1="224" y1="160" x2="515" y2="160" stroke="#d9a038" stroke-width="2"/>
  </g>

  <g aria-label="Event title">
    <text x="96" y="294" class="serif" font-size="78" font-weight="300" letter-spacing="-2" fill="#f7f2e6">THE INTERNET</text>
    <text x="96" y="398" class="serif" font-size="94" font-weight="300" letter-spacing="-3" fill="#f7f2e6">OF <tspan fill="#f2c15a" font-style="italic">AGENTS</tspan></text>
    <text x="96" y="494" class="sans" font-size="72" font-weight="600" letter-spacing="4" fill="#f7f2e6">HACKATHON</text>
  </g>

  <g aria-label="Event description" class="sans" font-size="30" font-weight="300" fill="#d8d1c2">
    <text x="99" y="574">Build decentralized agent swarms that tackle meaningful</text>
    <text x="99" y="616">scientific and engineering problems.</text>
  </g>

  <g aria-label="Event details">
    <line x1="96" y1="684" x2="1014" y2="684" stroke="#d9a038" stroke-opacity=".52"/>
    <text x="96" y="729" class="mono" font-size="20" letter-spacing="4" fill="#d9a038">DATE</text>
    <text x="96" y="772" class="sans" font-size="31" font-weight="500" fill="#f7f2e6">OCT 30 – NOV 1, 2026</text>
    <line x1="485" y1="708" x2="485" y2="787" stroke="#d9a038" stroke-opacity=".35"/>
    <text x="530" y="729" class="mono" font-size="20" letter-spacing="4" fill="#d9a038">LOCATION</text>
    <text x="530" y="772" class="sans" font-size="31" font-weight="500" fill="#f7f2e6">MIT MEDIA LAB</text>
    <text x="530" y="808" class="sans" font-size="24" font-weight="300" fill="#a9a294">CAMBRIDGE, MA</text>
  </g>

  <g aria-label="Application panel">
    <rect x="1094" y="91" width="410" height="718" rx="8" fill="#0c0a06" stroke="#d9a038" stroke-width="2"/>
    <rect x="1112" y="109" width="374" height="682" rx="4" fill="none" stroke="#d9a038" stroke-opacity=".26"/>
    <text x="1299" y="167" text-anchor="middle" class="mono" font-size="18" letter-spacing="4" fill="#d9a038">APPLICATIONS OPEN</text>

    <g transform="translate(1155 207) scale(7)" shape-rendering="crispEdges">
      <rect width="41" height="41" rx="1" fill="#f7f2e6"/>
      <g transform="translate(4 4)" fill="#050505">{qr_rects}</g>
    </g>

    <text x="1299" y="567" text-anchor="middle" class="sans" font-size="43" font-weight="600" letter-spacing="3" fill="#ffdf8a">APPLY NOW</text>
    <text x="1299" y="608" text-anchor="middle" class="sans" font-size="22" font-weight="300" fill="#d8d1c2">Scan to open the application</text>
    <line x1="1161" y1="652" x2="1437" y2="652" stroke="#d9a038" stroke-opacity=".45"/>
    <text x="1299" y="698" text-anchor="middle" class="mono" font-size="17" fill="#f2c15a">infinite-hackathon.vercel.app</text>
    <text x="1299" y="729" text-anchor="middle" class="mono" font-size="17" fill="#f2c15a">/apply.html</text>
    <text x="1299" y="770" text-anchor="middle" class="mono" font-size="15" letter-spacing="3" fill="#777166">BUILD · COORDINATE · DISCOVER</text>
  </g>

  <g fill="#d9a038" opacity=".72" aria-hidden="true">
    <path d="M1018 232l24 8-19 9 5-9z"/>
    <path d="M988 265l18 6-14 7 3-7z"/>
    <path d="M1038 298l15 5-12 6 3-6z"/>
  </g>
</svg>
'''


def build_captions():
    return f'''# Social captions

## LinkedIn

Applications are open for INFINITE: The Internet of Agents Hackathon.

Join us at the MIT Media Lab from October 30–November 1, 2026 to build decentralized agent swarms that tackle meaningful scientific and engineering problems.

Apply directly: {APPLICATION_URL}

#AI #AgenticSystems #Hackathon #MITMediaLab #MultiAgentSystems

## X

Applications are open for INFINITE: The Internet of Agents Hackathon.

Oct 30–Nov 1, 2026 · MIT Media Lab

Build decentralized agent swarms for meaningful scientific and engineering problems.

Apply: {APPLICATION_URL}
'''


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    qr = cv2.QRCodeEncoder_create().encode(APPLICATION_URL)
    (OUTPUT_DIR / "infinite-hackathon-flyer-16x9.svg").write_text(
        build_svg(qr_row_runs(qr)), encoding="utf-8"
    )
    (OUTPUT_DIR / "social-captions.md").write_text(build_captions(), encoding="utf-8")


if __name__ == "__main__":
    main()
