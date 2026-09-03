# INFINITE — Hackathon Demo (Gold)

Fork of the original INFINITE hackathon demo, re-themed to black & gold with a layered tentacles/anemone effect, glowing infinity logo, and partner logos.

## Run

No build step. Any static file server works:

```bash
cd <this folder>
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The 3D scene pulls Three.js from jsDelivr CDN (`three@0.160.0`), so an internet connection is needed to render the background. Text and layout are fully local.

## Files

- `index.html` — main page (hero with glowing logo, sections, partners, apply teaser)
- `apply.html` — dedicated application form (linked from hero/CTA)
- `css/styles.css` — all styles (gold palette: `--accent #d9a038`, `--accent-warm #ffdf8a`)
- `js/scene.js` — Three.js ocean + origami crane/fish flocks (module)
- `js/tentacles.js` — 2D canvas anemone sticks, bottom-anchored, fade in on scroll (classic script)
- `js/main.js` — nav, scroll reveals (module, unchanged from blue)

## Notes

- Relative asset paths throughout, so the site is portable to any static host.
- Tentacles fade in/out smoothly as you scroll past the `#areas` section, synchronized with the underwater fish school.
- `prefers-reduced-motion` is respected: the 3D scene renders one static frame only, tentacles render one static frame or none.
