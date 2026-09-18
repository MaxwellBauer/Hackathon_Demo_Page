# Application Header Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Swarm application page use the homepage's exact organizer logo set and static LAMM treatment.

**Architecture:** Extend the existing Python verifier to compare the organizer institution blocks across both pages and reject legacy LAMM media. Replace only the application page's institution block; reuse existing assets and CSS without introducing shared-header JavaScript.

**Tech Stack:** Static HTML/CSS, Python 3 standard library, Playwright/Chromium, Vercel CLI

**Spec:** `docs/superpowers/specs/2026-09-06-application-header-parity-design.md`

## Global Constraints

- Preserve every application form field and its submission behavior.
- Preserve application-specific `Back to site` navigation.
- Use the homepage's SWARM, MIT, static full LAMM SVG, and E14 identities in the same order.
- Do not change homepage markup or unrelated page content.

---

### Task 1: Enforce and Implement Header Parity

**Files:**
- Modify: `scripts/verify_pr1_swarm_refresh.py`
- Modify: `swarm/apply.html`

**Interfaces:**
- Consumes: `.identity__institutions` from `swarm/index.html` as the canonical organizer block.
- Produces: the same `.identity__institutions` content in `swarm/apply.html`, while retaining application-specific links outside that block.

- [ ] **Step 1: Write the failing parity assertion**

Extend the verifier to extract the first `.identity__institutions` element from each HTML file, normalize insignificant whitespace, and assert equality. Also reject `identity__lattice`, `identity__lamm-word`, `<video>`, `.webm`, and `.mp4` in the application organizer header.

- [ ] **Step 2: Verify the assertion fails on the legacy application header**

Run: `python3 scripts/verify_pr1_swarm_refresh.py --logo-source /home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg`

Expected: FAIL reporting organizer header mismatch.

- [ ] **Step 3: Replace only the application institution block**

Copy the homepage's `.identity__institutions` block into `swarm/apply.html`. Leave the SWARM home link, mobile `Back to site` action, desktop application navigation, and form unchanged.

- [ ] **Step 4: Run all static checks**

Run: `python3 scripts/verify_pr1_swarm_refresh.py --logo-source /home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg && node --check swarm/js/scene.js && python3 scripts/verify_mit_footer.py && git diff --check`

Expected: all checks PASS.

- [ ] **Step 5: Commit the implementation**

```bash
git add scripts/verify_pr1_swarm_refresh.py swarm/apply.html
git commit -m "Match application organizer header"
```

### Task 2: Render, Push, and Deploy

**Files:**
- Verify: `swarm/apply.html`
- Verify: `swarm/index.html`

**Interfaces:**
- Consumes: completed static site on `native-application-form`.
- Produces: updated PR #1 and production deployment at `https://infinite-hackathon.vercel.app/`.

- [ ] **Step 1: Render responsive application headers**

Serve `swarm/` locally and capture `apply.html` at 1440×900 and 390×844. Require visible nonzero bounding boxes for SWARM, MIT, LAMM, and E14; require the LAMM computed filter to be `invert(1)`; inspect both screenshots for alignment and clipping.

- [ ] **Step 2: Push PR #1**

Run: `git push fork native-application-form`, then confirm PR #1's `headRefOid` equals local `HEAD` and it remains mergeable.

- [ ] **Step 3: Deploy the verified Swarm directory**

Stage `swarm/` in a temporary directory with the existing `infinite-hackathon` `.vercel/project.json`, run `vercel deploy <temp-dir> --prod --yes`, and explicitly assign `infinite-hackathon.vercel.app` to the resulting deployment.

- [ ] **Step 4: Verify production**

Require HTTP 200 for `/apply.html` and all four logo assets. Verify the live application HTML has the static LAMM SVG and no legacy LAMM video; compare its normalized institution block with the live homepage.
