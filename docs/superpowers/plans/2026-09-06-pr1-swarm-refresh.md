# PR #1 Swarm Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update PR #1 with upstream's current Swarm build and replace its animated LAMM header treatment with the supplied static SVG rendered white.

**Architecture:** Merge `origin/main` into `native-application-form` to adopt the complete upstream `swarm/` build, including the improved crane geometry in `swarm/js/scene.js`. Add one repository verifier for source fidelity and header semantics, then make the smallest markup/CSS/asset change necessary for the static inverted LAMM logo.

**Tech Stack:** Static HTML, CSS, ES modules/Three.js, Python 3 standard library, Git

**Spec:** `docs/superpowers/specs/2026-09-06-pr1-swarm-refresh-design.md`

## Global Constraints

- Preserve PR #1's native application form, MIT compliance footer, and branch-only functionality.
- Use `MaxwellBauer/Hackathon_Demo_Page` `main/swarm` as the source of truth for the updated Swarm implementation and 3D model.
- Keep `/home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg` byte-identical when copied.
- Render the supplied black SVG white with CSS `filter: invert(1)`; do not alter its paths.
- Do not redesign other organizer identities, navigation, page content, or model behavior.

---

### Task 1: Adopt the Upstream Swarm Build

**Files:**
- Create: `scripts/verify_pr1_swarm_refresh.py`
- Merge from: `origin/main`
- Verify: `swarm/js/scene.js`

**Interfaces:**
- Consumes: upstream commit `263a9f0` and expected model SHA-256 `6a5bbfe9dcbe2210fb803e3595978b9bd2a54695ae4d195a077bad560967e19b`.
- Produces: a PR branch containing the upstream `swarm/` tree and a verifier executable with `python3 scripts/verify_pr1_swarm_refresh.py --logo-source PATH`.

- [ ] **Step 1: Write the failing source-fidelity verifier**

Create a Python standard-library script that hashes `swarm/js/scene.js`, asserts the expected model SHA-256 above, and reports a clear mismatch or missing-file error. Add later logo checks behind a file-existence condition so this first test isolates model adoption.

- [ ] **Step 2: Run the verifier to verify it fails**

Run: `python3 scripts/verify_pr1_swarm_refresh.py --model-only`

Expected: FAIL because `swarm/js/scene.js` does not yet exist on the PR branch.

- [ ] **Step 3: Merge the current upstream main branch**

Run: `git merge --no-edit origin/main`

Expected: the `swarm/` tree is added and PR-specific `v2/` work remains present.

- [ ] **Step 4: Run the model verifier**

Run: `python3 scripts/verify_pr1_swarm_refresh.py --model-only`

Expected: PASS with the exact upstream model SHA-256.

- [ ] **Step 5: Commit the verifier**

```bash
git add scripts/verify_pr1_swarm_refresh.py
git commit -m "Verify PR1 Swarm refresh"
```

### Task 2: Replace the LAMM Header Treatment

**Files:**
- Create: `swarm/assets/logos/LOGO_LAMM_full_black.svg`
- Modify: `swarm/index.html`
- Modify: `swarm/css/styles.css`
- Modify: `scripts/verify_pr1_swarm_refresh.py`

**Interfaces:**
- Consumes: the supplied SVG path passed through `--logo-source` and the upstream Swarm header DOM.
- Produces: `.identity__lamm-logo`, a static image whose `src` is `assets/logos/LOGO_LAMM_full_black.svg`, with white rendering supplied by CSS.

- [ ] **Step 1: Extend the verifier with failing logo assertions**

Assert that the copied logo is byte-identical to `--logo-source`; the LAMM link contains exactly one `<img class="identity__lamm-logo">`; the image has a meaningful `alt`; no LAMM `<video>`, `.identity__lattice`, `.identity__lamm-word`, `.webm`, or `.mp4` references remain in the header; and `.identity__lamm-logo` has `filter: invert(1)` in the CSS.

- [ ] **Step 2: Run the full verifier to verify it fails**

Run: `python3 scripts/verify_pr1_swarm_refresh.py --logo-source /home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg`

Expected: FAIL because the static LAMM SVG and required markup are absent.

- [ ] **Step 3: Copy the approved logo asset**

Run: `cp /home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg swarm/assets/logos/LOGO_LAMM_full_black.svg`

- [ ] **Step 4: Replace the LAMM header markup**

Replace the video and separate wordmark inside `.identity--lamm` with:

```html
<img class="identity__lamm-logo"
  src="assets/logos/LOGO_LAMM_full_black.svg"
  alt="Laboratory for Atomistic and Molecular Mechanics" />
```

- [ ] **Step 5: Replace obsolete LAMM CSS selectors**

Remove `.identity__lattice` and `.identity__lamm-word` rules and responsive overrides. Add a scoped `.identity__lamm-logo` rule with proportional width/height, `display: block`, and `filter: invert(1)` while retaining the existing `.identity--lamm` layout and responsive dimensions.

- [ ] **Step 6: Run the full verifier**

Run: `python3 scripts/verify_pr1_swarm_refresh.py --logo-source /home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg`

Expected: PASS for model fidelity, logo fidelity, static header markup, and inversion CSS.

- [ ] **Step 7: Run syntax and existing regression checks**

Run: `node --check swarm/js/scene.js && python3 scripts/verify_mit_footer.py`

Expected: JavaScript syntax passes and all MIT footer checks pass.

- [ ] **Step 8: Commit the header change**

```bash
git add swarm/index.html swarm/css/styles.css swarm/assets/logos/LOGO_LAMM_full_black.svg scripts/verify_pr1_swarm_refresh.py
git commit -m "Use static LAMM logo in Swarm header"
```

### Task 3: Render, Audit, and Update PR #1

**Files:**
- Verify: `swarm/index.html`
- Verify: `swarm/apply.html`
- Verify: `swarm/css/styles.css`
- Verify: `swarm/js/scene.js`
- Verify: `swarm/assets/logos/LOGO_LAMM_full_black.svg`

**Interfaces:**
- Consumes: the completed static Swarm site.
- Produces: verified desktop/mobile render evidence and an updated remote PR head.

- [ ] **Step 1: Serve the Swarm directory**

Run: `python3 -m http.server 8000 --bind 127.0.0.1` from `swarm/`.

- [ ] **Step 2: Verify HTTP assets**

Request `/`, `/apply.html`, `/css/styles.css`, `/js/scene.js`, and `/assets/logos/LOGO_LAMM_full_black.svg`; require HTTP 200 and the expected content types.

- [ ] **Step 3: Capture desktop and mobile screenshots**

Use Chromium at 1440×900 and 390×844. Confirm the logo is white, legible, uncropped, aligned with MIT and E14, and the browser console has no page errors.

- [ ] **Step 4: Run the completion audit**

Run the full verifier, JavaScript syntax check, footer verifier, `git diff --check`, and `git status --short --branch`. Compare the local model hash with `origin/main:swarm/js/scene.js` again.

- [ ] **Step 5: Push the PR branch**

Run: `git push fork native-application-form`

Expected: GitHub PR #1 head advances to the verified local commit.

- [ ] **Step 6: Verify the remote PR head**

Run: `gh pr view 1 --repo MaxwellBauer/Hackathon_Demo_Page --json headRefOid,mergeStateStatus,url`

Expected: `headRefOid` matches local `HEAD`; report the PR URL and merge state.
