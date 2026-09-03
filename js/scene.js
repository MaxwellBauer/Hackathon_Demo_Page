/* ============================================================
   INFINITE — scene.js
   Origami crane flock over a dynamic ocean surface that
   transitions underwater with origami fish swarms when you
   scroll to the Tracks section.
   ============================================================ */

import * as THREE from "three";

const canvas = document.getElementById("scene");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 820px)").matches;

/* ------------------------------------------------------------
   Renderer / Scene / Camera
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
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x3a6b8e, 150, 640);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 14, 95);

/* ------------------------------------------------------------
   Sky dome (gradient shader) — changes to underwater tint
------------------------------------------------------------ */

const skyGeo = new THREE.SphereGeometry(900, 32, 24);
// Surface palette
const surfaceTop = new THREE.Color(0x0d2d4a);
const surfaceMid = new THREE.Color(0x2d6b9e);
const surfaceHorizon = new THREE.Color(0x7ab3d9);
const surfaceGlow = new THREE.Color(0xffd9a0);
// Underwater palette (deeper, teal-green, luminous)
const uwTop = new THREE.Color(0x0a3842);
const uwMid = new THREE.Color(0x16505a);
const uwHorizon = new THREE.Color(0x2a7a8a);
const uwGlow = new THREE.Color(0x40a0a0);

const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: {
    top: { value: surfaceTop.clone() },
    mid: { value: surfaceMid.clone() },
    horizon: { value: surfaceHorizon.clone() },
    glow: { value: surfaceGlow.clone() },
  },
  vertexShader: /* glsl */ `
    varying vec3 vPos;
    void main() {
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 top, mid, horizon, glow;
    varying vec3 vPos;
    void main() {
      float h = normalize(vPos).y;              // -1 .. 1
      vec3 col = mix(mid, top, smoothstep(0.08, 0.65, h));
      col = mix(horizon, col, smoothstep(-0.02, 0.22, h));
      float band = exp(-abs(h - 0.015) * 26.0); // sunset glow band
      col += glow * band * 0.55;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

/* ------------------------------------------------------------
   Striped synthwave sun (fades out underwater)
------------------------------------------------------------ */

const sunMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    cTop: { value: new THREE.Color(0xffe8b8) },  // warm cream
    cBot: { value: new THREE.Color(0xffb87a) },  // warm amber
    time: { value: 0 },
    opacity: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 cTop, cBot;
    uniform float time;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      vec3 col = mix(cBot, cTop, vUv.y);
      // horizontal cutout stripes, thicker toward the bottom
      float y = 1.0 - vUv.y;
      float stripe = fract(y * 9.0 - time * 0.04);
      float thickness = mix(0.55, 0.12, vUv.y);   // gap grows downward
      if (vUv.y < 0.5 && stripe < thickness * (0.5 - vUv.y)) discard;
      float glowEdge = smoothstep(0.0, 0.12, vUv.y) ;
      gl_FragColor = vec4(col, 0.95 * glowEdge * opacity);
    }
  `,
});
const sun = new THREE.Mesh(new THREE.CircleGeometry(62, 64), sunMat);
sun.position.set(0, 33, -560);
scene.add(sun);

// halo behind the sun
let sunHalo;
{
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const ctx = cv.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255, 220, 170, 0.45)");
  g.addColorStop(0.45, "rgba(255, 190, 140, 0.18)");
  g.addColorStop(1, "rgba(255, 190, 140, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  sunHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(cv),
      transparent: true,
      depthWrite: false,
    })
  );
  sunHalo.scale.setScalar(300);
  sunHalo.position.copy(sun.position);
  scene.add(sunHalo);
}

/* ------------------------------------------------------------
   Stars (fade out underwater)
------------------------------------------------------------ */

let starsMat;
{
  const starCount = isMobile ? 220 : 450;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 850;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloat(0.12, 1)); // upper dome
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  starsMat = new THREE.PointsMaterial({
    color: 0xcfd8ff,
    size: 1.6,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.75,
    fog: false,
  });
  scene.add(new THREE.Points(geo, starsMat));
}

