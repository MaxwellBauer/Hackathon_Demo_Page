#!/usr/bin/env python3
"""Verify the ScienceClaw headline hierarchy and published flyer parity."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "hero__line--primary": "ScienceClaw",
    "hero__line--subtitle": (
        "A hackathon for building decentralized collectives of AI agents that solve real scientific "
        "and technical problems."
    ),
    "flyer__title-primary": "ScienceClaw",
    "flyer__title-subtitle": "Internet of Agents Hackathon",
}
VOID_ELEMENTS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}


class HeadlineParser(HTMLParser):
    """Collect normalized text from elements carrying expected headline classes."""

    def __init__(self) -> None:
        super().__init__()
        self.text_by_class: dict[str, list[str]] = {
            class_name: [] for class_name in EXPECTED
        }
        self._active: list[tuple[object, list[str], list[str]]] = []
        self._open_elements: list[tuple[str, object]] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        element = object()
        if tag not in VOID_ELEMENTS:
            self._open_elements.append((tag, element))
        classes = set((dict(attrs).get("class") or "").split())
        expected_classes = list(classes.intersection(EXPECTED))
        if expected_classes:
            self._active.append((element, expected_classes, []))

    def handle_data(self, data: str) -> None:
        for _, _, chunks in self._active:
            chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if not self._open_elements or self._open_elements[-1][0] != tag:
            return
        _, element = self._open_elements.pop()
        for index in range(len(self._active) - 1, -1, -1):
            active_element, class_names, chunks = self._active[index]
            if active_element is element:
                self._active.pop(index)
                text = " ".join("".join(chunks).split())
                for class_name in class_names:
                    self.text_by_class[class_name].append(text)
                return


def verify_headlines() -> None:
    homepage = (ROOT / "swarm" / "index.html").read_text(encoding="utf-8")
    stylesheet = (ROOT / "swarm" / "css" / "styles.css").read_text(encoding="utf-8")
    flyer = (ROOT / "v2" / "flyer.html").read_text(encoding="utf-8")
    public_flyer = (ROOT / "swarm" / "flyer.html").read_text(encoding="utf-8")

    homepage_parser = HeadlineParser()
    homepage_parser.feed(homepage)
    flyer_parser = HeadlineParser()
    flyer_parser.feed(flyer)

    for class_name in ("hero__line--primary", "hero__line--subtitle"):
        assert homepage_parser.text_by_class[class_name] == [EXPECTED[class_name]], (
            f"{class_name} text mismatch: "
            f"{homepage_parser.text_by_class[class_name]}"
        )
    for class_name in ("flyer__title-primary", "flyer__title-subtitle"):
        assert flyer_parser.text_by_class[class_name] == [EXPECTED[class_name]], (
            f"{class_name} text mismatch: {flyer_parser.text_by_class[class_name]}"
        )

    assert (
        "<title>ScienceClaw — Internet of Agents Hackathon</title>" in homepage
    ), "homepage title mismatch"
    assert (
        "<title>ScienceClaw — Internet of Agents Hackathon Flyer</title>" in flyer
    ), "flyer title mismatch"
    assert ".hero__line--subtitle" in stylesheet, (
        "stylesheet missing .hero__line--subtitle selector"
    )
    assert ".hero__sub" not in stylesheet, (
        "stylesheet retains unused .hero__sub selector"
    )
    assert ".flyer__title-subtitle" in flyer, (
        "flyer missing .flyer__title-subtitle marker"
    )
    assert flyer == public_flyer, "public flyer differs from v2 flyer"


def main() -> int:
    try:
        verify_headlines()
    except (AssertionError, FileNotFoundError) as error:
        print(f"FAIL: {error}")
        return 1
    print("PASS ScienceClaw headline hierarchy")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
