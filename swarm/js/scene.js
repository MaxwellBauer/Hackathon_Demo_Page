/* ============================================================
   SWARM — scene.js
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
scene.fog = new THREE.Fog(0x000000, 150, 640);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 14, 95);

/* ------------------------------------------------------------
    Abyss-black sky dome (sun + sunset band removed in gold fork)
------------------------------------------------------------ */

const skyGeo = new THREE.SphereGeometry(900, 32, 24);
// Surface palette — graded black
const surfaceTop = new THREE.Color(0x030303);
const surfaceMid = new THREE.Color(0x090807);
const surfaceHorizon = new THREE.Color(0x000000);
// Underwater palette — deeper black
const uwTop = new THREE.Color(0x000000);
const uwMid = new THREE.Color(0x060504);
const uwHorizon = new THREE.Color(0x000000);

const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: {
    top: { value: surfaceTop.clone() },
    mid: { value: surfaceMid.clone() },
    horizon: { value: surfaceHorizon.clone() },
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
      float h = normalize(vPos).y;              // -1 .. 1
      vec3 col = mix(mid, top, smoothstep(0.08, 0.65, h));
      col = mix(horizon, col, smoothstep(-0.02, 0.22, h));
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

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
    color: 0xffe2a8,
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

  const cLow = new THREE.Color(0x3a2a08);   // deep antique gold
  const cMid = new THREE.Color(0xb88a2a);   // burnished gold
  const cHigh = new THREE.Color(0xffe8a0);  // glowing gold crests
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
      opacity: 0.55,
      side: THREE.DoubleSide,
    })
  );
  scene.add(oceanWireMesh);
  // No separate fill — the wireframe alone defines the surface cleanly
}

/* ------------------------------------------------------------
   Lights
------------------------------------------------------------ */

scene.add(new THREE.HemisphereLight(0xfff2d8, 0x0a0a08, 1.7));

const sunLight = new THREE.DirectionalLight(0xffdf8a, 2.8);
sunLight.position.set(30, 30, -140);
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0xfff8ec, 1.2);
fillLight.position.set(40, 80, 120);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xd9a038, 0.9);
rimLight.position.set(-80, 60, 90);
scene.add(rimLight);

/* ------------------------------------------------------------
   Origami crane factory (surface dwellers)
------------------------------------------------------------ */

