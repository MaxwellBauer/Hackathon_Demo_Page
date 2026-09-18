# Custom Domain Brand Assets Design

## Goal

Finish the `swarmhack.ai` launch by making the browser icon reliable across browsers and changing every generated flyer application reference from the Vercel URL to `https://swarmhack.ai/apply.html`.

## Favicon

Keep the existing gold origami crane artwork. Provide SVG, PNG, and ICO variants, and reference them from both `swarm/index.html` and `swarm/apply.html`. Add a version query to favicon URLs so browsers do not retain the previous cached icon. Do not alter the visible header crane.

## Flyer application link

Use `https://swarmhack.ai/apply.html` as the single canonical application URL in the flyer build script. Regenerate all derived assets so the following agree:

- the clickable application panel in `v2/flyer.html`;
- the destination encoded by `v2/assets/social/swarm-apply-qr.svg`;
- application URLs in `v2/assets/social/social-captions.md`;
- the exported PNG and PDF flyers.

The application URL remains intentionally absent as visible text in the flyer artwork; users reach it through the QR code or clickable HTML panel.

## Verification

- Confirm the homepage and application page advertise all favicon formats.
- Confirm the PNG and ICO files are valid images and preserve the gold crane.
- Decode the regenerated QR code and compare it exactly with `https://swarmhack.ai/apply.html`.
- Run the existing flyer build and repository verification scripts.
- Confirm the custom-domain application URL responds successfully over HTTPS.
