# ScienceSwarm Headline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `ScienceSwarm` the dominant event name and `Internet of Agents Hackathon` its smaller subtitle on both the homepage and flyer, then provide a localhost preview without deploying.

**Architecture:** Keep the existing static HTML/CSS structure and flyer export pipeline. Add explicit primary/subtitle classes to both headline components, enforce their copy and hierarchy with a focused source verifier plus the existing browser export checks, and let the current flyer builder synchronize generated artifacts into `swarm/`.

**Tech Stack:** Static HTML/CSS, Python 3, Playwright/Chromium, Pillow, OpenCV, Git

**Spec:** `docs/superpowers/specs/2026-09-09-scienceswarm-headline-design.md`

## Global Constraints

- The visible primary line is exactly `ScienceSwarm`.
- The visible supporting line is exactly `Internet of Agents Hackathon`.
- The primary line must have a larger computed font size than the supporting line.
- Preserve the gold accent, dark visual language, responsive behavior, application URL, QR destination, organizer logos, body copy, and dates.
- The PNG remains 1600×900 and the PDF remains a single-page 16:9 document.
- Do not run `vercel deploy`, change a production alias, or otherwise publish to `swarmhack.ai`.

---

### Task 1: Add headline contract verification

**Files:**
- Create: `scripts/verify_scienceswarm_headline.py`
- Test: `scripts/verify_scienceswarm_headline.py`

**Interfaces:**
- Consumes: `swarm/index.html`, `swarm/css/styles.css`, `v2/flyer.html`, and `swarm/flyer.html` as UTF-8 text.
- Produces: executable `main() -> int`; exit 0 with `PASS ScienceSwarm headline hierarchy`, otherwise exit 1 with a `FAIL:` diagnostic.

- [ ] **Step 1: Write the failing verifier**

Create a verifier using `html.parser.HTMLParser` that records text for elements carrying `hero__line--primary`, `hero__line--subtitle`, `flyer__title-primary`, and `flyer__title-subtitle`. Require these exact pairs:

```python
EXPECTED = {
    "hero__line--primary": "ScienceSwarm",
    "hero__line--subtitle": "Internet of Agents Hackathon",
    "flyer__title-primary": "ScienceSwarm",
    "flyer__title-subtitle": "Internet of Agents Hackathon",
}
```

Also assert:

```python
'<title>ScienceSwarm — Internet of Agents Hackathon</title>' in homepage
'<title>ScienceSwarm — Internet of Agents Hackathon Flyer</title>' in flyer
'.hero__line--subtitle' in stylesheet
'.flyer__title-subtitle' in flyer
flyer == public_flyer
```

Normalize nested-element text with `" ".join(text.split())`. Catch `AssertionError` and `FileNotFoundError`, print a specific failure, and return 1.

- [ ] **Step 2: Run the verifier and confirm it fails**

Run: `/home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_headline.py`

Expected: exit 1 because the current markup contains neither the new classes nor `ScienceSwarm`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify_scienceswarm_headline.py
git commit -m "Test ScienceSwarm headline hierarchy"
```

---

### Task 2: Implement the homepage and flyer hierarchy

**Files:**
- Modify: `swarm/index.html:6-7,77-83`
- Modify: `swarm/css/styles.css:442-462`
- Modify: `v2/flyer.html:6,154-178,335,386-389`
- Modify: `scripts/build_social_flyer.py:42-62,89-142`
- Test: `scripts/verify_scienceswarm_headline.py`

**Interfaces:**
- Consumes: the class and copy contract from Task 1.
- Produces: `.hero__line--primary`, `.hero__line--subtitle`, `.flyer__title-primary`, and `.flyer__title-subtitle`; updated document metadata and social captions.

- [ ] **Step 1: Replace homepage title copy and metadata**

Use:

```html
<title>ScienceSwarm — Internet of Agents Hackathon</title>
...
<h1 class="hero__title">
  <span class="hero__line hero__line--primary">Science<em>Swarm</em></span>
  <span class="hero__line hero__line--subtitle">Internet of Agents Hackathon</span>
</h1>
```

Update the homepage meta description and the hero/nav accessible labels to call the event `ScienceSwarm`, without changing their destination or purpose.

- [ ] **Step 2: Add homepage subtitle styling**

Keep the existing `.hero__title` size as the primary scale. Add:

```css
.hero__line--subtitle {
  margin-top: 0.55em;
  color: var(--ink-dim);
  font-family: var(--sans);
  font-size: clamp(1.1rem, 2.2vw, 2rem);
  font-weight: 300;
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;
}
```

Retain the existing second-line animation delay. At `max-width: 820px`, lower subtitle tracking to `0.04em` so the full phrase fits without horizontal overflow.

- [ ] **Step 3: Replace flyer title copy, metadata, and hierarchy**

Use:

```html
<title>ScienceSwarm — Internet of Agents Hackathon Flyer</title>
...
<main class="flyer" aria-label="ScienceSwarm — Internet of Agents Hackathon promotional flyer">
...
<h1 class="flyer__title" id="flyer-title">
  <span class="flyer__title-line flyer__title-primary">Science<em>Swarm</em></span>
  <span class="flyer__title-line flyer__title-subtitle">Internet of Agents Hackathon</span>
