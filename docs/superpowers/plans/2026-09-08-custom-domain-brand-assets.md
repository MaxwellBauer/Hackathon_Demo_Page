# Custom Domain Brand Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the gold crane as a broadly compatible browser icon and repoint every flyer application artifact to `https://swarmhack.ai/apply.html`.

**Architecture:** Treat the existing SVG crane and the flyer build script as sources of truth. A small Playwright/Pillow builder derives raster favicon formats, while the flyer generator continues to derive its QR, captions, PNG, and PDF from one `APPLICATION_URL` constant. A focused verification script checks HTML metadata, generated image validity, flyer links, and decoded QR content.

**Tech Stack:** Static HTML/SVG, Python 3, Playwright, Pillow, OpenCV

**Spec:** `docs/superpowers/specs/2026-09-08-custom-domain-brand-assets-design.md`

## Global Constraints

- Keep the existing gold origami crane artwork.
- Use `https://swarmhack.ai/apply.html` as the canonical flyer application URL.
- Do not make the application URL visible in the flyer artwork.
- Do not alter the visible header crane.
- Add no new third-party dependencies.

---

### Task 1: Cross-browser gold crane favicon

**Files:**
- Create: `scripts/build_favicons.py`
- Create: `scripts/verify_custom_domain_brand_assets.py`
- Create: `swarm/assets/logos/swarm-favicon-32.png`
- Create: `swarm/assets/logos/apple-touch-icon.png`
- Create: `swarm/assets/logos/favicon.ico`
- Modify: `swarm/index.html:8`
- Modify: `swarm/apply.html:8`

**Interfaces:**
- Consumes: `swarm/assets/logos/swarm-favicon.svg` as the canonical artwork.
- Produces: `build_favicons() -> None`, PNG files at 32 × 32 and 180 × 180, and an ICO containing 16, 32, and 48 pixel frames.

- [ ] **Step 1: Write the failing favicon verification**

Create `scripts/verify_custom_domain_brand_assets.py` with `verify_favicons()`. Parse both public `swarm` HTML pages and require these exact references:

```python
EXPECTED_ICON_HREFS = {
    "assets/logos/swarm-favicon.svg?v=2",
    "assets/logos/swarm-favicon-32.png?v=2",
    "assets/logos/favicon.ico?v=2",
    "assets/logos/apple-touch-icon.png?v=2",
}
```

Open the PNG and ICO files with `PIL.Image`, assert PNG sizes `(32, 32)` and `(180, 180)`, assert ICO format `ICO`, and assert the icon images contain a non-empty alpha bounding box.

- [ ] **Step 2: Run the verification to prove it fails**

Run: `/home/fiona/miniconda3/bin/python scripts/verify_custom_domain_brand_assets.py`

Expected: nonzero exit because the PNG/ICO assets and expanded HTML references do not exist.

- [ ] **Step 3: Add the repeatable favicon builder**

Create `scripts/build_favicons.py`. Use `playwright.sync_api.sync_playwright()` to open `swarm-favicon.svg`, set the root SVG to exactly 512 × 512 pixels, and capture a transparent PNG. Use `PIL.Image.open(...).convert("RGBA")` and Lanczos resizing to write:

```python
RASTER_TARGETS = {
    LOGO_DIR / "swarm-favicon-32.png": (32, 32),
    LOGO_DIR / "apple-touch-icon.png": (180, 180),
}
```

Save `favicon.ico` with `sizes=[(16, 16), (32, 32), (48, 48)]`. Use a temporary directory for the 512-pixel browser capture and leave no intermediate file in the repository.

- [ ] **Step 4: Add versioned favicon metadata to both pages**

Replace the single favicon line in both `swarm/index.html` and `swarm/apply.html` with:

```html
<link rel="icon" type="image/svg+xml" href="assets/logos/swarm-favicon.svg?v=2" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/logos/swarm-favicon-32.png?v=2" />
<link rel="icon" type="image/x-icon" href="assets/logos/favicon.ico?v=2" />
<link rel="apple-touch-icon" sizes="180x180" href="assets/logos/apple-touch-icon.png?v=2" />
```

- [ ] **Step 5: Generate and verify the favicon assets**

Run:

```bash
/home/fiona/miniconda3/bin/python scripts/build_favicons.py
/home/fiona/miniconda3/bin/python scripts/verify_custom_domain_brand_assets.py
file swarm/assets/logos/swarm-favicon-32.png swarm/assets/logos/apple-touch-icon.png swarm/assets/logos/favicon.ico
```

Expected: the verifier prints `PASS favicons`; `file` identifies two PNG images and one MS Windows icon resource.

- [ ] **Step 6: Commit the favicon deliverable**

```bash
git add scripts/build_favicons.py scripts/verify_custom_domain_brand_assets.py swarm/index.html swarm/apply.html swarm/assets/logos/swarm-favicon-32.png swarm/assets/logos/apple-touch-icon.png swarm/assets/logos/favicon.ico
git commit -m "Add cross-browser Swarm favicons"
```

