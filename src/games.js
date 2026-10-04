// Gaming Hub arcade: Neon Breaker.
// Breakout with per-row brick health, paddle-angle english, combo multipliers,
// four power-ups, ball trails, brick debris and screen shake. Logical units are CSS
// pixels; the canvas backing store is DPR-scaled so it stays sharp on retina without
// distorting the playfield.

const PADDLE_FRAC = 0.15;
const BALL_REF_R = 0.021;
const COLS = 8;
const ROWS = 5;
const GAP = 5;
const SIDE = 10;
const TRAIL = 8;
const START_LIVES = 3;

const ROWS_SPEC = [
  { hp: 1, pts: 50, c: '#00f0ff' },
  { hp: 1, pts: 50, c: '#39ff88' },
  { hp: 2, pts: 90, c: '#ffd93d' },
  { hp: 3, pts: 140, c: '#ff9f43' },
  { hp: 3, pts: 180, c: '#ff2a55' }
];

const POWERS = {
  expand: { label: 'WIDE', c: '#39ff88' },
  shrink: { label: 'SMALL', c: '#ff9f43' },
  multi: { label: 'MULTI', c: '#00f0ff' },
  slow: { label: 'SLOW', c: '#b28dff' },
  life: { label: 'LIFE', c: '#ff2a55' }
};

