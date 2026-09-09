"""Regression coverage for the ScienceSwarm headline verifier."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest


SCRIPT = Path(__file__).with_name("verify_scienceswarm_headline.py")
SPEC = importlib.util.spec_from_file_location("verify_scienceswarm_headline", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class HeadlineParserTests(unittest.TestCase):
    def test_keeps_trailing_text_inside_tracked_nested_span(self) -> None:
        parser = MODULE.HeadlineParser()
        parser.feed(
            '<span class="hero__line--primary">'
            'Science<span>Swarm</span>Extra</span>'
        )

        self.assertEqual(
            parser.text_by_class["hero__line--primary"], ["ScienceSwarmExtra"]
        )


if __name__ == "__main__":
    unittest.main()
