# Flyer Header Overlap Fix Design

## Problem

The flyer header positions were designed for the short `CLAW` wordmark. After the label became `ScienceClaw`, the wordmark ends at x=412.56 while the divider begins at x=330 and the MIT logo begins at x=380, causing visible overlap.

## Approved Design

Keep the claw mark, full-size `ScienceClaw` wordmark, and institution logo sizes unchanged. Move the divider and MIT/LAMM/E14 organizer group right into the available header space so every item has clear separation.

Use these horizontal positions on the fixed 1600 × 900 flyer:

- Divider: x=450
- MIT: x=500
- LAMM: x=739
- E14: x=1157

The ScienceClaw brand remains at x=72 and ends near x=413, leaving more than 37 pixels before the divider. No vertical layout, copy, colors, or application panel geometry changes.

## Verification

A browser geometry regression test must require at least 24 pixels between the brand and divider and at least 40 pixels between the divider and MIT logo. The flyer builder must regenerate the public HTML, PNG, and PDF artifacts, and the exported PNG must be visually inspected at full resolution.
