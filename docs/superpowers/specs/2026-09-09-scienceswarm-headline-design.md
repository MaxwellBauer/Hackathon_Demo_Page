# ScienceSwarm Headline Design

## Goal

Establish **ScienceSwarm** as the event's primary name while retaining **Internet of Agents Hackathon** as its descriptive subtitle.

## Scope

Update the headline treatment in both places where the event is promoted:

- The homepage hero in `swarm/index.html`
- The source and published flyer in `v2/flyer.html` and `swarm/flyer.html`

Regenerate the flyer PNG and PDF after updating the source flyer. Do not deploy these changes to `swarmhack.ai`; expose the result only through a local development server for user review.

## Visual hierarchy

The headline uses two levels:

1. `ScienceSwarm` is the dominant first line, using the existing display type style and the largest size.
2. `Internet of Agents Hackathon` is a smaller supporting line immediately beneath it.

The supporting line remains clearly readable but must not compete with `ScienceSwarm`. Preserve the existing gold accent, dark visual language, responsive behavior, animation style, and surrounding spacing unless a small adjustment is necessary to prevent wrapping or overflow.

## Metadata and accessibility

Update relevant document titles and accessible headline labels so the new name is reflected consistently. Keep the visible event details, application link, QR destination, organizer logos, body copy, and dates unchanged.

## Generated assets

Use the existing flyer build process to regenerate and synchronize:

- `swarm/assets/social/swarm-hackathon-flyer-16x9.png`
- `swarm/assets/social/swarm-hackathon-flyer-16x9.pdf`

The PNG remains 1600×900, the PDF remains a single-page 16:9 document, and the application QR code continues to resolve to `https://swarmhack.ai/apply.html`.

## Verification

- Confirm the homepage and both flyer HTML copies contain the approved two-level headline.
- Confirm `ScienceSwarm` has greater visual prominence than the subtitle at desktop and mobile widths.
- Run existing brand, flyer, and application-link verification scripts.
- Confirm regenerated PNG/PDF dimensions and page count.
- Start a local server for user review, with no Vercel deployment or production alias update.
