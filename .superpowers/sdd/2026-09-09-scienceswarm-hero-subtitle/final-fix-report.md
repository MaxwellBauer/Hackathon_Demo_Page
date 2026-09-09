# Final Fix Report: Hero Subtitle Heading Containment

## Scope

Added structural verification that the approved `.hero__line--subtitle` is
collected only while an `h1` is open. Production homepage and stylesheet files
were not changed.

## Root cause

`HomepageParser` identified the subtitle solely by its class name. It retained
no heading-ancestor state, so the verifier accepted an otherwise identical
subtitle after the closing `</h1>`.

## RED evidence

Added `test_rejects_subtitle_moved_outside_hero_heading`. The test reads the
real `swarm/index.html`, removes the exact subtitle span from the checked-in
heading, reinserts it immediately after the closing `</h1>`, and requires
`verify_copy` to reject that mutated source.

Command:

```text
python scripts/test_verify_scienceswarm_definition.py
```

Output before the verifier change:

```text
..F
FAIL: test_rejects_subtitle_moved_outside_hero_heading
AssertionError: AssertionError not raised
Ran 3 tests in 0.003s
FAILED (failures=1)
```

This failure proves the prior verifier accepted the invalid structural mutation.

## GREEN evidence

Implemented the minimal parser change: maintain `_heading_depth`, start
subtitle collection only when that depth is nonzero, and state the containment
requirement in the assertion message.

Commands and outputs after the change:

```text
python scripts/test_verify_scienceswarm_definition.py
...
Ran 3 tests in 0.002s
OK

python -m unittest discover -s scripts -p 'test_*.py'
....
Ran 4 tests in 0.002s
OK

python scripts/verify_scienceswarm_definition.py
PASS ScienceSwarm homepage definition

python scripts/verify_scienceswarm_headline.py
PASS ScienceSwarm headline hierarchy
```

`git diff --check` also completed with no output.

## Result and concerns

The verifier now rejects a subtitle moved outside the hero `h1`, while the
existing real homepage still passes. No concerns identified.
