# Application Header Parity Design

## Goal

Make the organizer branding on `swarm/apply.html` visually and semantically match the verified homepage header.

## Design

The application header will use the same organizer identity markup and local assets as `swarm/index.html`: the SWARM crane and wordmark, MIT lockup, static full LAMM SVG, and E14 mark, in the same order and under the same CSS classes. The LAMM identity must use `assets/logos/LOGO_LAMM_full_black.svg`, rendered white by the existing `.identity--lamm .identity__lamm-logo` rule. Remove the legacy LAMM video, poster, WebM/MP4 sources, lattice class, and separately typeset lab name from the application header.

The application page retains its page-specific navigation behavior: the SWARM identity links to `index.html`, the mobile action says `Back to site`, and the desktop application navigation continues to link back to the homepage. No form fields, submission behavior, page content, or homepage markup changes.

## Verification

- Add an automated parity check that compares the organizer institution block in `swarm/index.html` and `swarm/apply.html`.
- Assert that the application header has one static full LAMM SVG and no legacy LAMM video treatment.
- Run the existing Swarm refresh and MIT footer verifiers.
- Render the application page at desktop and mobile widths and confirm all four identities are visible, aligned, uncropped, and consistent with the homepage.
- Deploy the verified `swarm/` directory to the existing `infinite-hackathon` Vercel project and verify the production application page.

## Scope

Only the application header organizer branding changes. The form and all other page behavior remain untouched.