const birdPalette = [
  0xffe8b8, 0xffdf8a, 0xf2c15a, 0xe8b74a, // bright golds
  0xc9a227, 0xa88534, 0xd9a038,           // antique golds
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

  // Body: puffed diamond — tall peak on top, wide flanks, rear faces
  // taper back so the butt flows smoothly into the tail.
  const nose = [0, 0.06, 0.4];
  const tailBase = [0, 0.16, -0.32];
  const l = [-0.26, 0.0, 0.0];
  const r = [0.26, 0.0, 0.0];
  const topV = [0, 0.34, -0.06];
  const bot = [0, -0.2, -0.04];
  const body = new THREE.Mesh(
    tri(
      [nose, topV, l, r, tailBase, bot],
      [
        0, 1, 2, 0, 3, 1, 0, 2, 5, 0, 5, 3,
        2, 1, 4, 1, 3, 4, 2, 4, 5, 5, 4, 3,
      ]
    ),
    mat
  );
  group.add(body);

  // Folded spike: rectangular cross-section at the base (width ×
  // depth), collapsing to a tip. Used for neck and tail — both are
  // reverse-folds that emerge from inside the body with a wide root.
  function makeSpike(baseY, baseZ, tipY, tipZ, halfW, halfD) {
    const a = [-halfW, baseY, baseZ + halfD * 0.5];
    const b = [halfW, baseY, baseZ + halfD * 0.5];
    const c = [0, baseY + halfW * 0.8, baseZ - halfD];
    const d = [0, baseY - halfW * 0.6, baseZ + halfD];
    const tip = [0, tipY, tipZ];
    return tri(
      [a, b, c, d, tip],
      [
        0, 1, 4,
        1, 2, 4,
        2, 0, 4,
        0, 3, 4, 3, 1, 4, 2, 3, 4,
      ]
    );
  }

  // Neck: rises at a shallow ~35° from the body axis — the classic
  // origami-crane silhouette. Emerges from the body's front and
  // reaches well past the nose. dz = 0.85, dy = 0.6 → ~35°
  const neck = new THREE.Mesh(makeSpike(-0.02, 0.16, 0.58, 1.01, 0.1, 0.09), mat);
  group.add(neck);

  // Head: folded down ~90° at the neck tip, beak pointing forward-down
  const head = new THREE.Mesh(
    tri(
      [
        [0, 0.58, 1.01],      // neck tip (fold point)
        [0, 0.61, 1.05],      // top of head fold
        [0, 0.4, 1.22],       // beak tip — forward & down
        [-0.05, 0.56, 1.03],  // left cheek
        [0.05, 0.56, 1.03],   // right cheek
      ],
      [0, 1, 2, 0, 3, 4, 0, 4, 2, 0, 2, 1, 1, 3, 0]
    ),
    mat
  );
  group.add(head);

  // Tail: long spike at ~43°, slightly steeper than the neck. The base
  // is pushed deep into the body so the butt flows into the tail with
  // no notch. dz = 0.62, dy = 0.58 → ~43°
  const tailMesh = new THREE.Mesh(makeSpike(0.02, -0.05, 0.6, -0.67, 0.1, 0.09), mat);
  group.add(tailMesh);

  // Wings: simple swept triangles (the site's shape), fitted so the
  // hinge sits INSIDE the torso at its vertical midpoint (y ≈ 0.06,
  // 0.24 above the bottom ridge) and x = ±0.16 — buried inside the
  // body's ±0.26 silhouette. The chord (between the two medial/root
  // vertices) is shortened so both root vertices stay within the
  // torso diamond's top-ridge footprint: front z=0.30, rear z=-0.20.
  function makeWing(sign) {
    const hinge = new THREE.Group();
    hinge.position.set(sign * 0.16, 0.06, -0.05); // torso midpoint, inside the body
    const wing = new THREE.Mesh(
      tri(
        [
          [-sign * 0.16, 0, 0.35],        // root front → inside diamond (world z = 0.30)
          [-sign * 0.16, 0, -0.15],       // root rear  → inside diamond (world z = -0.20)
          [sign * 1.3, 0.12, -0.25],      // tip, swept back
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
  0xffd25e, 0xffb85e, 0xffe8b8, // golds / ambers
  0xf2c15a, 0xe8b74a, 0xd9a038, // molten golds
  0xffdf8a, 0xc9a227,           // bright & antique gold
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
const NUM_FISH_SCHOOLS = 6;

const flock = []; // cranes
const fishSchools = []; // independently migrating fish schools
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

// Fish-school destinations drift slowly across the underwater scene
for (let b = 0; b < NUM_FISH_SCHOOLS; b++) {
  fishSchools.push({
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

  const clusterIdx = Math.floor(Math.random() * NUM_FISH_SCHOOLS);

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

const BOID_PRESETS = {
  crane: {
    perception: 34,
    separationRadius: 12,
    minSpeed: 8,
    maxSpeed: 20,
    maxForce: 24,
    separationWeight: 2.5,
    alignmentWeight: 1.15,
    cohesionWeight: 0.55,
    migrationWeight: 0.35,
    wander: { x: 3.2, y: 1.5, z: 3.2 },
    bounds: { x: 140, yMin: 12, yMax: 48, zMin: -120, zMax: 20 },
    boundaryForce: 35,
    isCrane: true,
  },
  fish: {
    perception: 26,
    separationRadius: 11,
    minSpeed: 6,
    maxSpeed: 15,
    maxForce: 20,
    separationWeight: 2.2,
    alignmentWeight: 1.65,
    cohesionWeight: 1.15,
    migrationWeight: 0.45,
    wander: { x: 0.9, y: 0.45, z: 0.9 },
    bounds: { x: 140, yMin: -28, yMax: -8, zMin: -120, zMax: 20 },
    boundaryForce: 32,
    isCrane: false,
  },
};

// Reuse grid buckets every frame so dense fish schools only inspect nearby boids.
const spatialGrid = new Map();
const gridBuckets = [];
let activeGridBuckets = 0;
const GRID_AXIS_SIZE = 64;
const GRID_AXIS_OFFSET = GRID_AXIS_SIZE / 2;

function gridKey(clusterIdx, x, y, z) {
  return (((clusterIdx * GRID_AXIS_SIZE + x + GRID_AXIS_OFFSET) * GRID_AXIS_SIZE
    + y + GRID_AXIS_OFFSET) * GRID_AXIS_SIZE + z + GRID_AXIS_OFFSET);
}

function buildSpatialGrid(flockArr, cellSize) {
  spatialGrid.clear();
  activeGridBuckets = 0;

  for (const boid of flockArr) {
    const pos = boid.group.position;
    boid.gridX = Math.floor(pos.x / cellSize);
    boid.gridY = Math.floor(pos.y / cellSize);
    boid.gridZ = Math.floor(pos.z / cellSize);

    const key = gridKey(boid.clusterIdx, boid.gridX, boid.gridY, boid.gridZ);
    let bucket = spatialGrid.get(key);
    if (!bucket) {
      bucket = gridBuckets[activeGridBuckets] || [];
      bucket.length = 0;
      gridBuckets[activeGridBuckets] = bucket;
      activeGridBuckets++;
      spatialGrid.set(key, bucket);
    }
    bucket.push(boid);
  }
}

function limitMag(vector, max) {
  const magnitude = vector.length();
  if (magnitude > max) vector.multiplyScalar(max / magnitude);
  return vector;
}

function steer(vector, velocity, config) {
  if (vector.lengthSq() < 1e-6) return vector.set(0, 0, 0);
  vector.normalize().multiplyScalar(config.maxSpeed).sub(velocity);
  return limitMag(vector, config.maxForce);
}

// Natural boids update shared by the looser crane flock and tighter fish schools.
function updateFlock(flockArr, clusterArr, dt, t, config) {
  for (let c = 0; c < clusterArr.length; c++) {
    const cluster = clusterArr[c];
    cluster.center.set(
      Math.sin(t * cluster.speedX + cluster.seed) * cluster.rangeX,
      cluster.baseY + Math.sin(t * cluster.speedY + cluster.seed * 2) * cluster.rangeY,
      cluster.baseZ + Math.sin(t * cluster.speedZ + cluster.seed * 3) * cluster.rangeZ
    );
  }

  const perceptionSq = config.perception * config.perception;
  const separationSq = config.separationRadius * config.separationRadius;
  buildSpatialGrid(flockArr, config.perception);

  for (const boid of flockArr) {
    const pos = boid.group.position;
    const destination = clusterArr[boid.clusterIdx];

    _sep.set(0, 0, 0);
    _ali.set(0, 0, 0);
    _coh.set(0, 0, 0);
    let neighborCount = 0;

    for (let gx = boid.gridX - 1; gx <= boid.gridX + 1; gx++) {
      for (let gy = boid.gridY - 1; gy <= boid.gridY + 1; gy++) {
        for (let gz = boid.gridZ - 1; gz <= boid.gridZ + 1; gz++) {
          const bucket = spatialGrid.get(gridKey(boid.clusterIdx, gx, gy, gz));
          if (!bucket) continue;

          for (const other of bucket) {
            if (other === boid) continue;
            _diff.subVectors(pos, other.group.position);
            const distanceSq = _diff.lengthSq();
            if (distanceSq > perceptionSq || distanceSq < 1e-4) continue;

            if (distanceSq < separationSq) {
              _sep.addScaledVector(_diff, 1 / distanceSq);
            }
            _ali.add(other.vel);
            _coh.add(other.group.position);
            neighborCount++;
          }
        }
      }
    }

    _acc.set(0, 0, 0);

    if (_sep.lengthSq() > 0) {
      _acc.addScaledVector(steer(_sep, boid.vel, config), config.separationWeight);
    }
    if (neighborCount > 0) {
      _ali.divideScalar(neighborCount);
      _acc.addScaledVector(steer(_ali, boid.vel, config), config.alignmentWeight);

      _coh.divideScalar(neighborCount).sub(pos);
      _acc.addScaledVector(steer(_coh, boid.vel, config), config.cohesionWeight);
    }

    // A weak migrating destination moves each school through the scene without
    // overpowering the local separation, alignment, and cohesion rules.
    _tmp.subVectors(destination.center, pos);
    _acc.addScaledVector(steer(_tmp, boid.vel, config), config.migrationWeight);

    const wanderRate = config.isCrane ? 1 : 0.55;
    _acc.x += Math.sin(t * wanderRate + boid.glideSeed * 13.7) * config.wander.x;
    _acc.y += Math.cos(t * wanderRate * 0.8 + boid.glideSeed * 7.1) * config.wander.y;
    _acc.z += Math.sin(t * wanderRate * 0.9 + boid.glideSeed * 3.3) * config.wander.z;

    const bounds = config.bounds;
    if (Math.abs(pos.x) > bounds.x) {
      _acc.x -= Math.sign(pos.x) * config.boundaryForce;
    }
    if (pos.y < bounds.yMin) _acc.y += config.boundaryForce;
    if (pos.y > bounds.yMax) _acc.y -= config.boundaryForce;
    if (pos.z < bounds.zMin) _acc.z += config.boundaryForce;
    if (pos.z > bounds.zMax) _acc.z -= config.boundaryForce;

    boid.vel.addScaledVector(limitMag(_acc, config.maxForce), dt);
    const speed = boid.vel.length();
    if (speed > config.maxSpeed) boid.vel.multiplyScalar(config.maxSpeed / speed);
    if (speed < config.minSpeed && speed > 1e-4) {
      boid.vel.multiplyScalar(config.minSpeed / speed);
    }
    pos.addScaledVector(boid.vel, dt);

    looker.position.copy(pos);
    _tmp.addVectors(pos, boid.vel);
    looker.lookAt(_tmp);
    boid.group.quaternion.slerp(looker.quaternion, 1 - Math.exp(-6 * dt));

    const direction = _tmp.copy(boid.vel).normalize();
    const turn = boid.prevDir.x * direction.z - boid.prevDir.z * direction.x;
    const targetRoll = THREE.MathUtils.clamp(-turn * 8, -0.55, 0.55);
    boid.roll += (targetRoll - boid.roll) * (1 - Math.exp(-4 * dt));
    boid.group.rotateZ(boid.roll);
    boid.prevDir.copy(direction);

    if (config.isCrane) {
      const flapGate = THREE.MathUtils.smoothstep(
        Math.sin(t * 0.45 + boid.glideSeed * 6), -0.15, 0.15
      );
      boid.flapAmp += (flapGate - boid.flapAmp) * (1 - Math.exp(-5 * dt));
      const flapPhase = t * boid.flapFreq * Math.PI * 2 + boid.phase;
      const flapSin = Math.sin(flapPhase);
      if (boid.flapAmp > 0.4 && boid.prevFlapSin >= 0 && flapSin < 0) {
        boid.vel.y += 2.6 * boid.flapAmp;
      }
      boid.prevFlapSin = flapSin;
      const wingAngle = 0.62 - boid.flapAmp * (flapSin * 0.5 + 0.5) * 1.35;
      boid.left.hinge.rotation.z = wingAngle;
      boid.right.hinge.rotation.z = -wingAngle;
    } else {
      const wiggle = Math.sin(t * boid.wiggleFreq + boid.phase) * 0.3;
      boid.group.rotation.z += wiggle;
      boid.group.position.y += Math.sin(t * 0.4 + boid.phase * 0.5) * 0.1;
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

  // Stars fade out underwater
  starsMat.opacity = Math.max(0, 0.75 - uw * 1.5);

  // Sky: surface above, underwater below — hard swap at threshold, no lerp
  if (uw < 0.5) {
    skyMat.uniforms.top.value.copy(surfaceTop);
    skyMat.uniforms.mid.value.copy(surfaceMid);
    skyMat.uniforms.horizon.value.copy(surfaceHorizon);
  } else {
    skyMat.uniforms.top.value.copy(uwTop);
    skyMat.uniforms.mid.value.copy(uwMid);
    skyMat.uniforms.horizon.value.copy(uwHorizon);
  }

  // Fog: surface above, underwater below — hard swap
  if (uw < 0.5) {
    scene.fog.color.set(0x000000);
    scene.fog.near = 150;
    scene.fog.far = 640;
  } else {
    scene.fog.color.set(0x050403);
    scene.fog.near = 60;
    scene.fog.far = 240;
  }

  // Ocean waves: smoothly fade out as we transition underwater
  const oceanFade = Math.max(0, 1 - uw * 1.5);
  if (oceanFade > 0) {
    oceanWireMesh.visible = true;
    oceanWireMesh.material.opacity = 0.55 * oceanFade;
    updateOceanColors(t);
  } else {
    oceanWireMesh.visible = false;
  }

  // Cranes fade out; fish fade in — cross-fade overlap is intentional
  const craneOpacity = Math.max(0, 1 - uw * 1.5);
  const fishOpacity  = Math.min(1, Math.max(0, (uw - 0.08) * 1.6));

  if (craneOpacity > 0) {
    updateFlock(flock, clusters, dt, t, BOID_PRESETS.crane);
    for (let b of flock) {
      b.mat.opacity = craneOpacity;
    }
  }

  if (fishOpacity > 0) {
    updateFlock(fishAll, fishSchools, dt, t, BOID_PRESETS.fish);
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