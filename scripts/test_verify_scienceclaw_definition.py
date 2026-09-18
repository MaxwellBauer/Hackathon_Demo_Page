"""Regression coverage for the ScienceClaw definition verifier."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest


SCRIPT = Path(__file__).with_name("verify_scienceclaw_definition.py")
SPEC = importlib.util.spec_from_file_location("verify_scienceclaw_definition", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class DefinitionVerifierTests(unittest.TestCase):
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

    def test_rejects_subtitle_moved_outside_hero_heading(self) -> None:
        source = MODULE.HOMEPAGE.read_text(encoding="utf-8")
        subtitle = (
            '        <span class="hero__line hero__line--subtitle">'
            f"{MODULE.HERO_DEFINITION}</span>\n"
        )
        source_with_subtitle_outside_heading = source.replace(subtitle, "", 1).replace(
            "      </h1>\n", f"      </h1>\n{subtitle}", 1
        )

        with self.assertRaisesRegex(AssertionError, "must be part of the hero heading"):
            MODULE.verify_copy(source_with_subtitle_outside_heading)

    def test_rejects_a_missing_required_section_title(self) -> None:
        source = MODULE.HOMEPAGE.read_text(encoding="utf-8")
        source_without_purpose_title = source.replace(
            '<h2 class="section__title">Purpose</h2>',
            '<h2 class="section__title">Changed purpose</h2>',
            1,
        )

        with self.assertRaisesRegex(
            AssertionError, "Purpose section title is missing"
        ):
            MODULE.verify_preserved_content(source_without_purpose_title)


if __name__ == "__main__":
    unittest.main()
