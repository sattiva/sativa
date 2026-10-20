import { TOUCH } from './config.js';

const SEL = '.tabs-inner,.linkcard,.contact-card,.proj,.panel,.proj-group-label,.modal,.unit-toggle,.ident,.dock,.game-card';

function initPop() {
  if (typeof IntersectionObserver !== 'function') return;
  const els = [...document.querySelectorAll('.proj-group,.weather-widget,.panel,.stats-block')]
    .filter((el) => !el.classList.contains('pop-in'));
  if (!els.length) return;
  const vp = innerHeight || 800;
  const io = new IntersectionObserver((en) => {
    for (const e of en) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('pop-in');
      io.unobserve(e.target);
    }
  }, { threshold: 0.1 });
  for (const el of els) {
    const buried = !!el.closest('[hidden]');
    if (!buried) {
      const r = el.getBoundingClientRect();
      if (r.top < vp * 0.72) continue;
    }
    el.classList.add('pop-ready');
    io.observe(el);
  }
}

export function initGlow() {
  initPop();
  if (TOUCH) return;
  const els = [...new Set([...document.querySelectorAll(SEL)])];
  if (!els.length) return;
  for (const el of els) el.setAttribute('data-glow', '');

  let raf = 0;
  let x = 0;
  let y = 0;

  function paint() {
    raf = 0;
    for (const el of els) {
      if (!el.isConnected || el.closest('[hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top - 60 || y > r.bottom + 60 || x < r.left - 60 || x > r.right + 60) continue;
      el.style.setProperty('--mx', (x - r.left).toFixed(1) + 'px');
      el.style.setProperty('--my', (y - r.top).toFixed(1) + 'px');
    }
  }

  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
}
