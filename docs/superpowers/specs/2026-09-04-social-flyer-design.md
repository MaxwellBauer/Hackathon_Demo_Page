# Swarm Social Flyer Design

## Goal

Create a cinematic 16:9 promotional flyer for LinkedIn and X that feels native to the approved Swarm website and sends viewers directly to the hackathon application.

## Deliverables

- An editable 1600 × 900 SVG source.
- A 1600 × 900 PNG export ready for social posting.
- Updated LinkedIn and X captions containing a clickable application URL.

The deliverables will live in `v2/assets/social/` as `swarm-hackathon-flyer-16x9.svg`, `swarm-hackathon-flyer-16x9.png`, and `social-captions.md`. Remove the obsolete INFINITE SVG and PNG after the Swarm exports pass verification.

## Visual Direction

Use the website's cinematic black-and-gold system: a near-black background, warm gold accents, ivory typography, subtle atmospheric grain, fine gold wireframe terrain, and a restrained flock of origami cranes. The composition should feel premium, scientific, spacious, and energetic. It must read as a direct visual extension of the website rather than as a separate campaign.

The crane artwork and terrain remain subordinate to the headline. They may overlap open background areas but must not reduce copy or QR-code legibility.

## Composition

Use a 1600 × 900 canvas with a minimum 72-pixel safe margin around essential content.

1. The top row contains the Swarm crane wordmark followed by the MIT, LAMM, and E14 identities in that order. The institutional identities use the same muted off-white treatment as the website and are evenly spaced.
2. The center-left contains the dominant editorial headline, set across three visual lines: `The Internet of`, `Agents`, and `Hackathon`. `Agents` uses the website's gold italic serif treatment; the remaining words use the ivory display treatment.
3. Beneath the headline, retain this blurb exactly: `A hackathon on decentralized AI swarms — agents built by different labs, startups, and companies discovering each other, sharing capabilities, and coordinating on real scientific and engineering problems.` Set it in readable Inter across three lines without competing with the headline.
4. The lower-left contains one event-details line exactly as written: `Oct 30 – Nov 1, 2026 · MIT Media Lab 6th floor`.
5. The right side contains a spacious gold-framed application panel with a large QR code and the label `Apply`.
6. The QR panel contains no visible URL. The post captions provide a clickable fallback link.

## Typography

Use the same three font families as the website: Bitter for display text, Inter for sans-serif text, and IBM Plex Mono for labels and the Swarm wordmark. Embed the required WOFF2 font files directly in the generated SVG with `@font-face` data URLs. Do not depend on remote Google Fonts loading and do not convert text to outlines; the SVG must remain editable while rendering consistently offline. Use the website's corresponding weights and Bitter italic style.

## Application Destination

The QR code must encode this exact URL:

`https://infinite-hackathon.vercel.app/apply.html`

The QR code must use a high-contrast light field with dark modules, preserve the required quiet zone, and remain comfortably separated from its frame and label.

## Organizer Assets

Reuse the approved website assets rather than recreating the identities:

- Swarm crane and wordmark treatment from the website header.
- MIT lockup from `v2/assets/logos/mit-lockup.svg`.
- The single animated LAMM lattice cannot animate in a static social image, so use a representative still from the approved lattice animation beside the full Laboratory for Atomistic and Molecular Mechanics name.
- E14 mark from `v2/assets/logos/e14-logo.svg`.

All identities must remain recognizable at social-feed size. The Swarm identity remains visually primary.

## Social Captions

Update `v2/assets/social/social-captions.md` for Swarm. Both captions must state that applications are open, include the event date and MIT Media Lab location, describe the decentralized-agent-swarm focus, and include the full clickable application URL. The image itself must not show that URL.

## Accessibility and Platform Safety

- Maintain strong contrast between type and background.
- Keep all essential copy and logos within the 72-pixel safe margin.
- Use no essential text smaller than 22 pixels on the 1600 × 900 source.
- Preserve clear visual separation between the headline, event details, organizers, and application panel.
- Keep the composition legible in a feed preview and after moderate platform cropping.
- Include useful SVG title and description metadata.

## Verification

- Confirm the SVG and PNG are exactly 1600 × 900.
- Confirm the SVG is valid and the PNG renders without missing assets.
- Decode the QR code from the final PNG and verify the exact application URL.
- Confirm no visible URL appears in the flyer artwork.
- Confirm the event line matches the approved wording exactly.
- Confirm the complete blurb matches the approved wording exactly and is not clipped.
- Confirm Bitter, Inter, and IBM Plex Mono are embedded in the SVG and are the fonts used in the PNG export, with no remote font dependency or serif fallback.
- Visually inspect hierarchy, clipping, contrast, logo spacing, crane restraint, and consistency with the deployed website.
- Check the final PNG at full size and at a reduced social-feed preview size.
