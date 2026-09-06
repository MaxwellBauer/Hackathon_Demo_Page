/* ============================================================
   SWARM — GOLD FORK · tentacles.js
   A bottom-anchored field of cybernetic anemone sticks that
   only appear underwater (once the #areas section approaches).
   Small, low-poly, cheap to draw: capped segments, shadowBlur
   only on the tip ring, one composite pass per frame.
   ============================================================ */

(() => {
  const canvas = document.getElementById("tentacles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 820px)").matches;

  let W = 0;
  let H = 0;
  let sticks = [];
  let uw = 0;          // smoothed underwater factor 0..1
  let running = false; // rAF active?
  let lastFrame = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  /* ------------------------------------------------------------
     Scroll → underwater factor (mirrors scene.js logic)
  ------------------------------------------------------------ */

  function uwTarget() {
    const el = document.getElementById("areas");
    if (!el) return 1;
    const r = el.getBoundingClientRect();
    const v = (window.innerHeight - r.top) / (window.innerHeight + r.height * 0.5);
    return Math.min(1, Math.max(0, v));
  }

  /* ------------------------------------------------------------
     Stick model — small, capped segments for performance
  ------------------------------------------------------------ */

  function buildSticks() {
    sticks = [];
    const count = isMobile ? Math.min(140, Math.round(W / 8)) : Math.min(220, Math.round(W / 10));
    for (let i = 0; i < count; i++) {
      sticks.push({
        rootX: (i + rand(0.05, 0.95)) / count,  // fraction of width
        n: Math.round(rand(4, 9)),              // segment count (low poly)
        segLen: rand(10, 22),                   // px per segment
        dir0: -Math.PI / 2,                     // grow upward
        amp: rand(0.05, 0.12),                  // sway magnitude
        freq: rand(0.15, 0.4),                  // sway rate
        phase: rand(0, Math.PI * 2),            // sway phase
        lead: rand(0.25, 0.5),                  // phase lag down chain
        curve: rand(-0.03, 0.03),               // resting bend
        hue: rand(41, 48),                      // gold band
        light: rand(56, 68),                    // lightness variation
        thick: rand(0.9, 1.4),                  // stem weight
        tipR: rand(2.2, 3.4),                   // hollow tip ring radius
        pulseSpeed: rand(0.04, 0.12),           // traveling pulse laps/sec
        pulseOffset: rand(0, 1),
      });
    }
  }

  /* ------------------------------------------------------------
     Kinematics — capped chain (low poly)
  ------------------------------------------------------------ */

  function solveChain(stk, t, pts) {
    let x = stk.rootX * W;
    let y = H;
    let ang = stk.dir0;
    pts[0] = x; pts[1] = y;
    for (let i = 0; i < stk.n; i++) {
      const taper = Math.pow((i + 1) / stk.n, 1.15);
      ang += stk.curve +
        Math.sin(t * stk.freq * Math.PI * 2 + stk.phase + i * stk.lead) * stk.amp * taper;
      x += Math.cos(ang) * stk.segLen;
      y += Math.sin(ang) * stk.segLen;
      pts[(i + 1) * 2] = x;
      pts[(i + 1) * 2 + 1] = y;
    }
    return pts;
  }

  /* ------------------------------------------------------------
     Drawing — thin stem, hollow tip ring, tiny pulse
  ------------------------------------------------------------ */

  const _pts = new Float32Array(40); // max segments 18 → 19 points, 38 floats

  function drawStick(stk, t) {
    const pts = solveChain(stk, t, _pts);
    const n = stk.n;
    const hue = stk.hue;

    // faint glow body under the stem (no shadowBlur — too slow ×200)
    ctx.strokeStyle = `hsla(${hue}, 88%, ${stk.light}%, 0.14)`;
    ctx.lineWidth = stk.thick + 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 1; i <= n; i++) ctx.lineTo(pts[i * 2], pts[i * 2 + 1]);
    ctx.stroke();

    // main stem
    ctx.strokeStyle = `hsla(${hue}, 88%, ${stk.light}%, 0.92)`;
    ctx.lineWidth = stk.thick;
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 1; i <= n; i++) ctx.lineTo(pts[i * 2], pts[i * 2 + 1]);
    ctx.stroke();

    // hollow ring at the tip (the only shadowBlur in the frame)
    const tx = pts[n * 2], ty = pts[n * 2 + 1];
    const breathe = 1 + Math.sin(t * 2.4 + stk.pulseOffset * 9) * 0.08;
    ctx.strokeStyle = `hsla(${hue}, 92%, ${stk.light + 12}%, 0.95)`;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = `hsla(${hue}, 92%, 60%, 0.9)`;
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.arc(tx, ty, stk.tipR * breathe, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // tiny pulse riding the stem — midpoint only, no length walk
    const p = (t * stk.pulseSpeed + stk.pulseOffset) % 1;
    const mid = Math.max(1, Math.floor(p * n));
    const mx = pts[mid * 2], my = pts[mid * 2 + 1];
    ctx.fillStyle = `hsla(${hue}, 100%, 86%, 0.9)`;
    ctx.beginPath();
    ctx.arc(mx, my, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ------------------------------------------------------------
     Loop — only runs while underwater
  ------------------------------------------------------------ */

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    for (const stk of sticks) drawStick(stk, t);
  }

  function frame(ms) {
    // Smooth toward the scroll-driven underwater factor and fade the canvas
    // with it — the layer eases in/out as you cross the threshold.
    uw += (uwTarget() - uw) * 0.06;
    canvas.style.opacity = uw.toFixed(3);

    if (uw < 0.02 && uwTarget() < 0.5) {
      ctx.clearRect(0, 0, W, H);
      running = false;
      return; // exit rAF entirely until next scroll/resize check
    }

    // ~30fps cap — halves cost vs every-frame
    if (ms - lastFrame < 33) {
      requestAnimationFrame(frame);
      return;
    }
    lastFrame = ms;

    render(ms / 1000);
    requestAnimationFrame(frame);
  }

  function ensureRunning() {
    if (reducedMotion) return;
    // Wake on the RAW target, not the smoothed value — otherwise a fast
    // scroll down can be missed while `uw` is still easing back up.
    if (!running && uwTarget() >= 0.02) {
      running = true;
      lastFrame = 0;
      requestAnimationFrame(frame);
    }
  }

  /* ------------------------------------------------------------
     Wiring
  ------------------------------------------------------------ */

  function resize() {
    const dpr = 1; // force low-res — glow hides aliasing, big perf win
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildSticks();
    canvas.style.opacity = uw.toFixed(3);
    if (reducedMotion) {
      if (uw > 0.02) render(4.2); // static pose if user prefers reduced motion
    }
    ensureRunning();
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", () => {
    // refresh target & wake the loop when it crosses the threshold
    ensureRunning();
  }, { passive: true });

  uw = uwTarget();
  resize();
  ensureRunning();
})();
