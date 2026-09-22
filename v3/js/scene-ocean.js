/* ============================================================
   INFINITE — scene-ocean.js  (GOLD FORK · separate version)
   Top-down ocean bed. A colony of cute low-poly golden lobsters
   scuttle across the sand, wired together as a living network.
   Sea grass sways in the current. Abyssal black + glowing gold.
   ============================================================ */

import * as THREE from "three";

const canvas = document.getElementById("scene");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 820px)").matches;

/* ------------------------------------------------------------
   Renderer / Scene / Camera  (top-down, close enough to read)
------------------------------------------------------------ */

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  document.body.classList.add("no-webgl");
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 90, 430);

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  2200
);
// Steep top-down view with a slight forward tilt so bodies read in 3D
camera.position.set(0, 132, 46);

/* ------------------------------------------------------------
   Abyssal sky dome (pure graded black)
------------------------------------------------------------ */

const skyGeo = new THREE.SphereGeometry(1000, 32, 24);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: {
    top: { value: new THREE.Color(0x000000) },
    mid: { value: new THREE.Color(0x080604) },
    horizon: { value: new THREE.Color(0x000000) },
  },
  vertexShader: /* glsl */ `
    varying vec3 vPos;
    void main() {
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 top, mid, horizon;
    varying vec3 vPos;
    void main() {
      float h = normalize(vPos).y;
      vec3 col = mix(mid, top, smoothstep(0.08, 0.7, h));
      col = mix(horizon, col, smoothstep(-0.3, 0.1, h));
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

/* ------------------------------------------------------------
   Ocean floor — flat, static gold grid (never moves)
------------------------------------------------------------ */

const BED = 900;

// Flat bed so it can never clip the lobsters.
function bedHeight() {
  return 0;
}

// Static organic tint so the floor keeps its gold variation
function bedTint(x, z) {
  return (
    0.5 +
    0.5 *
      Math.sin(x * 0.045 + Math.sin(z * 0.03) * 2.0) *
      Math.cos(z * 0.038 + Math.sin(x * 0.021) * 1.7)
  );
}

{
  const segs = isMobile ? 48 : 90;
  const geo = new THREE.PlaneGeometry(BED, BED, segs, segs);
  geo.rotateX(-Math.PI / 2);

  const posAttr = geo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);
  const cLow = new THREE.Color(0x1c1406);
  const cMid = new THREE.Color(0x8a6420);
  const cHigh = new THREE.Color(0xffdf8a);
  const tmp = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    posAttr.setY(i, 0);
    const t = THREE.MathUtils.clamp(bedTint(x, z), 0, 1);
    if (t < 0.5) tmp.lerpColors(cLow, cMid, t * 2);
    else tmp.lerpColors(cMid, cHigh, (t - 0.5) * 2);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const fill = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: 0x0b0906,
      emissive: 0x1a1104,
      emissiveIntensity: 0.45,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    })
  );
  scene.add(fill);

  // Grid lifted a touch above the fill — no polygonOffset, so it can
  // never be biased in front of the lobsters.
  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
  );
  wire.position.y = 0.08;
  scene.add(wire);
}

/* ------------------------------------------------------------
   Scattered pebbles — tiny low-poly debris on the bed
------------------------------------------------------------ */

{
  const count = isMobile ? 40 : 90;
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x120d05,
    emissive: 0x2a1c06,
    emissiveIntensity: 0.35,
    roughness: 1.0,
    flatShading: true,
  });
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, count);
  const m = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const x = THREE.MathUtils.randFloatSpread(BED * 0.55);
    const z = THREE.MathUtils.randFloatSpread(BED * 0.55) - 40;
    const s = THREE.MathUtils.randFloat(0.5, 2.0);
    m.position.set(x, s * 0.15, z);
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    m.scale.set(s, s * 0.6, s);
    m.updateMatrix();
    rocks.setMatrixAt(i, m.matrix);
  }
  rocks.instanceMatrix.needsUpdate = true;
  scene.add(rocks);
}

/* ------------------------------------------------------------
   Sea grass — instanced blades swaying in the current
------------------------------------------------------------ */

const grassUniforms = { uTime: { value: 0 } };

{
  const SEG = 4;
  const positions = [];
  const indices = [];
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG;
    const w = 0.5 * (1 - t * 0.92);
    positions.push(-w, t, 0, w, t, 0);
  }
  for (let i = 0; i < SEG; i++) {
    const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);

  const COUNT = isMobile ? 900 : 2600;
  const SPREAD = 560;
  const offsets = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT * 2);
  const phases = new Float32Array(COUNT);
  const tints = new Float32Array(COUNT);
  const angles = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const x = THREE.MathUtils.randFloatSpread(SPREAD);
    const z = THREE.MathUtils.randFloatSpread(SPREAD) - 60;
    offsets[i * 3] = x;
    offsets[i * 3 + 1] = -0.2;
    offsets[i * 3 + 2] = z;
    scales[i * 2] = THREE.MathUtils.randFloat(0.22, 0.5);
    scales[i * 2 + 1] = THREE.MathUtils.randFloat(2.5, 6.5);
    phases[i] = Math.random() * Math.PI * 2;
    tints[i] = Math.random();
    angles[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
  geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 2));
  geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
  geo.setAttribute("aTint", new THREE.InstancedBufferAttribute(tints, 1));
  geo.setAttribute("aAngle", new THREE.InstancedBufferAttribute(angles, 1));
  geo.instanceCount = COUNT;

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: grassUniforms.uTime,
      uBase: { value: new THREE.Color(0x2c1f07) },
      uTip: { value: new THREE.Color(0xffe08a) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      attribute vec3 aOffset;
      attribute vec2 aScale;
      attribute float aPhase;
      attribute float aTint;
      attribute float aAngle;
      varying float vT;
      varying float vTint;

      void main() {
        vT = position.y;
        vTint = aTint;

        vec3 p = position;
        // Current: bend grows toward the tip, two octaves for organic motion
        float sway = sin(uTime * 1.05 + aPhase) * 0.55
                   + sin(uTime * 2.7 + aPhase * 1.7) * 0.22;
        float sway2 = cos(uTime * 0.9 + aPhase * 0.7) * 0.4;
        p.x += sway * vT * vT * 2.2;
        p.z += sway2 * vT * vT * 1.1;

        p.x *= aScale.x;
        p.y *= aScale.y;
        p.z *= aScale.x;

        float c = cos(aAngle), s = sin(aAngle);
        vec3 r = vec3(c * p.x - s * p.z, p.y, s * p.x + c * p.z);
        r += aOffset;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(r, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase, uTip;
      varying float vT;
      varying float vTint;

      void main() {
        vec3 col = mix(uBase, uTip, pow(vT, 0.65));
        col *= 0.82 + vTint * 0.36;
        float a = 0.24 + vT * 0.5;
        gl_FragColor = vec4(col, a);
      }
    `,
  });

  const grass = new THREE.Mesh(geo, mat);
  grass.frustumCulled = false;
  scene.add(grass);
}

