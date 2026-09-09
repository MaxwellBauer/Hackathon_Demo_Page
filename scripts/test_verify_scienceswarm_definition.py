"""Regression coverage for the ScienceSwarm definition verifier."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest


SCRIPT = Path(__file__).with_name("verify_scienceswarm_definition.py")
SPEC = importlib.util.spec_from_file_location("verify_scienceswarm_definition", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class DefinitionVerifierTests(unittest.TestCase):
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
