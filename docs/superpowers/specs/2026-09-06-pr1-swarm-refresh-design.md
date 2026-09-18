# PR #1 Swarm Refresh Design

## Goal

Update PR #1 (`fwang108:native-application-form`) to use the current Swarm site from upstream `main`, while retaining the PR's application and compliance work. Replace the animated LAMM header treatment with the supplied full LAMM SVG rendered as a static white logo on the dark header.

## Source of Truth

- Swarm implementation and 3D model: `MaxwellBauer/Hackathon_Demo_Page` `main`, specifically `swarm/`.
- LAMM artwork: `/home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg`.
- PR-specific work: the current `native-application-form` branch.

## Design

Merge the latest upstream `main` into the PR branch so the branch adopts the complete updated Swarm implementation and model rather than selectively copying model code. Resolve any overlap in favor of the current upstream Swarm visual/model implementation while preserving the PR's native application form, MIT compliance footer, and other branch-only functionality.

Copy the supplied SVG into `swarm/assets/logos/` and reference that local asset from the LAMM organizer link in the header. Remove the animated LAMM video, its poster/source elements, and the separately typeset LAMM wording. Apply `filter: invert(1)` to the black SVG through the existing LAMM identity CSS so its paths render white without modifying the source artwork. Preserve the link target, accessible name, responsive sizing, and header alignment.

## Verification

- Confirm the PR branch contains the latest upstream `swarm/js/scene.js` and related Swarm assets.
- Confirm the copied SVG is byte-identical to the supplied source.
- Assert the header contains the static SVG and no LAMM video sources or duplicate text wordmark.
- Serve the site locally and verify the homepage, application page, CSS, JavaScript model, and LAMM SVG return successful responses.
- Inspect desktop and mobile screenshots to confirm the logo is white, legible, proportionate, and aligned.
- Check the final branch diff and PR head after pushing.

## Scope

No redesign of other organizer identities, navigation, page content, or model behavior beyond adopting the current upstream Swarm version.
