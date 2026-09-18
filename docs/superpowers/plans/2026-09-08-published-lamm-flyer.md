# Published LAMM Flyer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the supplied official LAMM SVG on the flyer and publish synchronized HTML, PNG, and PDF flyer artifacts at `swarmhack.ai`.

**Architecture:** `v2/flyer.html` remains the flyer source, and `scripts/build_social_flyer.py` remains the generator. The generator exports PNG/PDF and then copies the browser flyer plus its QR and downloads into the deployable `swarm/` tree. A focused verifier proves logo provenance, removal of the legacy treatment, and byte-identical publication outputs.

**Tech Stack:** Static HTML/CSS/SVG, Python 3, Playwright, OpenCV, Vercel

**Spec:** `docs/superpowers/specs/2026-09-08-published-lamm-flyer-design.md`

## Global Constraints

- Use `/home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg` byte-for-byte.
- Render the official black SVG white with CSS; do not modify its paths.
- Remove the legacy LAMM lattice and typed-name treatment.
- Keep the application QR destination `https://swarmhack.ai/apply.html`.
- Publish stable HTML, PNG, and PDF URLs under `swarmhack.ai`.
- Add no new dependencies.

---

### Task 1: Official LAMM flyer and synchronized public artifacts

**Files:**
- Create: `scripts/verify_published_flyer.py`
- Create: `v2/assets/logos/LOGO_LAMM_full_black.svg`
- Modify: `v2/flyer.html:120-158,382-388`
- Modify: `scripts/build_social_flyer.py`
- Create: `swarm/flyer.html`
- Create: `swarm/assets/social/swarm-apply-qr.svg`
- Create: `swarm/assets/social/swarm-hackathon-flyer-16x9.png`
- Create: `swarm/assets/social/swarm-hackathon-flyer-16x9.pdf`
- Regenerate: `v2/assets/social/swarm-hackathon-flyer-16x9.png`
- Regenerate: `v2/assets/social/swarm-hackathon-flyer-16x9.pdf`

**Interfaces:**
- Consumes: exact supplied SVG path, `v2/flyer.html`, and existing QR/export paths.
- Produces: `publish_flyer() -> None` and synchronized deployable flyer artifacts.

- [ ] **Step 1: Write the failing publication verifier**

Create `scripts/verify_published_flyer.py`. Read the supplied logo, `v2/assets/logos/LOGO_LAMM_full_black.svg`, and `swarm/assets/logos/LOGO_LAMM_full_black.svg`; require byte equality. Parse `v2/flyer.html` and require exactly one image with class `organizer__lamm-logo` and source `assets/logos/LOGO_LAMM_full_black.svg`. Reject `organizer__lattice`, `organizer__lamm-name`, and `lamm-lattice-white-poster.png`.

Require byte equality for these source/public pairs:

```python
PUBLIC_PAIRS = {
    ROOT / "v2" / "flyer.html": ROOT / "swarm" / "flyer.html",
    ROOT / "v2" / "assets" / "social" / "swarm-apply-qr.svg": ROOT / "swarm" / "assets" / "social" / "swarm-apply-qr.svg",
    ROOT / "v2" / "assets" / "social" / "swarm-hackathon-flyer-16x9.png": ROOT / "swarm" / "assets" / "social" / "swarm-hackathon-flyer-16x9.png",
    ROOT / "v2" / "assets" / "social" / "swarm-hackathon-flyer-16x9.pdf": ROOT / "swarm" / "assets" / "social" / "swarm-hackathon-flyer-16x9.pdf",
}
```

Run: `/home/fiona/miniconda3/bin/python scripts/verify_published_flyer.py`

Expected: FAIL because the official v2 logo and published flyer files do not exist.

- [ ] **Step 2: Copy the exact supplied logo and replace the flyer markup**

Copy the supplied SVG to `v2/assets/logos/LOGO_LAMM_full_black.svg`. Replace the LAMM organizer children with:

```html
<img class="organizer__lamm-logo" src="assets/logos/LOGO_LAMM_full_black.svg"
  alt="Laboratory for Atomistic and Molecular Mechanics" />
```

Replace the legacy lattice/name CSS with a rule that sets the official image to `width: 365px`, `height: 60px`, `object-fit: contain`, and `filter: brightness(0) invert(1)`. Retain the 365-pixel organizer box so the existing four-pixel optical-gap assertion remains valid.

- [ ] **Step 3: Add deterministic publication synchronization**

In `scripts/build_social_flyer.py`, import `shutil`, define `PUBLIC_DIR = ROOT / "swarm"` and `PUBLIC_SOCIAL_DIR = PUBLIC_DIR / "assets" / "social"`, and implement:

```python
def publish_flyer() -> None:
    PUBLIC_SOCIAL_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(HTML_PATH, PUBLIC_DIR / "flyer.html")
    for source in (QR_PATH, PNG_PATH, PDF_PATH):
        shutil.copy2(source, PUBLIC_SOCIAL_DIR / source.name)
```

Call `publish_flyer()` after `export_flyer()` in `main()`.

- [ ] **Step 4: Strengthen the existing browser export checks**

Extend the Playwright geometry result with the official image count, natural width, and computed filter. Require one loaded `.organizer__lamm-logo`, reject a filter value of `none`, and retain the existing canvas, overflow, typography, organizer-gap, and hidden-URL assertions.

- [ ] **Step 5: Regenerate and pass local verification**

Run:

```bash
/home/fiona/miniconda3/bin/python scripts/build_social_flyer.py
/home/fiona/miniconda3/bin/python scripts/verify_published_flyer.py
/home/fiona/miniconda3/bin/python scripts/verify_flyer_application.py
/home/fiona/miniconda3/bin/python scripts/verify_mit_footer.py
pdfinfo swarm/assets/social/swarm-hackathon-flyer-16x9.pdf
```

Expected: all verifiers pass; PDF is one 1152 × 648 point page; PNG is 1600 × 900.

- [ ] **Step 6: Commit and push the deliverable**

```bash
git add scripts/build_social_flyer.py scripts/verify_published_flyer.py v2/flyer.html v2/assets/logos/LOGO_LAMM_full_black.svg v2/assets/social/swarm-hackathon-flyer-16x9.png v2/assets/social/swarm-hackathon-flyer-16x9.pdf swarm/flyer.html swarm/assets/social
git commit -m "Publish flyer with official LAMM logo"
git push fork native-application-form
```

- [ ] **Step 7: Deploy and verify public artifacts**

Deploy `swarm/` to `lamm/infinite-hackathon`, alias the resulting production deployment to `swarmhack.ai`, and require HTTPS 200 from the HTML, PNG, and PDF URLs. Download the public PNG/PDF and verify `file` reports 1600 × 900 PNG and `pdfinfo` reports one 1152 × 648 point PDF page.

