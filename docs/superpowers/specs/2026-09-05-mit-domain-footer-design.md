# MIT Domain Compliance Footer Design

## Goal

Add the contact and accessibility footer elements required for an MIT domain request to every public HTML page without disrupting the existing website or flyer exports.

## Requirements

- Display `Contact: fw2@mit.edu` as a working `mailto:fw2@mit.edu` link.
- Display an `Accessibility` link to `https://accessibility.mit.edu/`.
- Include both links in a semantic `<footer>` on the homepage, application page, and flyer page.
- Keep the links visible, keyboard accessible, and legible in the existing black-and-gold visual system.
- Open the accessibility link in the same tab; email links use the visitor's configured mail client.

## Page Treatment

### Homepage

Extend the existing footer. Preserve the current event and tagline text, then add a compact compliance group containing the contact and accessibility links.

### Application Page

Add the same site footer after the application content. It should sit naturally below the form and remain distinct from the form status and submission controls.

### Flyer Page

Add a browser-visible site footer below the fixed 1600 × 900 flyer canvas. Hide this footer in print media so the generated PDF remains a single clean 16:9 page. Export only the `.flyer` canvas to PNG, preserving the current artwork.

## Styling

Use a shared `.footer` structure and link treatment on the homepage and application page. The existing footer remains understated, with muted ivory text, fine gold borders, and gold hover/focus states. The flyer page may define equivalent local styles because it is a standalone document, but its content and interaction behavior must match.

On narrow screens, footer content may wrap or stack without causing horizontal overflow. Focus indicators must remain visible against the dark background.

## Verification

- Confirm `index.html`, `apply.html`, and `flyer.html` each contain exactly one semantic footer.
- Confirm each footer contains the exact mailto and accessibility destinations.
- Confirm both links are keyboard reachable and have visible focus states.
- Confirm no page has horizontal overflow at desktop, tablet, or phone widths.
- Confirm the flyer PNG remains exactly 1600 × 900.
- Confirm the flyer PDF remains one exact 16:9 page and does not include the browser-only compliance footer.
- Confirm the application QR code still decodes to the live application URL.
- Confirm all three production pages and both footer destinations are reachable.