export function initGames() {
  const cv = document.getElementById('arcadeCanvas');
  const wrap = document.getElementById('arcadeWrap');
  if (!cv || !wrap) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const ov = document.getElementById('arcadeOverlay');
  const ovTitle = document.getElementById('arcadeTitle');
  const ovHint = document.getElementById('arcadeHint');
  const startBtn = document.getElementById('arcadeStartBtn');
  const scoreEl = document.getElementById('arcadeScore');
  const bestEl = document.getElementById('arcadeBest');
  const livesEl = document.getElementById('arcadeLives');
  const levelEl = document.getElementById('arcadeLevel');

  let W = 580;
  let H = 220;
  let dpr = 1;

  let state = 'idle'; // idle | launch | play | paused | clear | over
  let score = 0;
  let lives = START_LIVES;
  let level = 1;
  let best = 0;
  let combo = 0;
  let raf = 0;
  let last = 0;
  let shake = 0;
  let flash = 0;
  let slowT = 0;
  let expandT = 0;

  let bricks = [];
  let balls = [];
  let drops = [];
  let debris = [];
  const steer = { x: 0, active: false };

  const paddle = { x: 0, w: 84, h: 12, y: 0, vx: 0, baseW: 84 };
  const keys = Object.create(null);

  try {
    best = parseInt(localStorage.getItem('sat-arcade-best') || '0', 10) || 0;
  } catch (e) {
    best = 0;
  }

  function hud() {
    if (scoreEl) scoreEl.textContent = String(score);
    if (bestEl) bestEl.textContent = String(Math.max(best, score));
    if (livesEl) {
      livesEl.textContent = 'x' + lives;
    }
    if (levelEl) levelEl.textContent = String(level);
  }

  function banner(title, hint, btn) {
    if (ovTitle) ovTitle.textContent = title;
    if (ovHint) ovHint.textContent = hint;
    if (startBtn) startBtn.textContent = btn;
    if (ov) ov.style.display = 'flex';
  }

  function resize() {
    const r = wrap.getBoundingClientRect();
    const cw = Math.max(240, Math.round(r.width));
    const ch = Math.max(160, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(cw * dpr);
    cv.height = Math.round(ch * dpr);
    const sx = cw / (W || cw);
    W = cw;
    H = ch;
    // Keep brick geometry proportional instead of letting it desync from the new width.
    for (let i = 0; i < bricks.length; i++) {
      bricks[i].x *= sx;
      bricks[i].w *= sx;
    }
    paddle.baseW = Math.max(52, Math.round(W * PADDLE_FRAC));
    paddle.w = expandT > 0 ? Math.round(paddle.baseW * 1.45) : paddle.baseW;
    paddle.h = Math.max(9, Math.round(H * 0.045));
    paddle.y = H - paddle.h - Math.round(H * 0.06);
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x || (W - paddle.w) / 2));
  }

  function makeBall(x, y, vx, vy) {
    return { x, y, vx, vy, r: Math.max(4, Math.round(H * BALL_REF_R)), trail: [] };
  }

  function brickGeom() {
    const bw = (W - SIDE * 2 - GAP * (COLS - 1)) / COLS;
    const bh = Math.max(9, Math.round(H * 0.045));
    const top = Math.round(H * 0.14);
    return { bw, bh, top };
  }

  function buildLevel() {
    const { bw, bh, top } = brickGeom();
    bricks = [];
    // Odd levels indent every other row for a different silhouette each stage.
    for (let r = 0; r < ROWS; r++) {
      const spec = ROWS_SPEC[ROWS - 1 - r];
      const inset = level % 2 === 1 && r % 2 === 1 ? bw * 0.5 : 0;
      for (let c = 0; c < COLS; c++) {
        const x = SIDE + inset + c * (bw + GAP);
        if (x + bw > W - SIDE + 0.5) continue;
        bricks.push({
          x,
          y: top + r * (bh + GAP),
          w: bw,
          h: bh,
          hp: spec.hp,
          max: spec.hp,
          pts: spec.pts,
          c: spec.c,
          alive: true,
          hit: 0
        });
      }
    }
  }

  function resetBall() {
    balls = [makeBall(paddle.x + paddle.w / 2, paddle.y - 8, 0, 0)];
    combo = 0;
  }

  function serve() {
    state = 'launch';
    resetBall();
    if (ov) ov.style.display = 'none';
    last = performance.now();
    hud();
  }

  function start() {
    score = 0;
    lives = START_LIVES;
    level = 1;
    slowT = 0;
    expandT = 0;
    drops = [];
    debris = [];
    shake = 0;
    buildLevel();
    paddle.w = paddle.baseW;
    paddle.x = (W - paddle.w) / 2;
    serve();
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  function togglePause() {
    if (state === 'play') {
      state = 'paused';
      banner('PAUSED', 'Press P or click to resume', 'RESUME');
    } else if (state === 'paused') {
      state = 'play';
      if (ov) ov.style.display = 'none';
      last = performance.now();
    }
  }

  function loseLife() {
    lives -= 1;
    combo = 0;
    shake = 9;
    flash = 1;
    if (lives <= 0) {
      state = 'over';
      cancelAnimationFrame(raf);
      if (score > best) {
        best = score;
        try {
          localStorage.setItem('sat-arcade-best', String(best));
        } catch (e) {}
      }
      banner('GAME OVER', 'Score ' + score + ' · press to run it back', 'PLAY AGAIN');
      hud();
      return;
    }
    serve();
    hud();
  }

  function advance() {
    level += 1;
    slowT = 0;
    expandT = 0;
    paddle.w = paddle.baseW;
    drops = [];
    debris = [];
    buildLevel();
    serve();
  }

  function shatter(b) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const sp = 40 + Math.random() * 130;
      debris.push({
        x: b.x + b.w / 2,
        y: b.y + b.h / 2,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.5 + Math.random() * 0.35,
        max: 0.85,
        c: b.c,
        s: 1.5 + Math.random() * 2.5
      });
    }
    if (Math.random() < 0.11) {
      const keys2 = Object.keys(POWERS);
      drops.push({
        x: b.x + b.w / 2,
        y: b.y + b.h / 2,
        w: Math.max(30, W * 0.09),
        h: Math.max(11, H * 0.055),
        v: H * 0.24,
        kind: keys2[Math.floor(Math.random() * keys2.length)],
        a: 0
      });
    }
  }

  function applyPower(kind) {
    if (kind === 'expand') {
      expandT = 12000;
      paddle.w = Math.round(paddle.baseW * 1.45);
    } else if (kind === 'shrink') {
      expandT = 0;
      paddle.w = Math.round(paddle.baseW * 0.72);
    } else if (kind === 'multi') {
      const src = balls[0];
      if (src) {
        for (let i = 0; i < 2; i++) {
          const spread = (i === 0 ? 1 : -1) * (0.5 + Math.random() * 0.35);
          const sp = Math.hypot(src.vx, src.vy) || H;
          const ang = Math.atan2(src.vy, src.vx) + spread;
          balls.push(makeBall(src.x, src.y, Math.cos(ang) * sp, Math.sin(ang) * sp));
        }
      }
    } else if (kind === 'slow') {
      slowT = 7000;
    } else if (kind === 'life') {
      lives = Math.min(9, lives + 1);
      hud();
    }
    clampPaddle();
  }

  function clampPaddle() {
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
  }

  function brickHit(b) {
    b.hp -= 1;
    b.hit = 1;
    if (b.hp > 0) return;
    b.alive = false;
    combo += 1;
    const mult = Math.min(8, 1 + Math.floor(combo / 4));
    score += b.pts * mult;
    shatter(b);
    hud();
  }

  function step(dt) {
    const speedScale = slowT > 0 ? 0.58 : 1;
    if (slowT > 0) slowT -= dt;
    if (expandT > 0) {
      expandT -= dt;
      if (expandT <= 0) {
        paddle.w = paddle.baseW;
        clampPaddle();
      }
    }

    // Paddle input: keys accelerate, pointer/steer sets position directly.
    const accel = W * 3.4;
    let dir = 0;
    if (keys.ArrowLeft || keys.KeyA) dir -= 1;
    if (keys.ArrowRight || keys.KeyD) dir += 1;
    if (dir) {
      paddle.vx += dir * accel * dt;
      paddle.x += paddle.vx * dt;
      paddle.vx *= 0.86;
    } else {
      paddle.vx *= 0.7;
      if (steer.active) paddle.x = steer.x;
    }
    clampPaddle();

    const base = H * 1.08 + (level - 1) * H * 0.06;
    const cap = H * 2.15;

    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      if (state !== 'play') {
        if (state === 'launch') {
          b.x = paddle.x + paddle.w / 2;
          b.y = paddle.y - b.r - 2;
        }
        b.trail.length = 0;
        continue;
      }

      let sp = Math.hypot(b.vx, b.vy);
      if (sp > 0.0001) {
        const want = Math.min(cap, Math.max(H * 0.5, base)) * speedScale;
        const k = want / sp;
        b.vx *= k;
        b.vy *= k;
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > TRAIL) b.trail.shift();

      // Walls. Top and sides are hard; the ceiling too, so a ball can never stall.
      if (b.x - b.r < 0) {
        b.x = b.r;
        b.vx = Math.abs(b.vx);
      } else if (b.x + b.r > W) {
        b.x = W - b.r;
        b.vx = -Math.abs(b.vx);
      }
      if (b.y - b.r < 0) {
        b.y = b.r;
        b.vy = Math.abs(b.vy);
      }

      // Paddle: reflect using the contact offset so edge hits angle away sharply.
      if (b.vy > 0 && b.y + b.r >= paddle.y && b.y - b.r <= paddle.y + paddle.h) {
        if (b.x >= paddle.x - b.r && b.x <= paddle.x + paddle.w + b.r) {
          const rel = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
          const ang = rel * 1.15;
          const sp2 = Math.max(H * 0.5, Math.hypot(b.vx, b.vy)) * 1.005;
          b.vx = Math.sin(ang) * sp2;
          b.vy = -Math.cos(ang) * sp2;
          b.y = paddle.y - b.r - 0.5;
          combo = 0;
          shake = Math.max(shake, 1.6);
        }
      }

      for (let j = 0; j < bricks.length; j++) {
        const k = bricks[j];
        if (!k.alive) continue;
        if (b.x + b.r < k.x || b.x - b.r > k.x + k.w || b.y + b.r < k.y || b.y - b.r > k.y + k.h) continue;
        // Choose the shallower overlap axis so corner hits resolve predictably.
        const ox = Math.min(b.x + b.r - k.x, k.x + k.w - (b.x - b.r));
        const oy = Math.min(b.y + b.r - k.y, k.y + k.h - (b.y - b.r));
        if (ox < oy) b.vx = -b.vx;
        else b.vy = -b.vy;
        brickHit(k);
        break;
      }

      if (b.y - b.r > H) {
        balls.splice(i, 1);
      }
    }

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.y += d.v * dt;
      d.a += dt * 2.2;
      const hitPaddle = d.y + d.h >= paddle.y && d.y <= paddle.y + paddle.h && d.x + d.w > paddle.x && d.x < paddle.x + paddle.w;
      if (hitPaddle) {
        applyPower(d.kind);
        drops.splice(i, 1);
      } else if (d.y > H) {
        drops.splice(i, 1);
      }
    }

    for (let i = debris.length - 1; i >= 0; i--) {
      const p = debris[i];
      p.life -= dt;
      if (p.life <= 0) {
        debris.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += H * 1.5 * dt;
      p.vx *= 0.99;
    }

    for (let i = 0; i < bricks.length; i++) if (bricks[i].hit > 0) bricks[i].hit = Math.max(0, bricks[i].hit - dt * 5);

    if (balls.length === 0) {
      loseLife();
      return;
    }

    let left = 0;
    for (let i = 0; i < bricks.length; i++) if (bricks[i].alive) left++;
    if (left === 0 && state === 'play') {
      state = 'clear';
      score += 250 * level;
      hud();
      banner('LEVEL ' + level + ' CLEAR', 'Next level is faster', 'CONTINUE');
    }
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0d14');
    g.addColorStop(1, '#05060a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    if (shake > 0.05) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    // Grid backdrop
    ctx.strokeStyle = 'rgba(255,255,255,0.028)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < W; x += 22) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let y = 0; y < H; y += 22) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();

    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!b.alive) continue;
      const dmg = 1 - b.hp / b.max;
      ctx.globalAlpha = 1;
      ctx.shadowColor = b.c;
      ctx.shadowBlur = b.hit > 0 ? 22 : 9;
      ctx.fillStyle = b.c;
      ctx.globalAlpha = b.hit > 0 ? 1 : 0.42 + dmg * 0.5;
      roundRect(b.x, b.y, b.w, b.h, 3);
      ctx.fill();
      if (b.max > 1) {
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(b.x, b.y, (b.w * b.hp) / b.max, b.h);
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const c = POWERS[d.kind].c;
      ctx.save();
      ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
      ctx.rotate(Math.sin(d.a) * 0.25);
      ctx.shadowColor = c;
      ctx.shadowBlur = 14;
      ctx.fillStyle = c;
      roundRect(-d.w / 2, -d.h / 2, d.w, d.h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.font = '700 ' + Math.max(7, Math.round(d.h * 0.62)) + 'px Satoshi, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWERS[d.kind].label, 0, 0.5);
      ctx.restore();
    }

    for (let i = 0; i < debris.length; i++) {
      const p = debris[i];
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;

    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    roundRect(paddle.x, paddle.y, paddle.w, paddle.h, paddle.h / 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      for (let t = 0; t < b.trail.length; t++) {
        const q = b.trail[t];
        const a = (t / b.trail.length) * 0.5;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#8fe9ff';
        ctx.beginPath();
        ctx.arc(q.x, q.y, (b.r * t) / b.trail.length, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#7fdfff';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (combo > 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = '700 11px Satoshi, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('x' + Math.min(8, 1 + Math.floor(combo / 4)) + ' COMBO', W / 2, 4);
    }

    ctx.restore();

    if (flash > 0) {
      ctx.fillStyle = 'rgba(255,42,85,' + (flash * 0.28).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function frame(now) {
    if (state === 'over') return;
    raf = requestAnimationFrame(frame);
    let dt = (now - last) / 1000;
    last = now;
    // A backgrounded tab returns a multi-second delta; clamp so nothing teleports.
    if (!isFinite(dt) || dt < 0) dt = 0;
    if (dt > 1 / 30) dt = 1 / 30;
    if (shake > 0) shake = Math.max(0, shake - dt * 26);
    if (flash > 0) flash = Math.max(0, flash - dt * 2.6);
    if (state !== 'paused') step(dt);
    draw();
  }

  function pointTo(e) {
    const r = cv.getBoundingClientRect();
    steer.x = ((e.clientX - r.left) / r.width) * W - paddle.w / 2;
    steer.active = true;
  }

  cv.addEventListener('pointermove', (e) => {
    if (state === 'play' || state === 'launch') pointTo(e);
  });
  cv.addEventListener('pointerdown', (e) => {
    if (state === 'play' || state === 'launch') pointTo(e);
    if (state === 'launch') launchBall();
  });
  cv.addEventListener('pointerleave', () => {
    steer.active = false;
  });

  function onKey(e, down) {
    const c = e.code;
    if (c === 'ArrowLeft' || c === 'ArrowRight' || c === 'KeyA' || c === 'KeyD') {
      keys[c] = down;
      if (down && (state === 'play' || state === 'launch')) e.preventDefault();
      return;
    }
    if (!down) return;
    if (c === 'Space' || c === 'Enter') {
      if (state === 'launch') {
        e.preventDefault();
        launchBall();
      } else if (state === 'play') {
        e.preventDefault();
        togglePause();
      } else {
        e.preventDefault();
        activate();
      }
      return;
    }
    if (c === 'KeyP' && (state === 'play' || state === 'paused')) {
      e.preventDefault();
      togglePause();
    }
  }

  window.addEventListener('keydown', (e) => onKey(e, true));
  window.addEventListener('keyup', (e) => onKey(e, false));

  // Losing focus mid-flight is the classic way to lose a run unfairly.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'play') togglePause();
  });

  // One dispatcher for every entry point (button, overlay click, Space/Enter) so the
// overlay can never claim an action the state machine does not agree with.
function activate() {
    if (state === 'paused') togglePause();
    else if (state === 'clear') advance();
    else if (state === 'over' || state === 'idle') start();
  }

  function launchBall() {
    state = 'play';
    const b = balls[0];
    if (!b) return;
    const sp = H * 1.08;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
    b.vx = Math.cos(ang) * sp;
    b.vy = Math.sin(ang) * sp;
  }

  if (startBtn) startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    activate();
  });
  if (ov) ov.addEventListener('click', () => activate());

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      resize();
      if (state === 'idle' || state === 'over') draw();
    }, 120);
  });

  resize();
  buildLevel();
  resetBall();
  hud();
  draw();
  banner('NEON BREAKER', 'Drag or A / D to move · Space to launch · P to pause', 'START GAME');
}