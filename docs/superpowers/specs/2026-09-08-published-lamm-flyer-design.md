# Published LAMM Flyer Design

## Goal

Replace the flyer’s improvised LAMM lattice-and-text treatment with the official LAMM logo supplied at `/home/fiona/LAMM/hackathon_fall26/logos/LOGO_LAMM_full_black.svg`, then publish the flyer’s HTML, PNG, and PDF from `swarmhack.ai`.

## Logo treatment

Copy the supplied SVG byte-for-byte to `v2/assets/logos/LOGO_LAMM_full_black.svg`. Replace the existing lattice image and typed laboratory name in the flyer organizer row with this single official asset. Render its black paths white using CSS so it remains legible on the dark flyer without modifying the source artwork. Preserve its aspect ratio and rebalance organizer widths and gaps around the new mark.

## Published artifacts

Keep `v2/flyer.html` and its generated files as the editable source set. Extend the flyer builder to synchronize the browser flyer and its required QR, PNG, and PDF files into the deployable `swarm/` directory. Publish these stable URLs:

- `https://swarmhack.ai/flyer.html`
- `https://swarmhack.ai/assets/social/swarm-hackathon-flyer-16x9.png`
- `https://swarmhack.ai/assets/social/swarm-hackathon-flyer-16x9.pdf`

The published HTML uses the existing organizer assets already present under `swarm/assets/logos/`, including the identical official LAMM SVG.

## Verification

- Confirm the source and both repository copies of the official LAMM SVG are byte-identical.
- Confirm the flyer contains one official LAMM image and no legacy lattice or typed-name treatment.
- Regenerate the flyer and pass its typography, canvas, overflow, organizer-spacing, and QR checks.
- Confirm the synchronized HTML, PNG, PDF, and QR match their source artifacts.
- Deploy `swarm/` and require HTTPS 200 for all three public URLs.
- Confirm the downloaded PNG is 1600 × 900 and the downloaded PDF is a one-page 16:9 document.