</h1>
```

Add:

```css
.flyer__title-subtitle {
  margin-top: 28px;
  color: var(--ink-dim);
  font-family: var(--sans);
  font-size: 38px;
  font-weight: 300;
  letter-spacing: 0.1em;
  line-height: 1.25;
  text-transform: uppercase;
}
```

Keep `.flyer__title-primary` at the inherited 108.8px display size. If browser geometry detects overlap, reduce the subtitle margin only; do not reduce the primary line below 108.8px.

- [ ] **Step 4: Update generated copy and browser-level hierarchy checks**

Change both social-caption openings to `Applications are open for ScienceSwarm: Internet of Agents Hackathon.` In `export_flyer()`, read computed styles from both headline classes and require:

```python
if float(primary["size"].removesuffix("px")) <= float(subtitle["size"].removesuffix("px")):
    raise RuntimeError("ScienceSwarm must be visually dominant")
if primary["text"] != "ScienceSwarm" or subtitle["text"] != "Internet of Agents Hackathon":
    raise RuntimeError("Flyer headline copy differs from the approved hierarchy")
```

Include `textContent.trim()` as `text` in both browser-evaluated style dictionaries. Preserve the existing font-readiness, 1600×900 canvas, overflow, logo, and application-URL checks.

- [ ] **Step 5: Run the focused verifier**

Copy the updated source flyer to its published HTML location before generation so the source-only contract can pass:

```bash
cp v2/flyer.html swarm/flyer.html
/home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_headline.py
```

Expected: `PASS ScienceSwarm headline hierarchy`.

- [ ] **Step 6: Commit the HTML/CSS implementation**

```bash
git add swarm/index.html swarm/css/styles.css v2/flyer.html swarm/flyer.html scripts/build_social_flyer.py
git commit -m "Feature ScienceSwarm in event headlines"
```

---

### Task 3: Regenerate, verify, and serve the local preview

**Files:**
- Modify (generated): `v2/assets/social/social-captions.md`
- Modify (generated): `v2/assets/social/swarm-hackathon-flyer-16x9.png`
- Modify (generated): `v2/assets/social/swarm-hackathon-flyer-16x9.pdf`
- Modify (generated): `swarm/flyer.html`
- Modify (generated): `swarm/assets/social/swarm-hackathon-flyer-16x9.png`
- Modify (generated): `swarm/assets/social/swarm-hackathon-flyer-16x9.pdf`
- Verify unchanged destination: `swarm/assets/social/swarm-apply-qr.svg`

**Interfaces:**
- Consumes: `scripts/build_social_flyer.py` and the updated `v2/flyer.html` from Task 2.
- Produces: synchronized downloadable flyer files and an HTTP localhost preview rooted at `swarm/`.

- [ ] **Step 1: Regenerate and publish flyer artifacts locally**

Run: `/home/fiona/miniconda3/bin/python scripts/build_social_flyer.py`

Expected: exit 0; browser checks confirm the approved copy, hierarchy, 1600×900 canvas, and no overflow.

- [ ] **Step 2: Run the full local verification suite**

```bash
/home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_headline.py
/home/fiona/miniconda3/bin/python scripts/verify_published_flyer.py
/home/fiona/miniconda3/bin/python scripts/verify_flyer_application.py
/home/fiona/miniconda3/bin/python scripts/verify_custom_domain_brand_assets.py
/home/fiona/miniconda3/bin/python scripts/verify_mit_footer.py
/home/fiona/miniconda3/bin/python scripts/verify_pr1_swarm_refresh.py --model-only
pdfinfo swarm/assets/social/swarm-hackathon-flyer-16x9.pdf
```

Expected: all scripts print `PASS`; `pdfinfo` reports one 1152×648-point page. Confirm the PNG separately:

```bash
file swarm/assets/social/swarm-hackathon-flyer-16x9.png
```

Expected: PNG image data, 1600 × 900.

- [ ] **Step 3: Commit generated assets**

```bash
git add v2/assets/social/social-captions.md v2/assets/social/swarm-hackathon-flyer-16x9.png v2/assets/social/swarm-hackathon-flyer-16x9.pdf swarm/flyer.html swarm/assets/social/swarm-hackathon-flyer-16x9.png swarm/assets/social/swarm-hackathon-flyer-16x9.pdf
git commit -m "Regenerate ScienceSwarm flyer assets"
```

- [ ] **Step 4: Start the localhost review server**

From the repository root run:

```bash
/home/fiona/miniconda3/bin/python -m http.server 4173 --directory swarm
```

Keep the process running and provide:

- Homepage: `http://localhost:4173/`
- Flyer HTML: `http://localhost:4173/flyer.html`
- Flyer PNG: `http://localhost:4173/assets/social/swarm-hackathon-flyer-16x9.png`
- Flyer PDF: `http://localhost:4173/assets/social/swarm-hackathon-flyer-16x9.pdf`

- [ ] **Step 5: Confirm production was untouched**

Run:

```bash
git status --short --branch
git log -4 --oneline
```

Expected: a clean local branch containing only the spec, plan, headline, and generated-asset commits. Do not push or invoke Vercel.
