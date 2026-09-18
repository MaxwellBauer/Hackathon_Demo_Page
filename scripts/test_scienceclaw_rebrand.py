"""End-to-end regression coverage for the active ScienceClaw identity."""

from __future__ import annotations

import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ACTIVE_PAGES = (
    ROOT / "swarm" / "index.html",
    ROOT / "swarm" / "apply.html",
    ROOT / "swarm" / "flyer.html",
    ROOT / "sponsor_pitches" / "deck.html",
    ROOT / "sponsor_pitches" / "one-pager.html",
)
APPLICATION_URL = "https://scienceclaw.dev/apply.html"


class ScienceClawRenderedIdentityTests(unittest.TestCase):
    """Catch stale public branding in the pages people actually see."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def test_active_pages_render_scienceclaw_without_retired_branding(self) -> None:
        for path in ACTIVE_PAGES:
            with self.subTest(page=path.relative_to(ROOT)):
                page = self.browser.new_page()
                page.goto(path.as_uri(), wait_until="domcontentloaded")
                text = page.locator("body").inner_text()
                page.close()

                self.assertIn("scienceclaw", text.casefold())
                self.assertNotIn("scienceswarm", text.casefold())
                self.assertNotIn("swarmhack", text.casefold())
                self.assertIsNone(re.search(r"\bswarms?\b", text, re.IGNORECASE))

    def test_active_calls_to_action_use_scienceclaw_domain(self) -> None:
        expected_external_pages = (
            ROOT / "swarm" / "flyer.html",
            ROOT / "sponsor_pitches" / "deck.html",
            ROOT / "sponsor_pitches" / "one-pager.html",
        )
        for path in expected_external_pages:
            with self.subTest(page=path.relative_to(ROOT)):
                page = self.browser.new_page()
                page.goto(path.as_uri(), wait_until="domcontentloaded")
                hrefs = page.locator("a").evaluate_all(
                    "links => links.map(link => link.href).filter(href => href.includes('scienceclaw.dev'))"
                )
                page.close()
                self.assertTrue(hrefs)
                self.assertTrue(all(href.startswith("https://scienceclaw.dev") for href in hrefs))

    def test_public_wordmarks_use_full_scienceclaw_name(self) -> None:
        wordmarks = (
            (ROOT / "swarm" / "index.html", ".identity__scienceclaw-word"),
            (ROOT / "swarm" / "apply.html", ".identity__scienceclaw-word"),
            (ROOT / "swarm" / "flyer.html", ".brand__name"),
        )
        for path, selector in wordmarks:
            with self.subTest(page=path.relative_to(ROOT)):
                page = self.browser.new_page()
                page.goto(path.as_uri(), wait_until="domcontentloaded")
                wordmark = page.locator(selector).inner_text()
                page.close()
                self.assertEqual(wordmark, "ScienceClaw")

    def test_flyer_header_keeps_brand_separate_from_organizers(self) -> None:
        page = self.browser.new_page(viewport={"width": 1600, "height": 900})
        page.goto((ROOT / "swarm" / "flyer.html").as_uri(), wait_until="networkidle")

        brand = page.locator(".brand").bounding_box()
        divider = page.locator(".organizers__divider").bounding_box()
        mit = page.locator(".organizer--mit").bounding_box()
        page.close()

        self.assertIsNotNone(brand)
        self.assertIsNotNone(divider)
        self.assertIsNotNone(mit)
        assert brand is not None and divider is not None and mit is not None
        brand_right = brand["x"] + brand["width"]
        divider_right = divider["x"] + divider["width"]
        self.assertLessEqual(brand_right + 24, divider["x"])
        self.assertLessEqual(divider_right + 40, mit["x"])

    def test_application_groups_profile_links_with_personal_information(self) -> None:
        page = self.browser.new_page()
        page.goto((ROOT / "swarm" / "apply.html").as_uri(), wait_until="domcontentloaded")

        personal = page.locator('section[aria-labelledby="personal-info-heading"]')
        consent = page.locator('section[aria-labelledby="consent-heading"]')
        link_names = personal.locator('input[type="url"]').evaluate_all(
            "inputs => inputs.map(input => input.name)"
        )

        self.assertEqual(
            link_names,
            ["personal_website", "github", "linkedin", "instagram"],
        )
        self.assertEqual(
            consent.locator(".apply-form__section-note").inner_text(),
                "We will share personal information.",
        )
        page.close()

    def test_application_omits_risd_and_resume_collection(self) -> None:
        page = self.browser.new_page()
        page.goto((ROOT / "swarm" / "apply.html").as_uri(), wait_until="domcontentloaded")

        institution_values = page.locator('input[name="institution"]').evaluate_all(
            "inputs => inputs.map(input => input.value)"
        )
        visible_text = page.locator("body").inner_text()

        self.assertEqual(institution_values, ["MIT", "Harvard", "Other"])
        self.assertNotIn("RISD", visible_text)
        self.assertNotIn("Resume/CV", visible_text)
        self.assertEqual(page.locator(".dropbox-upload").count(), 0)
        page.close()


class ScienceClawArtifactTests(unittest.TestCase):
    """Catch missing or stale generated identity assets."""

    def test_origami_pincer_is_the_canonical_public_mark(self) -> None:
        logo = ROOT / "swarm" / "assets" / "logos" / "scienceclaw-mark.svg"
        favicon = ROOT / "swarm" / "assets" / "logos" / "scienceclaw-favicon.svg"
        for path in (logo, favicon):
            self.assertTrue(path.is_file(), path)
            root = ET.parse(path).getroot()
            title = root.find("{http://www.w3.org/2000/svg}title")
            self.assertIsNotNone(title)
            self.assertIn("ScienceClaw", title.text or "")

        source = logo.read_text(encoding="utf-8")
        self.assertIn('class="jaw jaw--upper"', source)
        self.assertIn('class="jaw jaw--lower"', source)
        self.assertIn("prefers-reduced-motion: reduce", source)

    def test_generated_outputs_use_scienceclaw_filenames(self) -> None:
        expected = (
            ROOT / "swarm" / "assets" / "social" / "scienceclaw-apply-qr.svg",
            ROOT / "swarm" / "assets" / "social" / "scienceclaw-hackathon-flyer-16x9.png",
            ROOT / "swarm" / "assets" / "social" / "scienceclaw-hackathon-flyer-16x9.pdf",
            ROOT / "sponsor_pitches" / "exports" / "scienceclaw-founding-partnership-deck.pdf",
            ROOT / "sponsor_pitches" / "exports" / "scienceclaw-sponsorship-opportunity.pdf",
        )
        for path in expected:
            with self.subTest(path=path.relative_to(ROOT)):
                self.assertTrue(path.is_file(), path)

    def test_social_caption_contract_uses_collectives_and_new_application_url(self) -> None:
        captions = (
            ROOT / "v2" / "assets" / "social" / "social-captions.md"
        ).read_text(encoding="utf-8")
        self.assertEqual(captions.count(APPLICATION_URL), 2)
        self.assertIn("ScienceClaw", captions)
        self.assertIn("agent collectives", captions)
        self.assertNotIn("ScienceSwarm", captions)
        self.assertNotIn("swarmhack", captions.lower())


if __name__ == "__main__":
    unittest.main()
