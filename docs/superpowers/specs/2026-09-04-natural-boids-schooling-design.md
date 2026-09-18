# Natural Boids Schooling Design

## Goal

Make the existing origami cranes and fish move as coordinated flocks and schools. The classic boids rules—separation, alignment, and cohesion—must be the primary source of local motion, while preserving the site's current 3D artwork, scroll-driven surface-to-underwater transition, and black-and-gold visual identity.

## Chosen Direction

Use natural coordinated schooling. Reduce the current scripted bait-ball force so fish form fluid schools rather than tight orbiting clumps. Cranes remain looser and more independently spaced than fish.

## Motion Model

Each visible animal evaluates nearby members of its assigned flock or school and combines five steering forces:

1. **Separation:** steer away from very close neighbors to prevent overlap.
2. **Alignment:** match the average velocity of nearby neighbors.
3. **Cohesion:** steer toward the local neighbor center.
4. **Migration:** apply a weak pull toward a slowly moving group destination so schools travel across the scene without becoming rigid balls.
5. **Wander and bounds:** add subtle individual variation and gently turn animals back into the visible volume.

Fish use stronger alignment and cohesion for visibly synchronized schooling. Cranes use stronger separation, weaker cohesion, and a wider formation. Steering acceleration and velocity remain capped, and orientation continues to interpolate smoothly in the travel direction. Existing wing flapping, tail motion, banking, opacity transitions, and reduced-motion behavior remain intact.

## Structure and Performance

The implementation stays in `v2/js/scene.js` and keeps the existing `updateFlock` entry point. Species-specific settings are expressed as named presets rather than scattered conditionals. A small 3D spatial grid indexes animals each frame so every boid checks only nearby grid cells instead of scanning the entire fish population. This keeps the dense desktop school responsive while retaining the existing smaller mobile flock.

Temporary vectors and grid containers are reused inside the animation loop to limit garbage collection. Frame delta remains capped by the existing render loop so returning to a background tab cannot cause large movement jumps.

## Edge Cases

- A boid with no neighbors continues using migration and wander forces.
- Zero-length steering vectors are ignored to avoid invalid normalization.
- Speed floors are applied only when a valid direction exists.
- Boundary steering is gradual; animals do not teleport or visibly bounce.
- Animals interact only with their intended group, avoiding accidental convergence between separate schools.

## Verification

- Run a JavaScript syntax check on `v2/js/scene.js`.
- Serve `v2` locally and confirm the page initializes without console errors.
- Observe cranes near the top of the page and fish after scrolling underwater: both should coordinate locally, avoid overlaps, turn smoothly, and remain within the scene.
- Confirm the mobile population limit and `prefers-reduced-motion` behavior remain present.

