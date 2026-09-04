# Swarm Social Flyer Design

## Goal

Create a cinematic 16:9 promotional flyer for LinkedIn and X that feels native to the approved Swarm website and sends viewers directly to the hackathon application.

## Deliverables

- An editable standalone HTML flyer page at `v2/flyer.html`.
- A 16:9 PDF export suitable for sharing and printing.
- A 1600 × 900 PNG export ready for social posting.
- Updated LinkedIn and X captions containing a clickable application URL.

The HTML page is the authoritative editable source. Export it to `v2/assets/social/swarm-hackathon-flyer-16x9.pdf` and `v2/assets/social/swarm-hackathon-flyer-16x9.png`; retain `v2/assets/social/social-captions.md`. Remove the generated SVG after the HTML, PDF, and PNG pass verification.

## Visual Direction

Use the website's cinematic black-and-gold system: a near-black background, warm gold accents, ivory typography, subtle atmospheric grain, fine gold wireframe terrain, and a restrained flock of origami cranes. The composition should feel premium, scientific, spacious, and energetic. It must read as a direct visual extension of the website rather than as a separate campaign.

The crane artwork and terrain remain subordinate to the headline. They may overlap open background areas but must not reduce copy or QR-code legibility.

## Composition

Use a 1600 × 900 canvas with a minimum 72-pixel safe margin around essential content.

1. The top row contains the Swarm crane wordmark followed by the MIT, LAMM, and E14 identities in that order. The institutional identities use the same muted off-white treatment as the website. Adjust for visible logo widths so the optical MIT-to-LAMM gap matches the optical LAMM-to-E14 gap.
2. Center the primary copy horizontally within the left content region, which excludes the right-side QR panel. The headline reproduces the website's two-line treatment: `The Internet of Agents` on the first line and `Hackathon` on the second. `Agents` uses the website's gold italic serif treatment; the remaining words use the ivory display treatment.
3. Beneath the headline, retain this blurb exactly: `A hackathon on decentralized AI swarms — agents built by different labs, startups, and companies discovering each other, sharing capabilities, and coordinating on real scientific and engineering problems.` Center it within the same left content region in readable Inter without competing with the headline.
4. Center the event-details line within the same left content region exactly as written: `Oct 30 – Nov 1, 2026 · MIT Media Lab 6th floor`.
5. The right side contains a spacious gold-framed application panel with a large QR code and the label `Apply`.
6. The QR panel contains no visible URL. The post captions provide a clickable fallback link.

## Typography

Use the same Google Fonts stylesheet and CSS variables as the website: Bitter for display text, Inter for sans-serif text, and IBM Plex Mono for labels and the Swarm wordmark. Reproduce the website headline's `300` weight, `1.12` line-height, `-0.02em` tracking, and italic Bitter treatment for `Agents`. Wait for `document.fonts.ready` before every export so the PDF and PNG cannot capture a fallback font.

## HTML and Export Behavior

`v2/flyer.html` is a standalone 1600 × 900 composition using semantic HTML and dedicated flyer styles. It reuses local logo artwork and loads the same font stylesheet as the website. Add print CSS with a marginless 16:9 page and preserve background colors exactly. The export script opens this page in Chromium, waits for all font faces and images, verifies the computed headline styles, then produces the PDF and PNG from the same rendered page.

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
- Give the HTML page a descriptive title and meaningful accessible labels for the flyer and application QR code.

## Verification

- Confirm the HTML flyer renders at exactly 1600 × 900 with no overflow.
- Confirm the PNG is exactly 1600 × 900 and the PDF contains one 16:9 page.
- Confirm both exports render without missing assets.
- Decode the QR code from the final PNG and verify the exact application URL.
- Confirm no visible URL appears in the flyer artwork.
- Confirm the event line matches the approved wording exactly.
- Confirm the complete blurb matches the approved wording exactly and is not clipped.
- Confirm Bitter, Inter, and IBM Plex Mono are loaded and used in the browser before exporting, with no serif fallback captured in either export.
- Confirm the headline is centered within the left content region and uses the approved two-line website treatment.
- Confirm the optical MIT-to-LAMM and LAMM-to-E14 gaps match.
- Visually inspect hierarchy, clipping, contrast, logo spacing, crane restraint, and consistency with the deployed website.
- Check the final PNG at full size and at a reduced social-feed preview size.
