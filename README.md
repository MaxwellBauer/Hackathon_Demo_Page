# INFINITE — Hackathon Demo

Static site for the **INFINITE: The Internet of Agents Hackathon**, MIT Media Lab, Oct 30 – Nov 1, 2026. Original dark-blue synthwave theme with the animated origami-crane scene.

## Run

No build step. Any static file server works:

```bash
cd <this folder>
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The 3D scene pulls Three.js from jsDelivr CDN (`three@0.160.0`), so an internet connection is needed to render the background. Text and layout are fully local.

## Files

- `index.html` — main page (hero, purpose, challenge, resources, areas, judging, apply teaser)
- `apply.html` — dedicated application form (linked from hero/CTA)
- `css/styles.css` — all styles
- `js/scene.js` — Three.js ocean + origami crane flock (module)
- `js/main.js` — nav, scroll reveals (module)

## v2 (Gold variant)

A re-themed fork lives in the `v2/` directory: black & gold palette, layered tentacles/anemone scroll effect, glowing infinity logo, partner logos. Same structure and content — just a different visual language.

## Notes

- Relative asset paths throughout, so the site is portable to any static host.
- `prefers-reduced-motion` is respected: the 3D scene renders one static frame only.
