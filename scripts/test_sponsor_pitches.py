#!/usr/bin/env python3
"""Browser-level tests for the ScienceSwarm sponsor materials."""

from __future__ import annotations

import functools
import http.server
import re
import subprocess
import sys
import tempfile
import threading
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass


class SponsorPitchBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        handler = functools.partial(QuietHandler, directory=ROOT)
        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def test_sponsor_pages_are_publishable_static_documents(self) -> None:
        page = self.browser.new_page()
        try:
            for path in ("sponsor_pitches/deck.html", "sponsor_pitches/one-pager.html"):
                with self.subTest(path=path):
                    response = page.goto(f"{self.base_url}/{path}", wait_until="load")
                    self.assertIsNotNone(response)
                    self.assertEqual(response.status, 200)
        finally:
            page.close()

    def test_deck_renders_thirteen_approved_slides_in_order(self) -> None:
        expected_titles = [
            "Build the swarm that builds the future of science",
            "The next leap in scientific AI is coordination",
            "ScienceSwarm at a glance",
            "What teams build and validate",
            "Four challenge areas",
            "The event is a multi-agent experiment",
            "Where partners enter the swarm",
            "What partners gain",
            "A partner journey, not a logo placement",
            "What sponsorship unlocks",
            "Four ways to build with us",
            "Founding partnership benefits",
            "Build the swarm with us",
        ]
        page = self.browser.new_page(viewport={"width": 1600, "height": 900})
        try:
            page.goto(f"{self.base_url}/sponsor_pitches/deck.html", wait_until="load")
            slides = page.locator(".slide")
            self.assertEqual(slides.count(), 13)
            self.assertEqual(slides.evaluate_all("els => els.map(el => el.dataset.title)"), expected_titles)
        finally:
            page.close()

    def test_one_pager_renders_the_complete_compact_offer(self) -> None:
        page = self.browser.new_page(viewport={"width": 816, "height": 1056})
        try:
            page.goto(f"{self.base_url}/sponsor_pitches/one-pager.html", wait_until="load")
            sheet = page.locator(".sponsor-sheet")
            self.assertEqual(sheet.count(), 1)
            self.assertEqual(
                sheet.locator("h1").inner_text(),
                "Build the swarm that builds the future of science.",
            )
            self.assertEqual(sheet.locator(".sheet-fact").count(), 4)
            self.assertEqual(
                sheet.locator("[data-tier] strong").all_text_contents(),
                ["$5K", "$15K", "$30K", "$50K"],
            )
            self.assertEqual(sheet.locator("[data-capability-partner]").count(), 1)
        finally:
            page.close()

    def test_both_assets_expose_and_render_the_same_sponsorship_contract(self) -> None:
        expected_tiers = [
            {"key": "supporter", "name": "Supporter", "amount": "$5K", "representatives": 2, "summary": "Visibility, two passes, mentors, and showcase access."},
            {"key": "builder", "name": "Builder", "amount": "$15K", "representatives": 4, "summary": "Adds a workshop, toolkit placement, demo table, and opt-in directory."},
            {"key": "platform", "name": "Platform", "amount": "$30K", "representatives": 6, "summary": "Adds a challenge, judging, prominent branding, and curated introductions."},
            {"key": "presenting", "name": "Presenting", "amount": "$50K", "representatives": 8, "summary": "Adds premier attribution, stage time, private preview, and an outcomes report."},
        ]
        page = self.browser.new_page()
        try:
            for path in ("sponsor_pitches/deck.html", "sponsor_pitches/one-pager.html"):
                with self.subTest(path=path):
                    page.goto(f"{self.base_url}/{path}", wait_until="load")
                    contract = page.evaluate("window.SWARM_SPONSOR_CONTENT")
                    self.assertIsNotNone(contract)
                    self.assertEqual(contract["headline"], "Build the swarm that builds the future of science.")
                    self.assertEqual(contract["event"]["targetParticipants"], 150)
                    self.assertEqual(contract["event"]["contact"], "fw2@mit.edu")
                    self.assertEqual(contract["event"]["url"], "https://swarmhack.ai")
                    self.assertEqual(contract["tiers"], expected_tiers)
                    self.assertEqual(
                        contract["capabilityPartner"]["terms"],
                        "Compute, APIs, models, datasets, robots, sensors, fabrication, or laboratory access. Recognition is based on usable event value and support—not list price.",
                    )
                    self.assertEqual(len(contract["benefitRows"]), 10)
                    self.assertEqual(
                        contract["guardrails"],
                        {
                            "judging": "Sponsorship supports access and participation—not guaranteed outcomes or favorable judging.",
                            "privacy": "Participant information is shared only with explicit consent.",
                        },
                    )
                    rendered_tiers = page.locator("[data-tier]").evaluate_all(
                        "els => els.map(el => ({key: el.dataset.tier, name: el.querySelector('span').textContent.trim(), amount: el.querySelector('strong').textContent.trim(), summary: el.querySelector('p').textContent.trim()}))"
                    )
                    self.assertEqual(
                        rendered_tiers,
                        [
                            {key: value for key, value in tier.items() if key != "representatives"}
                            for tier in expected_tiers
                        ],
                    )
                    rendered_guardrails = page.locator("[data-shared-guardrails]").all_text_contents()
                    self.assertTrue(rendered_guardrails)
                    self.assertTrue(all(contract["guardrails"]["judging"] in text for text in rendered_guardrails))
                    self.assertTrue(all(contract["guardrails"]["privacy"] in text for text in rendered_guardrails))
                    if path.endswith("deck.html"):
                        matrix = page.locator("[data-shared-benefits-matrix] tr").evaluate_all(
                            "rows => rows.map(row => Array.from(row.children).map(cell => cell.textContent.trim()))"
                        )
                        self.assertEqual(
                            matrix,
                            [
                                [row["label"], *(row[tier["key"]] for tier in expected_tiers)]
                                for row in contract["benefitRows"]
                            ],
                        )
        finally:
            page.close()

    def test_artboards_have_exact_geometry_without_overflow_or_missing_images(self) -> None:
        cases = (
            ("deck.html", {"width": 1600, "height": 900}, ".slide", 13),
            ("one-pager.html", {"width": 816, "height": 1056}, ".sponsor-sheet", 1),
        )
        for path, viewport, selector, count in cases:
            with self.subTest(path=path):
                page = self.browser.new_page(viewport=viewport)
                try:
                    page.goto(f"{self.base_url}/sponsor_pitches/{path}", wait_until="networkidle")
                    geometry = page.locator(selector).evaluate_all(
                        """elements => elements.map(element => {
                          const rect = element.getBoundingClientRect();
                          return {
                            width: rect.width,
                            height: rect.height,
                            overflowX: element.scrollWidth > element.clientWidth,
                            overflowY: element.scrollHeight > element.clientHeight
                          };
                        })"""
                    )
                    self.assertEqual(len(geometry), count)
                    for artboard in geometry:
                        self.assertEqual(artboard["width"], viewport["width"])
                        self.assertEqual(artboard["height"], viewport["height"])
                        self.assertFalse(artboard["overflowX"])
                        self.assertFalse(artboard["overflowY"])
                    image_states = page.locator("img").evaluate_all(
                        "images => images.map(image => ({complete: image.complete, width: image.naturalWidth}))"
                    )
                    self.assertTrue(image_states)
                    self.assertTrue(all(item["complete"] and item["width"] > 0 for item in image_states))
                    loaded_font_families = set(page.evaluate(
                        """() => Array.from(document.fonts)
                          .filter(font => font.status === 'loaded')
                          .map(font => font.family.replaceAll('"', '').replaceAll("'", ''))"""
                    ))
                    self.assertTrue(
                        {"Bitter", "Inter", "IBM Plex Mono"}.issubset(loaded_font_families),
                        loaded_font_families,
                    )
                finally:
                    page.close()

    def test_deck_supports_keyboard_navigation_hashes_and_accessible_controls(self) -> None:
        page = self.browser.new_page(viewport={"width": 1600, "height": 900})
        try:
            page.goto(f"{self.base_url}/sponsor_pitches/deck.html", wait_until="load")
            self.assertTrue(page.locator("body").evaluate("body => body.classList.contains('is-presenting')"))
            self.assertEqual(page.locator(".slide[aria-hidden='false']").get_attribute("id"), "slide-1")
            self.assertEqual(page.locator(".deck-status").inner_text(), "01 / 13")
            page.keyboard.press("ArrowRight")
            self.assertEqual(page.locator(".slide[aria-hidden='false']").get_attribute("id"), "slide-2")
            self.assertEqual(page.evaluate("location.hash"), "#slide-2")
            self.assertEqual(page.locator(".deck-status").inner_text(), "02 / 13")
            page.keyboard.press("End")
            self.assertEqual(page.locator(".slide[aria-hidden='false']").get_attribute("id"), "slide-13")
            self.assertTrue(page.get_by_role("button", name="Previous slide").is_visible())
            self.assertTrue(page.get_by_role("button", name="Next slide").is_visible())
        finally:
            page.close()

    def test_exporter_builds_selectable_thirteen_page_and_letter_pdfs(self) -> None:
        exports = ROOT / "sponsor_pitches" / "exports"
        tracked_mtimes = {path: path.stat().st_mtime_ns for path in exports.glob("*.pdf")}
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary_exports = Path(temporary_directory)
            result = subprocess.run(
                [
                    sys.executable,
                    str(ROOT / "scripts" / "build_sponsor_pitches.py"),
                    "--output-dir",
                    str(temporary_exports),
                ],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(
                {path: path.stat().st_mtime_ns for path in exports.glob("*.pdf")},
                tracked_mtimes,
            )
            cases = (
                ("scienceswarm-founding-partnership-deck.pdf", 13, (1152, 648)),
                ("scienceswarm-sponsorship-opportunity.pdf", 1, (612, 792)),
            )
            for filename, expected_pages, expected_points in cases:
                for path in (temporary_exports / filename, exports / filename):
                    with self.subTest(path=str(path)):
                        self.assertTrue(path.is_file())
                        info = subprocess.run(
                            ["pdfinfo", str(path)], capture_output=True, text=True, check=True
                        ).stdout
                        pages = re.search(r"^Pages:\s+(\d+)$", info, re.MULTILINE)
                        size = re.search(r"^Page size:\s+([\d.]+) x ([\d.]+) pts", info, re.MULTILINE)
                        self.assertIsNotNone(pages)
                        self.assertIsNotNone(size)
                        self.assertEqual(int(pages.group(1)), expected_pages)
                        self.assertEqual(
                            (round(float(size.group(1))), round(float(size.group(2)))),
                            expected_points,
                        )
                        text = subprocess.run(
                            ["pdftotext", str(path), "-"], capture_output=True, text=True, check=True
                        ).stdout
                        self.assertIn("Build the swarm", text)
                        self.assertIn("$50K", text)
                generated_text = subprocess.run(
                    ["pdftotext", str(temporary_exports / filename), "-"],
                    capture_output=True,
                    text=True,
                    check=True,
                ).stdout
                committed_text = subprocess.run(
                    ["pdftotext", str(exports / filename), "-"],
                    capture_output=True,
                    text=True,
                    check=True,
                ).stdout
                self.assertEqual(" ".join(generated_text.split()), " ".join(committed_text.split()))

    def test_one_pager_uses_the_full_page_without_a_large_dead_zone(self) -> None:
        page = self.browser.new_page(viewport={"width": 816, "height": 1056})
        try:
            page.goto(f"{self.base_url}/sponsor_pitches/one-pager.html", wait_until="networkidle")
            gap = page.evaluate(
                """() => {
                  const tiers = document.querySelector('.sheet-tiers').getBoundingClientRect();
                  const footer = document.querySelector('.sheet-footer').getBoundingClientRect();
                  return footer.top - tiers.bottom;
                }"""
            )
            self.assertLessEqual(gap, 110)
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main()