/* ------------------------------------------------------------
   Ocean surface — animated waves (replaces static terrain)
------------------------------------------------------------ */

let updateOceanColors;
let oceanWireMesh, oceanFillMesh;

{
  const size = 900;
  const segs = isMobile ? 55 : 100;
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  geo.rotateX(-Math.PI / 2);
  const posAttr = geo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  const cLow = new THREE.Color(0x0d1f2d);   // deep navy
  const cMid = new THREE.Color(0x1a3a52);   // dark steel blue
  const cHigh = new THREE.Color(0x4a7290);  // muted steel
  const tmp = new THREE.Color();

  // Ocean height function — animated with time
  function oceanHeight(x, z, time) {
    let h = 0;
    h += Math.sin(x * 0.02 + time * 0.8) * 3.5;
    h += Math.sin(z * 0.03 + time * 1.2) * 2.8;
    h += Math.sin((x + z) * 0.025 + time * 0.6) * 2.2;
    h += Math.sin((x - z) * 0.018 + time * 0.9) * 1.8;
    const valley = Math.exp(-(x * x) / (2 * 140 * 140));
    h *= 1.0 - valley * 0.35;
    const near = THREE.MathUtils.smoothstep(z, 40, 240);
    h *= 1.0 - near * 0.7;
    return h - 5;
  }

  // Color based on wave height
  updateOceanColors = function(time) {
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const h = oceanHeight(x, z, time);
      posAttr.setY(i, h);
      const t = THREE.MathUtils.clamp((h + 5) / 12, 0, 1);
      if (t < 0.5) tmp.lerpColors(cLow, cMid, t * 2);
      else tmp.lerpColors(cMid, cHigh, (t - 0.5) * 2);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    posAttr.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  };

  // Register color attribute first, then initial frame
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  updateOceanColors(0);

  oceanWireMesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })
  );
  scene.add(oceanWireMesh);
  // No separate fill — the wireframe alone defines the surface cleanly
}

/* ------------------------------------------------------------
   Lights
------------------------------------------------------------ */

scene.add(new THREE.HemisphereLight(0xc8e0f0, 0x2a4a60, 1.7));

const sunLight = new THREE.DirectionalLight(0xffd9a0, 2.8);
sunLight.position.set(30, 30, -140);
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0xfff8ec, 1.2);
fillLight.position.set(40, 80, 120);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x7ab3d9, 0.9);
rimLight.position.set(-80, 60, 90);
scene.add(rimLight);

/* ------------------------------------------------------------
   Origami crane factory (surface dwellers)
------------------------------------------------------------ */

const birdPalette = [
  0xfffef8, 0xfffaf0, 0xfff8e8, 0xffffff, // bright warm whites
  0xe8f4f8, 0xd8ecf2, 0xc8e0ec,          // pale ice blues
];

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

function makeCrane(color) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.75,
    metalness: 0.0,
    emissive: color,
    emissiveIntensity: 0.55,
    side: THREE.DoubleSide,
  });
  mat.transparent = true; // needed for underwater fade

  const group = new THREE.Group();

  // body: compact folded diamond
  const nose = [0, 0.02, 0.55];
  const tailTop = [0, 0.16, -0.45];
  const l = [-0.16, 0.0, 0.0];
  const r = [0.16, 0.0, 0.0];
  const topV = [0, 0.18, 0.02];
  const bot = [0, -0.14, 0.05];
  const body = new THREE.Mesh(
    tri(
      [nose, topV, l, r, tailTop, bot],
      [
        0, 1, 2, 0, 3, 1, 0, 2, 5, 0, 5, 3,
        2, 1, 4, 1, 3, 4, 2, 4, 5, 5, 4, 3,
      ]
    ),
    mat
  );
  group.add(body);

  // long graceful neck
  const neck = new THREE.Mesh(
    tri(
      [[-0.05, 0.05, 0.4], [0.05, 0.05, 0.4], [0, -0.02, 1.05]],
      [0, 1, 2]
    ),
    mat
  );
  const head = new THREE.Mesh(
    tri([[0, -0.02, 1.05], [0, -0.1, 1.18], [-0.045, -0.01, 1.03]], [0, 1, 2]),
    mat
  );
  group.add(neck, head);

  // long elegant tail
  const tailMesh = new THREE.Mesh(
    tri(
      [[-0.05, 0.1, -0.35], [0.05, 0.1, -0.35], [0, 0.34, -1.0]],
      [0, 1, 2]
    ),
    mat
  );
  group.add(tailMesh);

  // wings: big triangles hinged at body, swept UP at rest
  function makeWing(sign) {
    const hinge = new THREE.Group();
    hinge.position.set(sign * 0.1, 0.12, 0.05);
    const wing = new THREE.Mesh(
      tri(
        [
          [0, 0, 0.38],
          [0, 0, -0.42],
          [sign * 1.05, 0.1, -0.28],
        ],
        [0, 1, 2]
      ),
      mat
    );
    hinge.add(wing);
    group.add(hinge);
    return { hinge, sign };
  }

  const left = makeWing(-1);
  const right = makeWing(1);

  return { group, left, right, mat };
}

