let ctx = null;
let master = null;
let muted = null;
let lastTick = 0;

function ensure() {
  if (muted === null) {
    try {
      muted = localStorage.getItem('sfx-mute') === '1';
    } catch (e) {
      muted = false;
    }
  }
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.34;
    master.connect(ctx.destination);
  }
  return ctx.state === 'running' ? ctx : ctx.resume().then(() => ctx).catch(() => null);
}

function env(g, t, a, d, peak) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

const at = (c) => (c && c.currentTime !== undefined ? c : null);

export function tick() {
  const c = at(ensure());
  if (!c) return;
  const now = c.currentTime;
  if (now - lastTick < 0.05) return;
  lastTick = now;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = 'sine';
  o.frequency.setValueAtTime(1500 + Math.random() * 900, now);
  f.type = 'bandpass';
  f.frequency.value = 4200;
  f.Q.value = 1.4;
  env(g, now, 0.004, 0.05, 0.07);
  o.connect(f);
  f.connect(g);
  g.connect(master);
  o.start(now);
  o.stop(now + 0.09);
}

export function pluck() {
  const c = at(ensure());
  if (!c) return;
  const now = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = 'triangle';
  o.frequency.setValueAtTime(420, now);
  o.frequency.exponentialRampToValueAtTime(190, now + 0.12);
  f.type = 'lowpass';
  f.frequency.value = 1600;
  env(g, now, 0.006, 0.14, 0.12);
  o.connect(f);
  f.connect(g);
  g.connect(master);
  o.start(now);
  o.stop(now + 0.22);
}

export function chime(up) {
  const c = at(ensure());
  if (!c) return;
  const now = c.currentTime;
  const notes = up ? [660, 880] : [330, 220];
  notes.forEach((hz, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = hz;
    env(g, now + i * 0.08, 0.008, 0.22, 0.09);
    o.connect(g);
    g.connect(master);
    o.start(now + i * 0.08);
    o.stop(now + i * 0.08 + 0.3);
  });
}
export function isMuted() {
  if (muted === null) {
    try {
      muted = localStorage.getItem('sfx-mute') === '1';
    } catch (e) {
      muted = false;
    }
  }
  return muted;
}

export function toggleMute() {
  muted = !isMuted();
  try {
    localStorage.setItem('sfx-mute', muted ? '1' : '0');
  } catch (e) {}
  if (muted && ctx) {
    ctx.close().catch(() => {});
    ctx = null;
    master = null;
  }
  return muted;
}

export function initSfx() {
  ['pointerdown', 'keydown'].forEach((ev) => {
    addEventListener(ev, () => ensure(), { once: true, passive: true });
  });
  let pressed = false;
  addEventListener('keydown', (e) => {
    pressed = e.repeat;
  });
  addEventListener('click', (e) => {
    if (pressed) return;
    const hit = e.target && e.target.closest ? e.target.closest('.nav-btn,.linkcard,.game-card,a.proj,.contact-action-btn,.dock-btn,.track-row,.unit-btn') : null;
    if (!hit) return;
    pluck();
    if (/^copy/.test(hit.id || '')) chime(true);
  }, true);
  addEventListener('mouseover', (e) => {
    const t = e.target && e.target.closest ? e.target.closest('[data-glow]') : null;
    if (!t) return;
    const el = e.target.closest('[data-glow]');
    if (el === t && !el.contains(e.relatedTarget)) tick();
  }, { passive: true });
}
