# Flyer Header Overlap Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate overlap between the full ScienceClaw wordmark and organizer logos in the 16:9 flyer header.

**Architecture:** Protect the rendered layout with a Playwright geometry assertion, then update only the canonical flyer’s fixed horizontal organizer positions. Run the existing flyer builder to synchronize the deployable HTML and generated PNG/PDF outputs.

**Tech Stack:** HTML/CSS, Python `unittest`, Playwright, PNG/PDF generation

**Spec:** `docs/superpowers/specs/2026-09-18-flyer-header-overlap-design.md`

## Global Constraints

- Keep the claw mark, full-size `ScienceClaw` wordmark, and institution logo sizes unchanged.
- Require at least 24 pixels between the brand and divider.
- Require at least 40 pixels between the divider and MIT logo.
- Preserve all non-header layout, copy, colors, and application panel geometry.

---

### Task 1: Separate the flyer header elements

**Files:**
- Modify: `scripts/test_scienceclaw_rebrand.py`
- Modify: `v2/flyer.html`
- Regenerate: `swarm/flyer.html`
- Regenerate: `swarm/assets/social/scienceclaw-hackathon-flyer-16x9.png`
- Regenerate: `swarm/assets/social/scienceclaw-hackathon-flyer-16x9.pdf`
- Regenerate: `v2/assets/social/scienceclaw-hackathon-flyer-16x9.png`
- Regenerate: `v2/assets/social/scienceclaw-hackathon-flyer-16x9.pdf`

**Interfaces:**
- Consumes: browser bounding boxes for `.brand`, `.organizers__divider`, and `.organizer--mit`
- Produces: a non-overlapping fixed 1600 × 900 flyer header

- [ ] **Step 1: Add the failing geometry regression test**

Render `swarm/flyer.html`, read the three real bounding boxes, and assert `brand.right + 24 <= divider.left` and `divider.right + 40 <= mit.left`.

- [ ] **Step 2: Verify the regression test fails**

Run: `PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/test_scienceclaw_rebrand.py -v`

Expected: FAIL because the brand currently extends past both the divider and MIT start position.

- [ ] **Step 3: Apply the approved spacing positions**

In `v2/flyer.html`, set `.organizers__divider` left to `450px`, `.organizer--mit` left to `500px`, `.organizer--lamm` left to `739px`, and `.organizer--e14` left to `1157px`.

- [ ] **Step 4: Regenerate and verify all flyer outputs**

Run: `PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/build_social_flyer.py`

Then run the focused test, the complete unit-test suite, all ScienceClaw brand verifiers, and `git diff --check`. Each command must exit 0.

- [ ] **Step 5: Inspect and publish the corrected preview**

Open the generated 1600 × 900 PNG at full resolution, deploy `swarm/` to a Vercel preview, and confirm the preview flyer contains the corrected header.