/* ------------------------------------------------------------
   Fish factory — cute origami fish
------------------------------------------------------------ */

const fishPalette = [
  0xff9a6b, 0xffb85e, 0xffd25e, // oranges / golds
  0x5ec8e8, 0x7ad8f0, 0x9ae4f0, // blues / teals
  0xff8a8a, 0xffa0a0,           // pinks / corals
  0xa0e8c8, 0xc0f0d8,           // mint / seafoam
];

function makeFish(color) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.6,
    metalness: 0.0,
    emissive: color,
    emissiveIntensity: 0.45,
    side: THREE.DoubleSide,
  });

  const group = new THREE.Group();

  // Diamond-shaped body (like a cute goldfish)
  const bodyPts = [
    [0, 0, 0.32],     // nose
    [0.28, 0, 0],    // right cheek
    [0, 0.22, 0],    // top fin notch
    [-0.28, 0, 0],   // left cheek
    [0, -0.18, 0],   // bottom
    [0, 0, -0.3],    // tail base
  ];
  const bodyIdx = [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 1, 5];
  const body = new THREE.Mesh(tri(bodyPts, bodyIdx), mat);
  group.add(body);

  // Triangle tail fin (like a cute origami tail)
  const tail = new THREE.Mesh(
    tri(
      [
        [0, 0, -0.28],
        [0.22, 0, -0.48],
        [-0.22, 0, -0.48],
      ],
      [0, 1, 2]
    ),
    mat
  );
  group.add(tail);

  // Top fin (small triangle on the back)
  const topFin = new THREE.Mesh(
    tri(
      [
        [0, 0.15, 0.1],
        [-0.15, 0.02, 0.05],
        [0.15, 0.02, 0.05],
      ],
      [0, 1, 2]
    ),
    mat
  );
  group.add(topFin);

  // Big cute eye (large, white-ish circle)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const eyeGeom = new THREE.SphereGeometry(0.08, 12, 12);
  const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
  eyeL.position.set(-0.1, 0.05, 0.28);
  const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
  eyeR.position.set(0.1, 0.05, 0.28);

  return { group, mat, eyeL, eyeR };
}

/* ------------------------------------------------------------
   Surface flock (cranes) & underwater flock (fish)
------------------------------------------------------------ */

const CRANE_FLOCK_SIZE = isMobile ? 36 : 72;
const FISH_FLOCK_SIZE = isMobile ? 160 : 420; // hundreds for dense school
const NUM_CLUSTERS = 3;
const NUM_BALLS = 6; // more balls — they merge and overlap organically

const flock = []; // cranes
const baitBalls = []; // bait ball formations (like clusters but balls)
const fishAll = []; // all fish
const looker = new THREE.Object3D();

// Crane clusters (normal lissajous paths)
const clusters = [];
for (let c = 0; c < NUM_CLUSTERS; c++) {
  clusters.push({
    center: new THREE.Vector3(),
    seed: c * 2.1,
    speedX: 0.05 + c * 0.015,
    speedY: 0.08 + c * 0.02,
    speedZ: 0.04 + c * 0.012,
    rangeX: 50 + c * 12,
    rangeY: 10 + c * 3,
    rangeZ: 60 + c * 20,
    baseY: 28 + c * 6,
    baseZ: -60 - c * 30,
  });
}