/* ------------------------------------------------------------
   Lights — overhead gold key so the shells read from above
------------------------------------------------------------ */

scene.add(new THREE.HemisphereLight(0xffe6b0, 0x050403, 0.85));

const keyLight = new THREE.DirectionalLight(0xffd98a, 1.5);
keyLight.position.set(60, 220, 30);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xd9a038, 0.7);
rimLight.position.set(-120, 120, -140);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xfff6e2, 0.45);
fillLight.position.set(40, 90, 160);
scene.add(fillLight);

/* ------------------------------------------------------------
   Low-poly geometry helper
------------------------------------------------------------ */

function tri(verts, indices) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(verts.flat()), 3)
  );
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Extrude a 2D outline into a flat, faceted slab lying in the XZ plane
// (outline +Y becomes world +Z, so the creature faces forward).
function extrudeShape(points, mat, depth) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth, 0);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

/* ------------------------------------------------------------
   Cute polygon lobster factory  (faces +Z, reads top-down)
------------------------------------------------------------ */

const lobsterPalette = [
  0xf2c15a, 0xe8b74a, 0xd9a038, 0xc9a227,
  0xa88534, 0xe0a63c, 0xbf8f2a, 0xffcf6e,
];

function makeLobster(color) {
  // Bright shell for the body, darker shell for the limbs — this
  // contrast is what makes the silhouette read from straight above.
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.5,
    metalness: 0.2,
    emissive: color,
    emissiveIntensity: 0.32,
    side: THREE.DoubleSide,
  });
  const limbMat = new THREE.MeshStandardMaterial({
    color: 0xb07f28,
    flatShading: true,
    roughness: 0.6,
    metalness: 0.15,
    emissive: 0xd9a038,
    emissiveIntensity: 0.22,
    side: THREE.DoubleSide,
  });

  const group = new THREE.Group();

  // --- Body + tail: one connected low-poly silhouette ---
  const bodyPts = [
    [0.00, 1.06], [0.12, 0.96], [0.26, 0.78], [0.36, 0.50],
    [0.42, 0.18], [0.40, -0.15], [0.33, -0.50], [0.30, -0.80],
    [0.26, -1.00], [0.42, -1.22], [0.40, -1.45], [0.24, -1.60],
    [0.10, -1.68], [0.00, -1.70],
    [-0.10, -1.68], [-0.24, -1.60], [-0.40, -1.45], [-0.42, -1.22],
    [-0.26, -1.00], [-0.30, -0.80], [-0.33, -0.50], [-0.40, -0.15],
    [-0.42, 0.18], [-0.36, 0.50], [-0.26, 0.78], [-0.12, 0.96],
  ];
  group.add(extrudeShape(bodyPts, bodyMat, 0.22));

  // --- Tail segmentation: three thin darker bands ---
  const segBands = [-0.60, -0.80, -1.00];
  for (let i = 0; i < segBands.length; i++) {
    const zc = segBands[i];
    const w = 0.30 - i * 0.03;
    const band = extrudeShape(
      [
        [-w, zc + 0.03],
        [w, zc + 0.03],
        [w, zc - 0.03],
        [-w, zc - 0.03],
      ],
      limbMat,
      0.03
    );
    band.position.y = 0.23;
    group.add(band);
  }

  // --- Antennae ---
  const antennae = new THREE.Group();
  const antL = new THREE.Mesh(
    tri([[-0.05, 0.22, 0.95], [-0.11, 0.22, 0.97], [-0.38, 0.14, 1.72]], [0, 1, 2]),
    limbMat
  );
  const antR = new THREE.Mesh(
    tri([[0.05, 0.22, 0.95], [0.11, 0.22, 0.97], [0.38, 0.14, 1.72]], [0, 1, 2]),
    limbMat
  );
  antennae.add(antL, antR);
  group.add(antennae);

  // --- Eyes ---
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x100b03,
    emissive: 0xffdf8a,
    emissiveIntensity: 0.4,
    roughness: 0.4,
  });
  const eyeGeo = new THREE.SphereGeometry(0.1, 10, 10);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.16, 0.3, 0.72);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.16, 0.3, 0.72);
  group.add(eyeL, eyeR);

  // --- Claws: outline traced directly from the reference silhouette
  //     (rounded palm, long main prong + shorter pincer, wavy gap) ---
  function makeClaw(sign, size) {
    const pivot = new THREE.Group();
    // Same attachment as before, just lowered below the shell top (y=0.22)
    pivot.position.set(sign * 0.26, -0.03, 0.6);

    const raw = [
      [-0.093, 1.5], [0.065, 1.472], [0.21, 1.36], [0.331, 1.194],
      [0.392, 1.011], [0.378, 0.741], [0.344, 0.662], [0.374, 0.507],
      [0.334, 0.326], [0.265, 0.163], [0.182, 0.071], [0.189, 0.025],
      [0.145, -0.059], [0.083, -0.105], [0.058, -0.164], [0.008, -0.18],
      [-0.062, -0.156], [-0.078, -0.098], [-0.124, -0.066], [-0.188, 0.033],
      [-0.161, 0.136], [-0.221, 0.586], [-0.32, 0.738], [-0.392, 1.003],
      [-0.357, 1.231], [-0.323, 1.312], [-0.286, 1.334], [-0.268, 1.229],
      [-0.206, 1.167], [-0.137, 0.974], [-0.038, 0.8], [-0.035, 0.752],
      [0.018, 0.71], [0.011, 0.96], [0.035, 1.043], [-0.011, 1.136],
      [-0.016, 1.216], [-0.086, 1.3], [-0.089, 1.4], [-0.165, 1.475],
    ];
    const pts = raw.map(([x, y]) => [sign * x, y]);

    const pincer = new THREE.Group();
    pincer.add(extrudeShape(pts, limbMat, 0.2));
    pincer.scale.setScalar(size);
    pivot.add(pincer);
    group.add(pivot);
    return { pivot, pincer, sign };
  }

  // Both claws roughly the same size, with a touch of natural variation
  const clawL = makeClaw(-1, THREE.MathUtils.randFloat(0.95, 1.1));
  const clawR = makeClaw(1, THREE.MathUtils.randFloat(0.95, 1.1));

  // --- Legs: short, tucked, four per side ---
  const legs = [];
  const legZ = [0.34, 0.1, -0.14, -0.38];
  for (const sign of [-1, 1]) {
    for (let i = 0; i < legZ.length; i++) {
      const z = legZ[i];
      const hinge = new THREE.Group();
      hinge.position.set(sign * 0.34, 0.06, z);
      const len = 0.5 - i * 0.05;
      const leg = new THREE.Mesh(
        tri(
          [[0, 0, 0], [sign * len, -0.18, -0.14], [sign * len * 0.85, -0.18, 0.12]],
          [0, 1, 2]
        ),
        limbMat
      );
      hinge.add(leg);
      group.add(hinge);
      legs.push({ hinge, sign, phase: i * 0.5 + (sign > 0 ? Math.PI : 0) });
    }
  }

  return { group, bodyMat, limbMat, legs, clawL, clawR, antennae, eyeL, eyeR };
}

