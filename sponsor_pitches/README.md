# ScienceSwarm sponsor materials

This directory contains two editable, static web sources and their PDF exports:

- `deck.html` — 13-slide founding partnership prospectus. Use the arrow keys, Page Up/Down, Space, Home, or End to navigate.
- `one-pager.html` — US Letter sponsorship opportunity sheet modeled on the compact technical-poster structure of the HARD MODE reference.

Serve the repository root with any static server and open the pages under `/sponsor_pitches/`. Both sources reuse the approved ScienceSwarm identity assets from `swarm/assets/logos/`.

To rebuild the PDFs:

```bash
python3 scripts/build_sponsor_pitches.py
```

The exporter waits for fonts and images before writing:

- `exports/scienceswarm-founding-partnership-deck.pdf`
- `exports/scienceswarm-sponsorship-opportunity.pdf`

Run the browser, content-parity, geometry, navigation, and export checks with:

```bash
python3 scripts/test_sponsor_pitches.py
```