// Bait balls — offset centers that fish swarm around like a sphere
for (let b = 0; b < NUM_BALLS; b++) {
  baitBalls.push({
    center: new THREE.Vector3(),
    seed: b * 1.9,
    speedX: 0.04 + b * 0.008,
    speedY: 0.06 + b * 0.012,
    speedZ: 0.03 + b * 0.01,
    rangeX: 70 + b * 12,
    rangeY: 12 + b * 3,
    rangeZ: 80 + b * 20,
    baseY: -18 - b * 3, // closer to surface
    baseZ: -40 - b * 20, // closer to camera
  });
}

// Setup cranes
for (let i = 0; i < CRANE_FLOCK_SIZE; i++) {
  const color = birdPalette[Math.floor(Math.random() * birdPalette.length)];
  const { group, left, right, mat } = makeCrane(color);
  const scale = THREE.MathUtils.randFloat(2.8, 4.2);
  group.scale.setScalar(scale);

  const clusterIdx = Math.floor(Math.random() * NUM_CLUSTERS);
  const cluster = clusters[clusterIdx];

  const pos = new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(120),
    THREE.MathUtils.randFloat(16, 44),
    THREE.MathUtils.randFloat(-140, 20)
  );
  const vel = new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(1),
    THREE.MathUtils.randFloatSpread(0.3),
    THREE.MathUtils.randFloatSpread(1)
  )
    .normalize()
    .multiplyScalar(THREE.MathUtils.randFloat(8, 13));

  group.position.copy(pos);
  scene.add(group);

  flock.push({
    group,
    left,
    right,
    vel,
    clusterIdx,
    prevDir: vel.clone().normalize(),
    roll: 0,
    phase: Math.random() * Math.PI * 2,
    flapFreq: THREE.MathUtils.randFloat(2.2, 3.4),
    flapAmp: 0,
    prevFlapSin: 0,
    glideSeed: Math.random() * 100,
    mat,
  });
}

// Setup fish
for (let i = 0; i < FISH_FLOCK_SIZE; i++) {
  const color = fishPalette[Math.floor(Math.random() * fishPalette.length)];
  const { group, mat, eyeL, eyeR } = makeFish(color);
  const scale = THREE.MathUtils.randFloat(2.5, 4.5); // larger fish
  group.scale.setScalar(scale);

  const clusterIdx = Math.floor(Math.random() * NUM_BALLS);
  const cluster = baitBalls[clusterIdx];

  const pos = new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(100),
    THREE.MathUtils.randFloat(-24, -10), // closer to surface
    THREE.MathUtils.randFloat(-100, 10) // closer to camera
  );
  const vel = new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(1),
    THREE.MathUtils.randFloatSpread(0.3),
    THREE.MathUtils.randFloatSpread(1)
  )
    .normalize()
    .multiplyScalar(THREE.MathUtils.randFloat(6, 10));

  group.position.copy(pos);
  // Fish start invisible
  mat.transparent = true;
  mat.opacity = 0;
  group.visible = false;
  scene.add(group);

  fishAll.push({
    group,
    mat,
    vel,
    clusterIdx,
    prevDir: vel.clone().normalize(),
    roll: 0,
    phase: Math.random() * Math.PI * 2,
    wiggleFreq: THREE.MathUtils.randFloat(3.0, 4.5),
    wiggleAmp: 0,
    glideSeed: Math.random() * 100,
  });
}

const _sep = new THREE.Vector3();
const _ali = new THREE.Vector3();
const _coh = new THREE.Vector3();
const _acc = new THREE.Vector3();
const _tmp = new THREE.Vector3();
const _diff = new THREE.Vector3();

function limitMag(v, max) {
  const m = v.length();
  if (m > max) v.multiplyScalar(max / m);
  return v;
}

