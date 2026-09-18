# ScienceSwarm Definition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revise the existing homepage copy so visitors immediately recognize ScienceSwarm as a hackathon for decentralized AI swarms solving scientific problems.

**Architecture:** Make copy-only changes in `swarm/index.html`; do not add sections or alter layout code. Add a focused Python verifier that enforces the approved text, preserved content, exact Section 06 fingerprint, and responsive no-overflow behavior through Playwright.

**Tech Stack:** Static HTML/CSS, Python 3, `html.parser`, Playwright/Chromium

**Spec:** `docs/superpowers/specs/2026-09-09-scienceswarm-definition-design.md`

## Global Constraints

- Hero text is exactly `ScienceSwarm is a hackathon for building decentralized AI swarms that solve real scientific and technical problems.`
- Revise only Hero, Purpose, Resources & Technology introduction/closing, Judging introduction, and the meta description.
- Section 06, `The Hackathon as a Multi-Agent System`, remains byte-for-byte unchanged within its comment boundaries.
- Preserve the flyer, dates, venue, application flow, challenge areas, six resource cards, detailed judging rubric, collaboration bonus, navigation, organizer branding, and visual system.
- Do not name or compare ScienceSwarm with another organization.
- Preview locally; do not deploy or push.

---

### Task 1: Add the ScienceSwarm definition contract

**Files:**
- Create: `scripts/verify_scienceswarm_definition.py`
- Test: `scripts/verify_scienceswarm_definition.py`

**Interfaces:**
- Consumes: `swarm/index.html` and its linked styles/assets.
- Produces: `main() -> int`, printing `PASS ScienceSwarm homepage definition` on success and `FAIL: <specific diagnostic>` on failure.

- [ ] **Step 1: Write the failing verifier**

Define exact required copy constants from the spec and assert each appears once after whitespace normalization. Extract content from `<!-- MULTI-AGENT SYSTEM -->` through immediately before `<!-- APPLY TEASER -->` and require:

```python
EXPECTED_SECTION_06_SHA256 = "2c929a5ed7b340f45d02684dd5ad22b228c3fbcc6e439b544514508b0335cd70"
```

Also require these preserved markers and counts:

```python
assert source.count('class="track reveal"') == 4
assert source.count('class="card reveal"') >= 13
assert "Collaboration Bonus: +10" in source
assert "Oct 30 – Nov 1, 2026" in source
assert 'href="apply.html"' in source
assert "The Hackathon as a Multi-Agent System" in source
```

Require that the superseded copy is absent:

```python
FORBIDDEN_OLD_COPY = (
    "A hackathon on decentralized AI swarms",
    "Explore what becomes possible when collaborative, decentralized agentic systems",
    "Teams have access to a common pool of resources",
    "The rubric rewards systems where collective organization itself contributes capability",
)
assert not [text for text in FORBIDDEN_OLD_COPY if text in normalized_source]
```

Use Playwright to open the homepage at desktop viewport 1440×900 and mobile viewport 390×844. At each width wait for `document.fonts.ready` and assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. Catch `AssertionError`, `FileNotFoundError`, and Playwright errors with a specific diagnostic and return 1.

- [ ] **Step 2: Run the verifier and confirm RED**

Run: `env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_definition.py`

Expected: exit 1 because the approved hero sentence is not present.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify_scienceswarm_definition.py
git commit -m "Test ScienceSwarm homepage definition"
```

---

### Task 2: Apply the approved copy and provide localhost review

**Files:**
- Modify: `swarm/index.html:7,83-87,116-124,158-174,225-229`
- Test: `scripts/verify_scienceswarm_definition.py`

**Interfaces:**
- Consumes: the exact source and responsive contract from Task 1.
- Produces: revised homepage copy with all preserved sections and assets intact.

- [ ] **Step 1: Update the meta description and Hero**

Set the meta description to:

```html
<meta name="description" content="ScienceSwarm is a hackathon for building decentralized AI swarms that solve real scientific and technical problems. MIT Media Lab, Oct 30 – Nov 1, 2026." />
```

Replace the hero paragraph with:

```html
<p class="hero__sub">
  ScienceSwarm is a hackathon for building decentralized AI swarms that solve real scientific and technical problems.
</p>
```

- [ ] **Step 2: Update Purpose**

Use exactly:

```html
<p class="lede reveal">
  ScienceSwarm explores when decentralized collective intelligence can produce capabilities beyond a single agent or conventional workflow.
</p>
<p class="reveal">
  Teams build working swarms of specialized agents, models, simulations, robots, sensors, and laboratory tools. Different parts of the swarm can hold distinct knowledge and capabilities, coordinate and adapt, and leave traceable scientific artifacts, provenance, findings, and unmet needs that the swarm can build upon—without requiring one central planner to prescribe the entire process.
</p>
```

- [ ] **Step 3: Update Resources & Technology around the unchanged six cards**

Use this introduction:

```html
<p class="lede reveal">
  ScienceSwarm is model- and framework-agnostic. Teams can combine frontier models, open models, their own models, existing agent frameworks, scientific datasets, compute, robots, sensors, and laboratory infrastructure.
</p>
```

Use this closing:

```html
<p class="reveal">
  The goal is not to prove that one model is best. Teams can use, reuse, modify, and combine available technology—including capabilities developed during the event—to build a functioning decentralized system that accomplishes something scientifically meaningful.
</p>
```

- [ ] **Step 4: Update the Judging introduction before the unchanged rubric**

```html
<p class="lede reveal">
  Science is the benchmark. Success is not simply whether an agent completed a task, but whether the system produced a scientifically meaningful result supported by evidence, validation, or measurable progress.
</p>
<p class="reveal">
  The judging rubric also asks whether organizing capabilities as a decentralized collective adds something beyond a single agent, isolated agents, or a conventional workflow.
</p>
```

- [ ] **Step 5: Run the focused verifier and complete suite**

```bash
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_definition.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python -m unittest discover -s scripts -p 'test_*.py'
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_scienceswarm_headline.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_published_flyer.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_flyer_application.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_custom_domain_brand_assets.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_mit_footer.py
env PYTHONDONTWRITEBYTECODE=1 /home/fiona/miniconda3/bin/python scripts/verify_pr1_swarm_refresh.py --model-only
```

Expected: every command exits 0 and prints its PASS/OK result.

- [ ] **Step 6: Commit the homepage revision**

```bash
git add swarm/index.html
git commit -m "Clarify the ScienceSwarm homepage definition"
```

- [ ] **Step 7: Start localhost review**

Run the server in a persistent session:

```bash
/home/fiona/miniconda3/bin/python -m http.server 4173 --directory swarm
```

Verify HTTP 200 and provide `http://localhost:4173/`. Do not push or deploy.
