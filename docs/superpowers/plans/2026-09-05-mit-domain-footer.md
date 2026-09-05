# MIT Domain Compliance Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a valid contact email and MIT Accessibility link to a semantic footer on every public page while preserving the flyer exports.

**Architecture:** Reuse the existing shared `.footer` component for the homepage and application page. Give the standalone flyer an equivalent browser-only footer below its fixed artwork, hidden during print export. Add one static verifier that treats all three public HTML files as the compliance surface.

**Tech Stack:** Static HTML/CSS, Python standard library, Playwright/Chromium, OpenCV, Vercel CLI

**Spec:** `docs/superpowers/specs/2026-09-05-mit-domain-footer-design.md`

## Global Constraints

- Contact destination and displayed address: `mailto:fw2@mit.edu` / `fw2@mit.edu`.
- Accessibility destination and link label: `https://accessibility.mit.edu/` / `Accessibility`.
- Exactly one semantic `<footer>` must exist in each of `v2/index.html`, `v2/apply.html`, and `v2/flyer.html`.
- The flyer footer is visible in browsers but excluded from PNG and PDF artwork.
- The flyer PNG remains 1600 × 900; the PDF remains one exact 16:9 page.

---

### Task 1: Add a failing compliance verifier

**Files:**
- Create: `scripts/verify_mit_footer.py`
- Test: `scripts/verify_mit_footer.py`

**Interfaces:**
- Consumes: the three public HTML files under `v2/`.
- Produces: exit code `0` only when every page has one footer with both exact destinations.

- [ ] **Step 1: Write the static verifier**

Use `html.parser.HTMLParser` to count `<footer>` elements and collect anchor `href` values only while inside each footer. For every public page, assert one footer, `mailto:fw2@mit.edu`, and `https://accessibility.mit.edu/`. Print one `PASS` line per page.

- [ ] **Step 2: Run the verifier and confirm the expected failure**

Run: `python scripts/verify_mit_footer.py`

Expected: non-zero exit because the homepage lacks both compliance destinations and the application and flyer pages lack semantic footers.

### Task 2: Implement the shared site footer

**Files:**
- Modify: `v2/index.html`
- Modify: `v2/apply.html`
- Modify: `v2/css/styles.css`
- Test: `scripts/verify_mit_footer.py`

**Interfaces:**
- Consumes: existing `.footer` styling and the exact destinations in Global Constraints.
- Produces: matching semantic compliance groups on the homepage and application page.

- [ ] **Step 1: Extend the homepage footer markup**

Preserve both existing text spans. Add a `.footer__compliance` navigation group with `Contact: <a href="mailto:fw2@mit.edu">fw2@mit.edu</a>` and `<a href="https://accessibility.mit.edu/">Accessibility</a>`.

- [ ] **Step 2: Add the application footer markup**

After `</main>` and before page scripts, add the same `.footer` structure and compliance group. Use the existing event and tagline text for consistency.

- [ ] **Step 3: Style links and responsive behavior**

In `v2/css/styles.css`, allow `.footer` to wrap, add consistent gaps, style `.footer__compliance`, and add visible gold hover and `:focus-visible` states. Preserve the existing stacked narrow-screen footer behavior.

- [ ] **Step 4: Run the verifier**

Run: `python scripts/verify_mit_footer.py`

Expected: homepage and application checks pass; flyer still fails because its footer is not implemented.

### Task 3: Add the browser-only flyer footer and preserve exports

**Files:**
- Modify: `v2/flyer.html`
- Modify: `scripts/build_social_flyer.py`
- Test: `scripts/verify_mit_footer.py`

**Interfaces:**
- Consumes: the fixed `.flyer` canvas and the existing Chromium exporter.
- Produces: a visible page footer that is absent from exported artwork.

- [ ] **Step 1: Add flyer footer markup and local styles**

After the `.flyer` main element, add one semantic `.flyer-site-footer` containing the exact contact and accessibility links. Style it as a compact black-and-gold footer below the artwork, with visible hover/focus states.

- [ ] **Step 2: Exclude the footer from print**

Add `.flyer-site-footer { display: none; }` within `@media print`. Keep PNG export scoped to `.flyer`.

- [ ] **Step 3: Update exporter overflow verification**

Replace the document-height assertion with checks that the document has no horizontal overflow and the `.flyer` canvas itself remains exactly 1600 × 900 without internal overflow. This permits the browser footer below the canvas while preserving both exports.

- [ ] **Step 4: Run the verifier and rebuild exports**

Run: `python scripts/verify_mit_footer.py`

Expected: all three pages pass.

Run: `python scripts/build_social_flyer.py`

Expected: successful PNG/PDF generation with loaded website fonts and no geometry errors.

### Task 4: Browser, export, and production verification

**Files:**
- Verify: `v2/index.html`
- Verify: `v2/apply.html`
- Verify: `v2/flyer.html`
- Verify: `v2/assets/social/swarm-hackathon-flyer-16x9.png`
- Verify: `v2/assets/social/swarm-hackathon-flyer-16x9.pdf`

**Interfaces:**
- Consumes: the complete implementation and generated artifacts.
- Produces: verified production compliance evidence.

- [ ] **Step 1: Run responsive browser checks**

Use Playwright at 1600, 820, and 390 pixels on all three pages. Assert one visible footer, exact link destinations, keyboard focus visibility, and no horizontal overflow.

- [ ] **Step 2: Verify exports**

Confirm the PNG is 1600 × 900. Use `pdfinfo` to confirm one 1152 × 648 point page. Rasterize the PDF and decode the QR code from both exports to `https://infinite-hackathon.vercel.app/apply.html`. Confirm neither export contains the browser footer.

- [ ] **Step 3: Commit and push**

Stage only the footer implementation, verifier, and regenerated exports. Commit with `Add MIT compliance footer to all pages`, then push to the existing `native-application-form` PR branch.

- [ ] **Step 4: Deploy and verify production**

Deploy `v2/` to the linked Vercel production project. Verify `/`, `/apply.html`, and `/flyer.html` return `200`, each live footer contains both exact destinations, and `https://accessibility.mit.edu/` is reachable.
