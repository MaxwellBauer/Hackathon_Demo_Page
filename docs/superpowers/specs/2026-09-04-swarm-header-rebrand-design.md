# Swarm Header Rebrand Design

## Summary

Rename the INFINITE hackathon to Swarm while retaining “The Internet of Agents Hackathon” as its event title. Establish a two-level Swarm identity across the header and hero, and replace the current fixed navigation with a unified header that makes the event and its institutional identities immediately clear.

## Header

On desktop, a single header line contains the Swarm brand, a clear visual gap, the three institutional identities in the order MIT, LAMM, E14, the section navigation, and the Apply action. The one-line layout remains active through the existing 1241-pixel desktop breakpoint. The grid reserves a dedicated column for Swarm. MIT, LAMM, and E14 live inside one institutional wrapper with a shared base gap: 32 pixels on wide desktop screens and 22 pixels on compact desktop screens. The compact layout uses a 185-pixel Swarm column and a 10-pixel grid gap, preserving clear separation after the wordmark while giving the institutional group more room. Because the animated LAMM video contains approximately 4 pixels of visually empty space at its left edge, the LAMM identity receives a negative 4-pixel left margin at every breakpoint. E14 receives an additional 6-pixel left margin so the visible LAMM-to-E14 interval is intentionally slightly larger than the MIT-to-LAMM interval. The three institutional identities use a shared muted off-white treatment so the Swarm identity remains primary. On narrower screens, Swarm and the page action occupy the first row; the same institutional wrapper occupies the second row with a fluid shared gap between 20 and 64 pixels, and section links remain hidden.

The Swarm identity uses a small gold origami crane followed by a white SWARM wordmark. The crane uses an organic flight animation rather than moving as one rigid object: its left and right wings run a coordinated 1.6-second flap cycle around their body-side hinges while the complete crane follows a smooth 3.2-second vertical glide of 4 pixels. The body does not rotate, move horizontally, or scale. The animation remains inside the brand column and is disabled when the visitor requests reduced motion. The identity has no abstract S symbol and no separate gold node. MIT and E14 use their supplied official SVGs. LAMM uses exactly one symbol—the supplied lattice animation, looping continuously—followed by the text-only two-line name “Laboratory for Atomistic and / Molecular Mechanics.” On wide desktop screens the animation is 40 pixels square and the name is 0.68rem; compact desktop sizes use 36 pixels and 0.62rem; phone sizes use 31 pixels and 0.48rem. This makes the LAMM name’s apparent letter height comparable to the organization name in the MIT lockup. The video provides WebM and MP4 sources plus a static poster fallback; no separate static LAMM symbol is present in the markup.

Each institutional identity is a link on both website pages. MIT links to `https://www.mit.edu/`, LAMM links to `https://lamm.mit.edu/`, and E14 links to `https://www.e14.vc/`. The links open in a new tab with `noopener noreferrer`, become slightly brighter on hover, and receive a visible gold keyboard-focus outline.

## Hero Branding

The hero repeats the origami crane as the primary event emblem, following the hierarchy of the former infinity treatment. A larger gold crane is centered above the title and uses the same coordinated wing and glide animation as the header crane. Directly below it, the title remains set on two lines as “The Internet of Agents” and “Hackathon”; no separate SWARM wordmark appears between the crane and title. The compact header lockup remains crane plus SWARM, allowing the header to identify the event quickly while the hero presents the full event name.

The hero crane is decorative because the adjacent heading supplies the event name. It stays within the title group at every breakpoint, scales down proportionally on phones, and becomes static when reduced motion is requested.

The hero metadata lists “Oct 30 – Nov 1, 2026” first, followed by the gold separator and “MIT Media Lab.”

## Browser Identity

Both website pages declare a scalable SVG favicon containing only the gold origami crane, with no wordmark, institutional identity, or background panel. The favicon uses a dedicated static asset so browser-tab behavior does not depend on SVG animation support and reduced-motion behavior remains predictable.

## Rebrand Scope

Update user-facing titles, descriptions, navigation, footer text, and the Formspree email subject on both website pages. The homepage hero’s primary button reads “Apply.” The homepage application kicker, homepage footer, and application-page kicker all read “Swarm · Oct 30 – Nov 1, 2026 · MIT Media Lab.” Remove the old glowing infinity brand mark and the duplicate partner strip at the bottom of the homepage. Keep the existing public URL, form endpoint, application fields, and event title.

## Deferred Work

Do not change the flyer, flyer generator, social captions, QR code, or public application URL until the website version has been reviewed and approved.

## Validation

Verify header and hero alignment and legibility at desktop, compact-desktop, tablet, and phone widths; the 32-pixel wide-desktop gap, 22-pixel compact-desktop gap, fluid narrow-screen gap, 4-pixel LAMM optical correction, and 6-pixel E14 offset; all institutional destinations, new-tab security attributes, hover behavior, and keyboard focus; the responsive LAMM symbol and name sizes; coordinated wing and glide movement in both website cranes; the static crane favicon on both pages; reduced-motion fallbacks; the LAMM media fallback; both page headers; navigation behavior; and the absence of user-facing INFINITE branding outside the intentionally deferred flyer assets.