/* ------------------------------------------------------------
   Colony — lobsters wander the bed, avoiding each other
------------------------------------------------------------ */

const COLONY = isMobile ? 18 : 34;
const BOUND_X = 100;
const BOUND_Z_MIN = -125;
const BOUND_Z_MAX = 40;
const LINK_DIST = 62;
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
const SIT_Y = 1.0;

const lobsters = [];

function randomTarget(out) {
  out.set(
    THREE.MathUtils.randFloatSpread(BOUND_X * 2),
    0,
    THREE.MathUtils.randFloat(BOUND_Z_MIN + 20, BOUND_Z_MAX - 20)
  );
  return out;
}

// Faint sensor rings on the bed beneath each lobster — grounds them
const ringGeo = new THREE.RingGeometry(0.62, 0.8, 28);
ringGeo.rotateX(-Math.PI / 2);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xffd98a,
  transparent: true,
  opacity: 0.28,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

for (let i = 0; i < COLONY; i++) {
  const color = lobsterPalette[Math.floor(Math.random() * lobsterPalette.length)];
  const { group, bodyMat, limbMat, legs, clawL, clawR, antennae, eyeL, eyeR } =
    makeLobster(color);
  const scale = THREE.MathUtils.randFloat(4.5, 6.5);
  group.scale.setScalar(scale);

  const x = THREE.MathUtils.randFloatSpread(BOUND_X * 1.8);
  const z = THREE.MathUtils.randFloat(BOUND_Z_MIN + 20, BOUND_Z_MAX - 20);
  group.position.set(x, SIT_Y, z);

  const yaw = Math.random() * Math.PI * 2;
  group.rotation.y = yaw;

  scene.add(group);

  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.scale.setScalar(scale * 0.75);
  ring.position.set(x, 0.12, z);
  scene.add(ring);

  lobsters.push({
    group,
    bodyMat,
    limbMat,
    legs,
    clawL,
    clawR,
    antennae,
    eyeL,
    eyeR,
    ring,
    scale,
    vel: new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(3),
    target: randomTarget(new THREE.Vector3()),
    speed: THREE.MathUtils.randFloat(2.2, 3.8),
    phase: Math.random() * Math.PI * 2,
    legFreq: THREE.MathUtils.randFloat(6, 9),
    glowFreq: THREE.MathUtils.randFloat(0.6, 1.6),
    glowBase: THREE.MathUtils.randFloat(0.2, 0.38),
    yaw,
  });
}