### Task 2: Custom-domain flyer application artifacts

**Files:**
- Modify: `scripts/build_social_flyer.py:18`
- Modify: `scripts/verify_custom_domain_brand_assets.py`
- Modify: `v2/flyer.html:411`
- Regenerate: `v2/assets/social/swarm-apply-qr.svg`
- Regenerate: `v2/assets/social/social-captions.md`
- Regenerate: `v2/assets/social/swarm-hackathon-flyer-16x9.png`
- Regenerate: `v2/assets/social/swarm-hackathon-flyer-16x9.pdf`

**Interfaces:**
- Consumes: `APPLICATION_URL` in `scripts/build_social_flyer.py`.
- Produces: flyer HTML, QR, captions, PNG, and PDF whose application destination is exactly `https://swarmhack.ai/apply.html`.

- [ ] **Step 1: Extend verification and prove the old artifacts fail**

Add `verify_flyer()` to `scripts/verify_custom_domain_brand_assets.py`. Import `APPLICATION_URL`, require it to equal the custom-domain URL, require the `v2/flyer.html` application panel and both social caption links to contain it, and reject `infinite-hackathon.vercel.app` in those text files.

Parse `swarm-apply-qr.svg` with `xml.etree.ElementTree`, rasterize its background and `<rect>` runs into a NumPy array at 12 pixels per SVG unit, then decode it with `cv2.QRCodeDetector().detectAndDecode()`. Require the decoded value to equal the custom-domain URL.

Run: `/home/fiona/miniconda3/bin/python scripts/verify_custom_domain_brand_assets.py`

Expected: nonzero exit because the generator and current artifacts still contain the old Vercel URL.

- [ ] **Step 2: Update the flyer sources**

Change the generator constant to:

```python
APPLICATION_URL = "https://swarmhack.ai/apply.html"
```

Change the `.apply-panel` link in `v2/flyer.html` to the same URL. Keep the visible panel labels unchanged.

- [ ] **Step 3: Regenerate all flyer outputs**

Run: `/home/fiona/miniconda3/bin/python scripts/build_social_flyer.py`

Expected: exit 0 and updated QR SVG, captions, 1600 × 900 PNG, and single-page 16:9 PDF.

- [ ] **Step 4: Run focused and repository verification**

Run:

```bash
/home/fiona/miniconda3/bin/python scripts/verify_custom_domain_brand_assets.py
/home/fiona/miniconda3/bin/python scripts/verify_mit_footer.py
/home/fiona/miniconda3/bin/python scripts/verify_pr1_swarm_refresh.py --model-only
pdfinfo v2/assets/social/swarm-hackathon-flyer-16x9.pdf
```

Expected: brand verifier prints `PASS favicons` and `PASS flyer https://swarmhack.ai/apply.html`; footer verifier passes all three pages; PR verifier passes the approved model checksum; PDF is one 16 × 9 inch page.

- [ ] **Step 5: Verify the live application endpoint**

Run: `curl -fsSIL --max-time 30 https://swarmhack.ai/apply.html`

Expected: final HTTP status `200` over HTTPS.

- [ ] **Step 6: Commit the flyer deliverable**

```bash
git add scripts/build_social_flyer.py scripts/verify_custom_domain_brand_assets.py v2/flyer.html v2/assets/social/swarm-apply-qr.svg v2/assets/social/social-captions.md v2/assets/social/swarm-hackathon-flyer-16x9.png v2/assets/social/swarm-hackathon-flyer-16x9.pdf
git commit -m "Point flyer applications to swarmhack.ai"
```

### Task 3: Publish and verify the updated PR build

**Files:**
- Modify: none

**Interfaces:**
- Consumes: committed PR branch at its new HEAD.
- Produces: updated remote PR #1 branch and a production Vercel deployment aliased to `swarmhack.ai`.

- [ ] **Step 1: Confirm the release tree is clean**

Run: `git status --short --branch && git log --oneline -4`

Expected: the feature branch is ahead of `fork/native-application-form` with no unstaged or untracked files.

- [ ] **Step 2: Push the PR branch**

Run: `git push fork native-application-form`

Expected: the remote PR branch advances to the local HEAD.

- [ ] **Step 3: Deploy the public `swarm` directory**

Run from `swarm/`: `vercel --prod --scope lamm --yes`

Expected: Vercel reports a Ready production deployment for `lamm/infinite-hackathon`.

- [ ] **Step 4: Verify the deployed release**

Run:

```bash
vercel domains verify swarmhack.ai --scope lamm
curl -fsSIL --max-time 30 https://swarmhack.ai/
curl -fsSIL --max-time 30 https://swarmhack.ai/apply.html
curl -fsS --max-time 30 https://swarmhack.ai/ | sha256sum
sha256sum swarm/index.html
```

Expected: Vercel reports `configured_correctly`; both endpoints return final status `200`; the deployed and local homepage SHA-256 hashes match.

