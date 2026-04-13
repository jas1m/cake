/* =============================================
   Lightweight Animated Background
   — Floating balloons + sparkle particles
   Runs on two off-screen canvases, ~60fps,
   will NOT interfere with mic / audio context
   ============================================= */

(function () {
  /* ---- Balloons ---- */
  const bCanvas = document.getElementById("balloonCanvas");
  const bCtx = bCanvas.getContext("2d");

  /* ---- Sparkles ---- */
  const sCanvas = document.getElementById("sparkleCanvas");
  const sCtx = sCanvas.getContext("2d");

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    bCanvas.width = sCanvas.width = w;
    bCanvas.height = sCanvas.height = h;
  }
  window.addEventListener("resize", resize);
  resize();

  /* ---- Balloon pool ---- */
  const PASTEL = ["#FFD6E0", "#E8D5F5", "#FFE8D6", "#D5F5E8", "#F2C6D0", "#D0C4F0"];
  const BALLOON_COUNT = 14;

  function createBalloon() {
    const W = bCanvas.width;
    const H = bCanvas.height;
    return {
      x: Math.random() * W,
      y: H + 40 + Math.random() * 200,
      r: 22 + Math.random() * 18,            // radius
      color: PASTEL[Math.floor(Math.random() * PASTEL.length)],
      speed: 0.3 + Math.random() * 0.45,      // rise speed
      drift: (Math.random() - 0.5) * 0.4,     // horizontal drift
      wobbleAmp: 8 + Math.random() * 12,
      wobbleFreq: 0.008 + Math.random() * 0.006,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.45 + Math.random() * 0.3,
      tick: 0,
    };
  }

  let balloons = [];
  for (let i = 0; i < BALLOON_COUNT; i++) {
    const b = createBalloon();
    b.y = Math.random() * bCanvas.height;     // scatter initial positions
    balloons.push(b);
  }

  function drawBalloon(b) {
    const x = b.x + Math.sin(b.tick * b.wobbleFreq + b.phase) * b.wobbleAmp;
    const y = b.y;
    const r = b.r;

    bCtx.save();
    bCtx.globalAlpha = b.opacity;

    // Body
    bCtx.beginPath();
    bCtx.ellipse(x, y, r * 0.82, r, 0, 0, Math.PI * 2);
    bCtx.fillStyle = b.color;
    bCtx.fill();

    // Highlight
    bCtx.beginPath();
    bCtx.ellipse(x - r * 0.25, y - r * 0.3, r * 0.22, r * 0.35, -0.3, 0, Math.PI * 2);
    bCtx.fillStyle = "rgba(255,255,255,0.45)";
    bCtx.fill();

    // Knot
    bCtx.beginPath();
    bCtx.moveTo(x - 3, y + r);
    bCtx.lineTo(x, y + r + 6);
    bCtx.lineTo(x + 3, y + r);
    bCtx.fillStyle = b.color;
    bCtx.fill();

    // String
    bCtx.beginPath();
    bCtx.moveTo(x, y + r + 6);
    bCtx.quadraticCurveTo(
      x + Math.sin(b.tick * 0.012) * 8,
      y + r + 30,
      x + Math.sin(b.tick * 0.008) * 4,
      y + r + 50
    );
    bCtx.strokeStyle = "rgba(200,170,190,0.35)";
    bCtx.lineWidth = 1;
    bCtx.stroke();

    bCtx.restore();
  }

  /* ---- Sparkle pool ---- */
  const SPARKLE_COUNT = 40;

  function createSparkle() {
    const W = sCanvas.width;
    const H = sCanvas.height;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: 1 + Math.random() * 2.5,
      opacity: Math.random(),
      speed: 0.15 + Math.random() * 0.25,
      fadeDir: Math.random() > 0.5 ? 1 : -1,
      color: PASTEL[Math.floor(Math.random() * PASTEL.length)],
    };
  }

  let sparkles = [];
  for (let i = 0; i < SPARKLE_COUNT; i++) sparkles.push(createSparkle());

  function drawSparkle(s) {
    sCtx.save();
    sCtx.globalAlpha = s.opacity;
    sCtx.fillStyle = s.color;

    // 4-point star
    const cx = s.x, cy = s.y, sz = s.size;
    sCtx.beginPath();
    for (let j = 0; j < 4; j++) {
      const angle = (j / 4) * Math.PI * 2 - Math.PI / 2;
      const ax = cx + Math.cos(angle) * sz * 2.5;
      const ay = cy + Math.sin(angle) * sz * 2.5;
      if (j === 0) sCtx.moveTo(ax, ay);
      else sCtx.lineTo(ax, ay);
      const mid = angle + Math.PI / 4;
      const mx = cx + Math.cos(mid) * sz * 0.7;
      const my = cy + Math.sin(mid) * sz * 0.7;
      sCtx.lineTo(mx, my);
    }
    sCtx.closePath();
    sCtx.fill();

    // Glow
    sCtx.shadowColor = s.color;
    sCtx.shadowBlur = 6;
    sCtx.fill();

    sCtx.restore();
  }

  /* ---- Render Loop ---- */
  function frame() {
    const W = bCanvas.width;
    const H = bCanvas.height;

    // Clear
    bCtx.clearRect(0, 0, W, H);
    sCtx.clearRect(0, 0, W, H);

    // Balloons
    for (let i = 0; i < balloons.length; i++) {
      const b = balloons[i];
      b.y -= b.speed;
      b.x += b.drift;
      b.tick++;
      if (b.y < -80) balloons[i] = createBalloon();
      drawBalloon(b);
    }

    // Sparkles
    for (let i = 0; i < sparkles.length; i++) {
      const s = sparkles[i];
      s.y -= s.speed;
      s.opacity += s.fadeDir * 0.008;
      if (s.opacity >= 1) { s.opacity = 1; s.fadeDir = -1; }
      if (s.opacity <= 0) { s.opacity = 0; s.fadeDir = 1; s.y = H + 10; s.x = Math.random() * W; }
      if (s.y < -10) { s.y = H + 10; s.x = Math.random() * W; }
      drawSparkle(s);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
