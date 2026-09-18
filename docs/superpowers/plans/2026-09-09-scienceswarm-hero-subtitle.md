# ScienceSwarm Hero Subtitle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the approved ScienceSwarm hackathon definition into the hero headline subtitle and remove the duplicate paragraph beneath it.

**Architecture:** Keep the existing two-line `h1` structure, changing only the second line’s copy and presentation. Update both source verifiers to model the sentence as the hero subtitle, add a regression test for the new semantic placement, and preserve flyer expectations independently.

**Tech Stack:** Static HTML/CSS, Python 3 `html.parser`, `unittest`, Playwright/Chromium

**Spec:** `docs/superpowers/specs/2026-09-09-scienceswarm-hero-subtitle-design.md`

## Global Constraints

- Keep the primary headline exactly `ScienceSwarm`.
- Set the visible `h1` subtitle exactly to `A hackathon for building decentralized AI swarms that solve real scientific and technical problems.`
- Remove `.hero__sub` from homepage markup and remove its now-unused CSS rule.
- Use sentence case with no uppercase transformation, reduced letter spacing, natural wrapping, and a smaller font than `ScienceSwarm`.
- Preserve document title, meta description, gold accent, font families, animation, event details, actions, statistics, Purpose and all later homepage sections, application page, and flyer.
- The flyer subtitle remains exactly `Internet of Agents Hackathon`.
- No horizontal overflow at desktop 1440×900 or mobile 390×844.
- Keep the result on localhost; do not push or deploy.

---

### Task 1: Implement and verify the descriptive hero subtitle

**Files:**
- Modify: `scripts/test_verify_scienceswarm_definition.py`
- Modify: `scripts/verify_scienceswarm_definition.py`
- Modify: `scripts/verify_scienceswarm_headline.py`
- Modify: `swarm/index.html:79-86`
- Modify: `swarm/css/styles.css:450-466,616-621,1047`

**Interfaces:**
- Consumes: `HERO_DEFINITION` from `scripts/verify_scienceswarm_definition.py` and the existing headline parser contract.
- Produces: a single descriptive `.hero__line--subtitle` inside `h1`, no `.hero__sub`, and passing source/browser verification while retaining the independent flyer subtitle contract.

- [ ] **Step 1: Add the failing semantic-placement regression**

Add this test helper and regression to `DefinitionVerifierTests`:

```python
def homepage_with_definition_in_subtitle(self) -> str:
    source = MODULE.HOMEPAGE.read_text(encoding="utf-8")
    source = source.replace(
        '<span class="hero__line hero__line--subtitle">Internet of Agents Hackathon</span>',
        f'<span class="hero__line hero__line--subtitle">{MODULE.HERO_DEFINITION}</span>',
        1,
    )
    return source.replace(
        '      <p class="hero__sub">\n'
        f"        {MODULE.HERO_DEFINITION}\n"
        "      </p>\n",
        "",
        1,
    )

def test_accepts_definition_in_heading_without_duplicate_paragraph(self) -> None:
    MODULE.verify_copy(self.homepage_with_definition_in_subtitle())
```

This exercises the real verifier against the desired markup before production HTML changes.

- [ ] **Step 2: Run RED**

Run:

```bash
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/test_verify_scienceswarm_definition.py
```

Expected: the new test fails because `verify_copy()` still requires one `.hero__sub` paragraph.

- [ ] **Step 3: Update the definition verifier’s semantic contract**

Change `HomepageParser` to collect text from `span.hero__line--subtitle` as `hero_subtitles`. In `verify_copy()` require:

```python
assert parser.hero_subtitles == [HERO_DEFINITION], (
    "hero headline subtitle must contain exactly the approved ScienceSwarm definition"
)
assert 'class="hero__sub"' not in source, (
    "duplicate hero description paragraph must be removed"
)
```

Keep the meta-description requirement and every Purpose, Resources, Judging, preservation, Section 06, and layout check unchanged.
Extend `verify_layout()` to read the computed font sizes of `.hero__line--primary` and `.hero__line--subtitle` at both viewports and assert the primary size is larger. Also assert the subtitle's computed `textTransform` is `none`.

- [ ] **Step 4: Update the cross-page headline contract**

In `scripts/verify_scienceswarm_headline.py`, change only:

```python
"hero__line--subtitle": (
    "A hackathon for building decentralized AI swarms that solve real scientific "
    "and technical problems."
),
```

Keep `flyer__title-subtitle` equal to `Internet of Agents Hackathon` and preserve all title/parity checks.
Add `assert ".hero__sub" not in stylesheet` so the removed paragraph's unused style cannot remain.

- [ ] **Step 5: Update hero markup**

Use:

```html
<h1 class="hero__title">
  <span class="hero__line hero__line--primary">Science<em>Swarm</em></span>
  <span class="hero__line hero__line--subtitle">A hackathon for building decentralized AI swarms that solve real scientific and technical problems.</span>
</h1>
```

Delete the adjacent `.hero__sub` paragraph completely.

- [ ] **Step 6: Update subtitle styling and spacing**

Replace the current subtitle rule with:

```css
.hero__line--subtitle {
  max-width: min(900px, 90vw);
  margin: 0.7em auto 0;
  color: var(--ink-dim);
  font-family: var(--sans);
  font-size: clamp(1rem, 1.65vw, 1.5rem);
  font-weight: 300;
  letter-spacing: 0.01em;
  line-height: 1.4;
  text-transform: none;
}
```

Delete the unused `.hero__sub` rule. Change `.hero__actions` margin-top from `2.4rem` to `2rem`. Delete the mobile-only `.hero__line--subtitle { letter-spacing: 0.04em; }` override so the base sentence-case tracking applies at every width.

- [ ] **Step 7: Run GREEN and the complete suite**

```bash
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/test_verify_scienceswarm_definition.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python -m unittest discover -s scripts -p 'test_*.py'
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_definition.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_headline.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_published_flyer.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_flyer_application.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_custom_domain_brand_assets.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_mit_footer.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_pr1_swarm_refresh.py --model-only
curl -fsSI http://localhost:4173/
```

Expected: 3 unit tests pass, all verifiers print PASS, and localhost returns HTTP 200. The definition verifier’s Playwright run proves no horizontal overflow at both required viewports.

- [ ] **Step 8: Commit**

```bash
git add scripts/test_verify_scienceswarm_definition.py scripts/verify_scienceswarm_definition.py scripts/verify_scienceswarm_headline.py swarm/index.html swarm/css/styles.css
git commit -m "Feature ScienceSwarm purpose in hero subtitle"
```