// Generic boids update — works for both cranes and fish
function updateFlock(flockArr, clusterArr, dt, t, isCrane) {
  // Update cluster centers
  for (let c = 0; c < clusterArr.length; c++) {
    const cl = clusterArr[c];
    cl.center.set(
      Math.sin(t * cl.speedX + cl.seed) * cl.rangeX,
      cl.baseY + Math.sin(t * cl.speedY + cl.seed * 2) * cl.rangeY,
      cl.baseZ + Math.sin(t * cl.speedZ + cl.seed * 3) * cl.rangeZ
    );
  }

  const PERCEPTION = 26;
  const PERCEPTION_SQ = PERCEPTION * PERCEPTION;
  const SEP_R = isCrane ? 10 : 14; // larger separation for fish so they don't clump
  const SEP_SQ = SEP_R * SEP_R;
  const MIN_SPEED = isCrane ? 8 : 5;
  const MAX_SPEED = isCrane ? 22 : 16;
  const MAX_FORCE = isCrane ? 28 : 22;
  // Bait ball radius — fish orbit within this sphere
  const BALL_R = 18;

  for (let i = 0; i < flockArr.length; i++) {
    const b = flockArr[i];
    const pos = b.group.position;
    const myCluster = clusterArr[b.clusterIdx];

    _sep.set(0, 0, 0);
    _ali.set(0, 0, 0);
    _coh.set(0, 0, 0);
    let nAli = 0, nCoh = 0;

    for (let j = 0; j < flockArr.length; j++) {
      if (i === j) continue;
      const o = flockArr[j];
      _diff.subVectors(pos, o.group.position);
      const d2 = _diff.lengthSq();
      if (d2 > PERCEPTION_SQ) continue;

      if (d2 < SEP_SQ && d2 > 1e-4) {
        _sep.addScaledVector(_diff, 1 / d2);
      }

      if (o.clusterIdx === b.clusterIdx) {
        _ali.add(o.vel);
        _coh.add(o.group.position);
        nAli++;
        nCoh++;
      }
    }

    _acc.set(0, 0, 0);

    if (_sep.lengthSq() > 0) {
      _sep.normalize().multiplyScalar(MAX_SPEED).sub(b.vel);
      _acc.addScaledVector(limitMag(_sep, MAX_FORCE), 2.8); // stronger separation
    }
    if (nAli > 0) {
      _ali.divideScalar(nAli).normalize().multiplyScalar(MAX_SPEED).sub(b.vel);
      _acc.addScaledVector(limitMag(_ali, MAX_FORCE), 1.1);
    }
    if (nCoh > 0) {
      _coh.divideScalar(nCoh).sub(pos).normalize().multiplyScalar(MAX_SPEED).sub(b.vel);
      _acc.addScaledVector(limitMag(_coh, MAX_FORCE), 0.85);
    }

    // Fish: attract toward ball center with organic, multi-frequency movement
    if (!isCrane) {
      _tmp.subVectors(myCluster.center, pos);
      // Primary pull — keeps the school coherent
      _acc.addScaledVector(_tmp.normalize().multiplyScalar(MAX_SPEED), 3.2);
      // Organic swirl — each ball drifts at a different frequency (no perfect circles)
      const swirlFreq = 0.6 + b.glideSeed * 0.004;
      const swirl = Math.sin(t * swirlFreq * Math.PI * 2 + b.glideSeed * Math.PI * 2);
      const swirl2 = Math.cos(t * 0.37 + b.glideSeed * Math.PI * 3);
      _acc.x += swirl * 8;
      _acc.y += swirl2 * 4;
      // Second-order organic motion
      _acc.x += Math.sin(t * 0.19 + b.glideSeed * 9.1) * 5;
      _acc.z += Math.cos(t * 0.23 + b.glideSeed * 7.3) * 5;
      // Slight vertical compression for that shoe-shape look
      _acc.y -= (_tmp.y * 2) + Math.sin(t * 0.21 + b.glideSeed * 4.7) * 1.5;
    } else {
      // Crane pull toward cluster (weaker than fish)
      _tmp.subVectors(myCluster.center, pos).normalize().multiplyScalar(MAX_SPEED).sub(b.vel);
      _acc.addScaledVector(limitMag(_tmp, MAX_FORCE), 0.6);
    }

    // Gentle wander
    if (isCrane) {
      _acc.x += Math.sin(t * 1.1 + b.glideSeed * 13.7) * 3.5;
      _acc.y += Math.cos(t * 0.9 + b.glideSeed * 7.1) * 1.8;
      _acc.z += Math.sin(t * 1.0 + b.glideSeed * 3.3) * 3.5;
    } else {
      // Fish subtler wander — they should look like they're in place
      _acc.x += Math.sin(t * 0.5 + b.glideSeed * 13.7) * 1.2;
      _acc.y += Math.cos(t * 0.4 + b.glideSeed * 7.1) * 0.8;
      _acc.z += Math.sin(t * 0.5 + b.glideSeed * 3.3) * 1.2;
    }

    // Soft bounds
    const boundsX = 140;
    const boundsYmin = isCrane ? 12 : -28;
    const boundsYmax = isCrane ? 48 : -8;
    const boundsZmin = -120;
    const boundsZmax = 20;
    if (Math.abs(pos.x) > boundsX) _acc.x -= Math.sign(pos.x) * 35;
    if (pos.y < boundsYmin) _acc.y += 35;
    if (pos.y > boundsYmax) _acc.y -= 35;
    if (pos.z < boundsZmin) _acc.z += 35;
    if (pos.z > boundsZmax) _acc.z -= 35;

    b.vel.addScaledVector(limitMag(_acc, MAX_FORCE), dt);
    const speed = b.vel.length();
    if (speed > MAX_SPEED) b.vel.multiplyScalar(MAX_SPEED / speed);
    if (speed < MIN_SPEED) b.vel.multiplyScalar(MIN_SPEED / Math.max(speed, 1e-4));
    pos.addScaledVector(b.vel, dt);

    // Orientation (smooth) + banking
    looker.position.copy(pos);
    _tmp.addVectors(pos, b.vel);
    looker.lookAt(_tmp);
    b.group.quaternion.slerp(looker.quaternion, 1 - Math.exp(-6 * dt));

    const dir = _tmp.copy(b.vel).normalize();
    const turn = b.prevDir.x * dir.z - b.prevDir.z * dir.x;
    const targetRoll = THREE.MathUtils.clamp(-turn * 8, -0.55, 0.55);
    b.roll += (targetRoll - b.roll) * (1 - Math.exp(-4 * dt));
    b.group.rotateZ(b.roll);
    b.prevDir.copy(dir);

    if (isCrane) {
      // Crane flap animation
      const flapGate = THREE.MathUtils.smoothstep(
        Math.sin(t * 0.45 + b.glideSeed * 6.0), -0.15, 0.15
      );
      b.flapAmp += (flapGate - b.flapAmp) * (1 - Math.exp(-5 * dt));
      const flapPhase = t * b.flapFreq * Math.PI * 2 + b.phase;
      const flapSin = Math.sin(flapPhase);
      if (b.flapAmp > 0.4 && b.prevFlapSin >= 0 && flapSin < 0) {
        b.vel.y += 2.6 * b.flapAmp;
      }
      b.prevFlapSin = flapSin;
      const wingAngle = 0.62 - b.flapAmp * (flapSin * 0.5 + 0.5) * 1.35;
      b.left.hinge.rotation.z = wingAngle;
      b.right.hinge.rotation.z = -wingAngle;
    } else {
      // Fish tail wiggle
      const wiggle = Math.sin(t * b.wiggleFreq + b.phase) * 0.3;
      b.group.rotation.z += wiggle;
      // Cute tail bob
      b.group.position.y += Math.sin(t * 0.4 + b.phase * 0.5) * 0.1;
    }
  }
}

