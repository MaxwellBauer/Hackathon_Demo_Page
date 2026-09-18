# ScienceClaw Full Wordmark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace abbreviated public “CLAW” wordmarks with the full “ScienceClaw” event name.

**Architecture:** Update the static HTML sources that own the homepage, application, and flyer wordmarks. Rebuild the flyer exports from the updated source and verify the rendered identity through the existing Playwright-based brand suite.

**Tech Stack:** HTML, CSS, Python `unittest`, Playwright, static asset build scripts

**Spec:** `docs/superpowers/specs/2026-09-18-scienceclaw-full-wordmark-design.md`

## Global Constraints

- The visible event wordmark must be exactly `ScienceClaw`.
- Keep the existing claw mark, layout, colors, links, dates, and form content unchanged.
- Generated flyer exports must match `swarm/flyer.html`.

---

### Task 1: Use the full ScienceClaw wordmark

**Files:**
- Modify: `scripts/test_scienceclaw_rebrand.py`
- Modify: `swarm/index.html`
- Modify: `swarm/apply.html`
- Modify: `swarm/flyer.html`
- Regenerate: `swarm/assets/social/scienceclaw-hackathon-flyer-16x9.png`
- Regenerate: `swarm/assets/social/scienceclaw-hackathon-flyer-16x9.pdf`
- Regenerate: `v2/assets/social/scienceclaw-hackathon-flyer-16x9.png`
- Regenerate: `v2/assets/social/scienceclaw-hackathon-flyer-16x9.pdf`

**Interfaces:**
- Consumes: existing `.identity__scienceclaw-word` and `.brand__name` text nodes
- Produces: the exact visible text `ScienceClaw` on all three public surfaces

- [ ] **Step 1: Write the failing test**

Add a rendered-identity assertion that `swarm/index.html`, `swarm/apply.html`, and `swarm/flyer.html` expose `ScienceClaw` in their primary brand text nodes and never expose a standalone `CLAW` value.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/test_scienceclaw_rebrand.py -v`

Expected: FAIL because the three wordmarks currently contain `CLAW`.

- [ ] **Step 3: Write the minimal implementation**

Change only the three brand text nodes from `CLAW` to `ScienceClaw`, then run `scripts/build_social_flyer.py` to rebuild the published flyer exports.

- [ ] **Step 4: Run verification**

Run: `PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python -m unittest discover -s scripts -p 'test_*.py'`

Expected: 20 or more tests pass with zero failures.

Run the ScienceClaw brand verifiers and `git diff --check`; each command must exit 0.

- [ ] **Step 5: Review the preview deployment**

Deploy `swarm/` to a Vercel preview and confirm the homepage, application, and flyer display the full `ScienceClaw` wordmark.
