// Custom Arcade & Games Module: Neon Dodger
export function initGames() {
  const cv = document.getElementById('arcadeCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const overlay = document.getElementById('arcadeOverlay');
  const startBtn = document.getElementById('arcadeStartBtn');
  const scoreEl = document.getElementById('arcadeScore');
  const bestEl = document.getElementById('arcadeBest');

  let high = 0;
  try { high = parseInt(localStorage.getItem('sat-arcade-best') || '0', 10); } catch (e) {}
  if (bestEl) bestEl.textContent = high;

  let running = false;
  const player = { x: 280, y: 190, w: 26, h: 14, vx: 0 };
  let obstacles = [];
  let score = 0;
  let lastSpawn = 0;
  let animId = null;
  const keys = {};

  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) keys[e.code] = false;
  });

  cv.addEventListener('pointermove', (e) => {
    if (!running) return;
    const rect = cv.getBoundingClientRect();
    player.x = (e.clientX - rect.left) / rect.width * cv.width - player.w / 2;
  });

  function start() {
    running = true;
    score = 0;
    obstacles = [];
    player.x = cv.width / 2 - 13;
    overlay.style.display = 'none';
    lastSpawn = performance.now();
    loop();
  }

  function gameOver() {
    running = false;
    cancelAnimationFrame(animId);
    if (score > high) {
      high = score;
      try { localStorage.setItem('sat-arcade-best', String(high)); } catch (e) {}
      if (bestEl) bestEl.textContent = high;
    }
    const title = overlay.querySelector('div');
    if (title) title.textContent = 'GAME OVER · SCORE ' + score;
    overlay.style.display = 'flex';
    if (startBtn) startBtn.textContent = 'PLAY AGAIN';
  }

  function loop() {
    if (!running) return;
    animId = requestAnimationFrame(loop);
    ctx.fillStyle = '#0a0a0d';
    ctx.fillRect(0, 0, cv.width, cv.height);

    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 6;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 6;
    player.x = Math.max(0, Math.min(cv.width - player.w, player.x));

    ctx.fillStyle = '#ff2a55';
    ctx.shadowColor = '#ff2a55';
    ctx.shadowBlur = 12;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    const now = performance.now();
    if (now - lastSpawn > Math.max(220, 600 - score * 10)) {
      lastSpawn = now;
      obstacles.push({
        x: Math.random() * (cv.width - 20),
        y: -15,
        w: 16 + Math.random() * 20,
        h: 12,
        speed: 3 + Math.min(score * 0.12, 7)
      });
    }

    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.y += ob.speed;
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

      if (
        player.x < ob.x + ob.w &&
        player.x + player.w > ob.x &&
        player.y < ob.y + ob.h &&
        player.y + player.h > ob.y
      ) {
        gameOver();
        return;
      }

      if (ob.y > cv.height) {
        obstacles.splice(i, 1);
        score++;
        if (scoreEl) scoreEl.textContent = score;
      }
    }
    ctx.shadowBlur = 0;
  }

  if (startBtn) startBtn.addEventListener('click', start);
}