/* ------------------------------------------------------------
   Scroll tracking + underwater transition
------------------------------------------------------------ */

const collabSection = document.getElementById("areas");
const tracksSection = document.getElementById("judging");

let underwaterProgress = 0; // 0 = surface, 1 = underwater
let targetProgress = 0;
let waterFadeTarget = 1;   // 1 = water visible, 0 = water gone
let waterFade = 1;

// On scroll: underwater transition starts at collaboration (03),
// water fades away as we scroll toward tracks (04)
function updateScrollTargets() {
  const cRect = collabSection.getBoundingClientRect();
  targetProgress = THREE.MathUtils.clamp(
    (window.innerHeight - cRect.top) / (window.innerHeight + cRect.height * 0.5),
    0, 1
  );
  const tRect = tracksSection.getBoundingClientRect();
  // water visible until tracks reaches near the top of the viewport
  waterFadeTarget = THREE.MathUtils.clamp(
    tRect.top / (window.innerHeight * 0.9),
    0, 1
  );
}

window.addEventListener("scroll", updateScrollTargets, { passive: true });
updateScrollTargets();

// Mouse + generic scroll
const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

let scrollProg = 0;
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProg = max > 0 ? window.scrollY / max : 0;
}, { passive: true });

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

  // Simple cross-fade between surface and underwater — no camera dive
  underwaterProgress += (targetProgress - underwaterProgress) * 0.025;
  const uw = underwaterProgress;

  // Sun and stars fade out underwater
  sunMat.uniforms.time.value = t;
  sunMat.uniforms.opacity.value = Math.max(0, 1 - uw * 1.4);
  sunHalo.material.opacity = Math.max(0, 1 - uw * 1.4);
  starsMat.opacity = Math.max(0, 0.75 - uw * 1.5);

  // Sky: surface above, underwater below — hard swap at threshold, no lerp
  if (uw < 0.5) {
    skyMat.uniforms.top.value.copy(surfaceTop);
    skyMat.uniforms.mid.value.copy(surfaceMid);
    skyMat.uniforms.horizon.value.copy(surfaceHorizon);
    skyMat.uniforms.glow.value.copy(surfaceGlow);
  } else {
    skyMat.uniforms.top.value.copy(uwTop);
    skyMat.uniforms.mid.value.copy(uwMid);
    skyMat.uniforms.horizon.value.copy(uwHorizon);
    skyMat.uniforms.glow.value.copy(uwGlow);
  }

  // Fog: surface above, underwater below — hard swap
  if (uw < 0.5) {
    scene.fog.color.set(0x3a6b8e);
    scene.fog.near = 150;
    scene.fog.far = 640;
  } else {
    scene.fog.color.set(0x16505a);
    scene.fog.near = 60;
    scene.fog.far = 240;
  }

  // Ocean waves: animate on surface, completely hidden underwater
  updateOceanColors(t);
  oceanWireMesh.visible = uw < 0.5;

  // Cranes fade out; fish fade in — cross-fade overlap is intentional
  const craneOpacity = Math.max(0, 1 - uw * 1.5);
  const fishOpacity  = Math.min(1, Math.max(0, (uw - 0.08) * 1.6));

  if (craneOpacity > 0) {
    updateFlock(flock, clusters, dt, t, true);
    for (let b of flock) {
      b.mat.opacity = craneOpacity;
    }
  }

  if (fishOpacity > 0) {
    updateFlock(fishAll, baitBalls, dt, t, false);
    for (let f of fishAll) {
      f.mat.opacity = fishOpacity;
      f.group.visible = uw > 0.03;
    }
  } else {
    for (let f of fishAll) {
      f.group.visible = false;
      f.mat.opacity = 0;
    }
  }

  // Camera: gentle parallax + scroll, NO underwater dive — just a cross-fade
  const targetY = 14 - scrollProg * 6;
  const targetZ = 95 - scrollProg * 15;

  camera.position.x += (mouse.x * 6 - camera.position.x) * 0.03;
  camera.position.y += (targetY - mouse.y * 2.5 - camera.position.y) * 0.04;
  camera.position.z += (targetZ - camera.position.z) * 0.04;

  // Look at horizon (above water) or school center (underwater)
  const lookYSurface = 25 - scrollProg * 9;
  const lookYUnderwater = -16; // closer to the fish depth
  const lookY = lookYSurface * (1 - uw) + lookYUnderwater * uw;
  camera.lookAt(0, lookY, -60);

  renderer.render(scene, camera);
  if (!reducedMotion) requestAnimationFrame(frame);
}

frame();