# ScienceSwarm Hero Subtitle Design

## Goal

Make the event’s purpose immediately recognizable within the hero headline itself.

## Scope

Change only the homepage hero in `swarm/index.html` and the directly associated subtitle styling in `swarm/css/styles.css`.

Keep the primary `ScienceSwarm` headline unchanged. Replace the smaller `Internet of Agents Hackathon` line with:

> A hackathon for building decentralized AI swarms that solve real scientific and technical problems.

Remove the duplicate `.hero__sub` paragraph beneath the headline. Do not change the metadata, event details, actions, statistics, Purpose copy, other homepage sections, application page, or flyer.

## Visual hierarchy

`ScienceSwarm` remains the dominant display line. The new descriptive subtitle is visually secondary and uses sentence case. Remove its existing uppercase transformation, reduce its letter spacing, and allow it to wrap naturally. Keep it readable at desktop and mobile widths without horizontal overflow.

The action buttons follow the subtitle with balanced spacing after the duplicate paragraph is removed. Preserve the current gold accent, typography family, animation, dark visual system, and responsive layout.

## Accessibility and metadata

The `h1` contains both the event name and descriptive subtitle, giving screen readers the complete event definition. Preserve the existing document title and meta description, which already contain the approved ScienceSwarm definition.

## Verification

- Confirm the primary headline remains exactly `ScienceSwarm`.
- Confirm the `h1` subtitle contains the approved sentence exactly once.
- Confirm `.hero__sub` is absent from homepage markup.
- Confirm the old visible subtitle `Internet of Agents Hackathon` is absent from the hero but remains unchanged where required in document metadata or other approved assets.
- Verify visual hierarchy and absence of horizontal overflow at desktop and mobile widths.
- Run the complete existing site and flyer verification suite.
- Serve the result through the existing localhost preview; do not push or deploy.
