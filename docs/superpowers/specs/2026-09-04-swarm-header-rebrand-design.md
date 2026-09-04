# Swarm Header Rebrand Design

## Summary

Rename the INFINITE hackathon to Swarm while retaining “The Internet of Agents Hackathon” as its event title. Establish a two-level Swarm identity across the header and hero, and replace the current fixed navigation with a unified header that makes the event and its institutional identities immediately clear.

## Header

On desktop, a single header line contains the Swarm brand, a clear visual gap, three institutional identity slots in the order MIT, LAMM, E14, the section navigation, and the Apply action. The grid reserves a wider dedicated column for Swarm; the remaining institutional region consists of three equal-width columns so MIT, LAMM, and E14 have mathematically equal center-to-center spacing. The three institutional identities are smaller and use a shared muted off-white treatment so the Swarm identity remains primary. On narrower screens, Swarm and the page action occupy the first row; MIT, LAMM, and E14 share three equal-width columns in the second row, and section links remain hidden.

The Swarm identity uses a small gold origami crane followed by a white SWARM wordmark. The crane uses an organic flight animation rather than moving as one rigid object: its left and right wings run a coordinated 1.6-second flap cycle around their body-side hinges while the complete crane follows a smooth 3.2-second vertical glide of 4 pixels. The body does not rotate, move horizontally, or scale. The animation remains inside the brand column and is disabled when the visitor requests reduced motion. The identity has no abstract S symbol and no separate gold node. MIT and E14 use their supplied official SVGs. LAMM uses exactly one symbol—the supplied lattice animation, looping continuously—followed by text-only “Laboratory for Atomistic and Molecular Mechanics” lettering sized to match the MIT lockup visually. The video provides WebM and MP4 sources plus a static poster fallback; no separate static LAMM symbol is present in the markup.

## Hero Branding

The hero repeats the origami crane as the primary event emblem, following the hierarchy of the former infinity treatment. A larger gold crane is centered above the title and uses the same coordinated wing and glide animation as the header crane. Directly below it, the title remains set on two lines as “The Internet of Agents” and “Hackathon”; no separate SWARM wordmark appears between the crane and title. The compact header lockup remains crane plus SWARM, allowing the header to identify the event quickly while the hero presents the full event name.

The hero crane is decorative because the adjacent heading supplies the event name. It stays within the title group at every breakpoint, scales down proportionally on phones, and becomes static when reduced motion is requested.

## Browser Identity

Both website pages declare a scalable SVG favicon containing only the gold origami crane, with no wordmark, institutional identity, or background panel. The favicon uses a dedicated static asset so browser-tab behavior does not depend on SVG animation support and reduced-motion behavior remains predictable.

## Rebrand Scope

Update user-facing titles, descriptions, navigation, footer text, and the Formspree email subject on both website pages. Remove the old glowing infinity brand mark and the duplicate partner strip at the bottom of the homepage. Keep the existing public URL, form endpoint, application fields, and event title.

## Deferred Work

Do not change the flyer, flyer generator, social captions, QR code, or public application URL until the website version has been reviewed and approved.

## Validation

Verify header and hero alignment and legibility at desktop, tablet, and phone widths; the equal institutional-logo spacing; coordinated wing and glide movement in both website cranes; the static crane favicon on both pages; reduced-motion fallbacks; the LAMM media fallback; both page headers; navigation behavior; and the absence of user-facing INFINITE branding outside the intentionally deferred flyer assets.