/* ------------------------------------------------------------
   Network links — a dynamic graph between nearby lobsters
------------------------------------------------------------ */

const MAX_LINKS = (COLONY * (COLONY - 1)) / 2;
const linkPositions = new Float32Array(MAX_LINKS * 2 * 3);
const linkGeo = new THREE.BufferGeometry();
linkGeo.setAttribute("position", new THREE.BufferAttribute(linkPositions, 3));
const linkMat = new THREE.LineBasicMaterial({
  color: 0xffd98a,
  transparent: true,
  opacity: 0.28,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const links = new THREE.LineSegments(linkGeo, linkMat);
links.frustumCulled = false;
scene.add(links);

// Data packets — tiny sparks riding the links
const PACKETS = isMobile ? 16 : 40;
const packetPos = new Float32Array(PACKETS * 3);
const packetGeo = new THREE.BufferGeometry();
packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
const packetMat = new THREE.PointsMaterial({
  color: 0xfff0c0,
  size: 1.6,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const packets = new THREE.Points(packetGeo, packetMat);
packets.frustumCulled = false;
scene.add(packets);

const packetState = [];
for (let i = 0; i < PACKETS; i++) {
  packetState.push({
    a: Math.floor(Math.random() * COLONY),
    b: Math.floor(Math.random() * COLONY),
    t: Math.random(),
    speed: THREE.MathUtils.randFloat(0.25, 0.7),
  });
}

let activePairs = []; // flat [i, j, i, j, ...]

function updateLinks(t) {
  activePairs.length = 0;
  let v = 0;

  for (let i = 0; i < lobsters.length; i++) {
    const a = lobsters[i].group.position;
    for (let j = i + 1; j < lobsters.length; j++) {
      const b = lobsters[j].group.position;
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      const d2 = dx * dx + dz * dz;
      if (d2 > LINK_DIST_SQ) continue;

      linkPositions[v++] = a.x;
      linkPositions[v++] = a.y;
      linkPositions[v++] = a.z;
      linkPositions[v++] = b.x;
      linkPositions[v++] = b.y;
      linkPositions[v++] = b.z;

      activePairs.push(i, j);
    }
  }

  linkGeo.setDrawRange(0, v / 3);
  linkGeo.attributes.position.needsUpdate = true;
  linkGeo.computeBoundingSphere();

  // Fade the mesh with a slow pulse so the network breathes
  linkMat.opacity = 0.18 + (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.16;
}

function updatePackets(dt) {
  const pairCount = activePairs.length / 2;
  for (let i = 0; i < PACKETS; i++) {
    const p = packetState[i];
    p.t += p.speed * dt;

    if (p.t >= 1 || p.a === p.b || pairCount === 0) {
      if (pairCount > 0) {
        const k = Math.floor(Math.random() * pairCount) * 2;
        p.a = activePairs[k];
        p.b = activePairs[k + 1];
      } else {
        p.a = Math.floor(Math.random() * COLONY);
        p.b = Math.floor(Math.random() * COLONY);
      }
      p.t = 0;
      p.speed = THREE.MathUtils.randFloat(0.25, 0.7);
    }

    const A = lobsters[p.a].group.position;
    const B = lobsters[p.b].group.position;
    packetPos[i * 3] = A.x + (B.x - A.x) * p.t;
    packetPos[i * 3 + 1] = A.y + (B.y - A.y) * p.t + 0.5;
    packetPos[i * 3 + 2] = A.z + (B.z - A.z) * p.t;
  }
  packetGeo.attributes.position.needsUpdate = true;
}

/* ------------------------------------------------------------
   Colony update — steering, scuttle, claw + antenna motion
------------------------------------------------------------ */

const _acc = new THREE.Vector3();
const _sep = new THREE.Vector3();
const _desired = new THREE.Vector3();

function updateColony(dt, t) {
  for (let i = 0; i < lobsters.length; i++) {
    const l = lobsters[i];
    const pos = l.group.position;

    _acc.set(0, 0, 0);

    // Steer toward the current waypoint
    _desired.subVectors(l.target, pos);
    _desired.y = 0;
    const dist = _desired.length();
    if (dist < 6) randomTarget(l.target);
    _desired.normalize().multiplyScalar(l.speed).sub(l.vel);
    _acc.addScaledVector(_desired, 1.4);

    // Soft separation so they never stack up
    _sep.set(0, 0, 0);
    for (let j = 0; j < lobsters.length; j++) {
      if (i === j) continue;
      const o = lobsters[j].group.position;
      const dx = pos.x - o.x;
      const dz = pos.z - o.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 900 && d2 > 1e-3) {
        const inv = 1 / d2;
        _sep.x += dx * inv;
        _sep.z += dz * inv;
      }
    }
    if (_sep.lengthSq() > 0) _acc.addScaledVector(_sep.normalize(), 26);

    // Gentle wander
    _acc.x += Math.sin(t * 0.6 + l.phase * 3.1) * 1.4;
    _acc.z += Math.cos(t * 0.5 + l.phase * 2.3) * 1.4;

    // Soft bounds
    if (pos.x < -BOUND_X) _acc.x += 30;
    if (pos.x > BOUND_X) _acc.x -= 30;
    if (pos.z < BOUND_Z_MIN) _acc.z += 30;
    if (pos.z > BOUND_Z_MAX) _acc.z -= 30;

    l.vel.addScaledVector(_acc, dt);
    const sp = l.vel.length();
    if (sp > l.speed * 1.4) l.vel.multiplyScalar((l.speed * 1.4) / sp);
    pos.addScaledVector(l.vel, dt);

    // Sit on the bed, with a small scuttle bob
    const bob = Math.sin(t * l.legFreq * 0.5 + l.phase) * 0.06;
    pos.y += (SIT_Y + bob - pos.y) * (1 - Math.exp(-3 * dt));

    // Face travel direction (slow, deliberate turn)
    const targetYaw = Math.atan2(l.vel.x, l.vel.z);
    let d = targetYaw - l.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    l.yaw += d * (1 - Math.exp(-1.6 * dt));
    l.group.rotation.y = l.yaw;

    // Scuttle: leg cadence scales with how fast it's walking
    const move = THREE.MathUtils.clamp(sp / l.speed, 0, 1.4);
    for (const leg of l.legs) {
      leg.hinge.rotation.y =
        Math.sin(t * l.legFreq + leg.phase + l.phase) * 0.42 * move;
    }

    // Claws paddle, antennae drift
    const clawWave = Math.sin(t * 1.8 + l.phase) * 0.12;
    l.clawL.pivot.rotation.y = -0.4 + clawWave;
    l.clawR.pivot.rotation.y = 0.4 - clawWave;
    l.antennae.rotation.y = Math.sin(t * 0.9 + l.phase) * 0.05;

    // Communication glow
    l.bodyMat.emissiveIntensity =
      l.glowBase + (Math.sin(t * l.glowFreq + l.phase) * 0.5 + 0.5) * 0.3;
    l.limbMat.emissiveIntensity =
      0.18 + (Math.sin(t * l.glowFreq + l.phase) * 0.5 + 0.5) * 0.18;

    // Keep the sensor ring pinned to the bed (doesn't bob)
    l.ring.position.set(pos.x, 0.12, pos.z);
  }
}

/* ------------------------------------------------------------
   Pointer + scroll parallax
------------------------------------------------------------ */

const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

let scrollProg = 0;
window.addEventListener(
  "scroll",
  () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProg = max > 0 ? window.scrollY / max : 0;
  },
  { passive: true }
);

/* ------------------------------------------------------------
   Resize
------------------------------------------------------------ */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ------------------------------------------------------------
   Loop
------------------------------------------------------------ */

const clock = new THREE.Clock();

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  grassUniforms.uTime.value = t;

  updateColony(dt, t);
  updateLinks(t);
  updatePackets(dt);

  // Top-down camera with a gentle drift + parallax
  const targetY = 132 - scrollProg * 20;
  const targetZ = 46 + scrollProg * 14;

  camera.position.x += (mouse.x * 8 - camera.position.x) * 0.03;
  camera.position.y += (targetY - camera.position.y) * 0.04;
  camera.position.z += (targetZ + mouse.y * 5 - camera.position.z) * 0.04;
  camera.lookAt(0, 0, -40 + scrollProg * 22);

  renderer.render(scene, camera);
  if (!reducedMotion) requestAnimationFrame(frame);
}

frame();
