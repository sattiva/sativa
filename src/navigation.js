// Navigation, Smooth Scroll, Reveal, Motion Preferences, Tilt & WebGL Background
import { $, S, C, TITLES, PATH, VIEW, MOB, TOUCH, CK_V, cGet, cSet } from './config.js';

const $stage = typeof document !== 'undefined' ? document.querySelector('.stage') : null;

// Smooth Scrolling State & Engine
export const SC = { y: 0, target: 0, max: 0, raf: null, active: !TOUCH };

export function scMax() {
  if (!SC.active || !$stage) return;
  SC.max = Math.max(0, $stage.offsetHeight - window.innerHeight);
  if (SC.target > SC.max) SC.target = SC.max;
  if (SC.y > SC.max) SC.y = SC.max;
}

export function scApply() {
  if (!SC.active || !$stage) return;
  $stage.style.transform = 'translate3d(0,' + (-SC.y).toFixed(2) + 'px,0)';
}

function scLoop() {
  const d = SC.target - SC.y;
  if (Math.abs(d) < 0.12) {
    SC.y = SC.target;
    scApply();
    SC.raf = null;
    return;
  }
  SC.y += d * 0.14;
  scApply();
  SC.raf = requestAnimationFrame(scLoop);
}

export function scStart() {
  if (!SC.active || SC.raf) return;
  SC.raf = requestAnimationFrame(scLoop);
}

export function scTo(y, instant) {
  if (!SC.active) return;
  scMax();
  SC.target = Math.max(0, Math.min(SC.max, y));
  if (instant) {
    SC.y = SC.target;
    scApply();
  } else {
    scStart();
  }
}

export function initScroll() {
  if (!SC.active) return;
  document.documentElement.classList.add('smooth-scroll');
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (e) {}

  window.addEventListener('wheel', function(e) {
    if (S.modalOpen) return;
    if (e.target && e.target.closest && e.target.closest('.lyr-scroll,.modal-ov')) return;
    e.preventDefault();
    SC.target = Math.max(0, Math.min(SC.max, SC.target + e.deltaY));
    scStart();
  }, { passive: false });

  document.addEventListener('keydown', function(e) {
    if (S.modalOpen) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    let d = 0;
    if (e.key === 'ArrowDown') d = 90;
    else if (e.key === 'ArrowUp') d = -90;
    else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) d = window.innerHeight * 0.85;
    else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) d = -window.innerHeight * 0.85;
    else if (e.key === 'Home') { scTo(0, false); e.preventDefault(); return; }
    else if (e.key === 'End') { scTo(SC.max, false); e.preventDefault(); return; }
    else return;

    e.preventDefault();
    SC.target = Math.max(0, Math.min(SC.max, SC.target + d));
    scStart();
  });

  window.addEventListener('resize', () => scMax());
  if (window.ResizeObserver && $stage) {
    try {
      new ResizeObserver(() => scMax()).observe($stage);
    } catch (e) {
      setInterval(scMax, 600);
    }
  } else {
    setInterval(scMax, 600);
  }
  scMax();
  scApply();
}

// Reveal System & Motion Preferences
export function motionPreference() {
  try {
    return localStorage.getItem('sat-motion') || localStorage.getItem('kast-motion') || '';
  } catch (e) {
    return '';
  }
}

export function shouldReduceMotion() {
  const choice = motionPreference();
  if (choice === 'on') return false;
  if (choice === 'off') return true;
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
}

let rvItems = [];
let motionPrompt = null;
let motionControl = null;
let motionChoicePending = true;
let autoTour = false;
let tourIndex = 0;
let tourTimer = null;
const tourViews = ['home', 'music', 'games', 'guestbook'];

export function playReveal(items) {
  items = items || rvItems;
  if (motionChoicePending) return;
  if (shouldReduceMotion()) {
    for (let i = 0; i < items.length; i++) items[i].classList.add('in');
    return;
  }
  const start = 300, stagger = 900;
  for (let i = 0; i < items.length; i++) {
    setTimeout(((el) => () => el.classList.add('in'))(items[i]), start + i * stagger);
  }
}

function tourDuration(view) {
  if (view === 'home') return 300 + Math.max(0, rvItems.length - 1) * 900 + 1000;
  return { music: 2800, games: 6500, guestbook: 2800 }[view] || 3000;
}

function scheduleTourStep() {
  clearTimeout(tourTimer);
  tourTimer = setTimeout(advanceTour, tourDuration(tourViews[tourIndex]));
}

function setTourRoute(view) {
  try {
    history.replaceState({ v: view }, '', PATH[view] || '/');
  } catch (e) {}
}

function updateMotionControl(enabled) {
  if (!motionControl) return;
  motionControl.hidden = false;
  motionControl.setAttribute('aria-checked', enabled ? 'true' : 'false');
  motionControl.setAttribute('aria-label', enabled ? 'Turn motion off' : 'Turn motion on');
}

export function endAutoTour() {
  autoTour = false;
  clearTimeout(tourTimer);
  try { sessionStorage.removeItem('sat-tour-active'); } catch (e) {}
  updateMotionControl(true);
}

export function beginAutoTour() {
  autoTour = true;
  if (motionControl) motionControl.hidden = true;
  try { sessionStorage.setItem('sat-tour-active', '1'); } catch (e) {}
  tourIndex = 0;
  setActive('home');
  setTourRoute('home');
  const current = document.querySelector('.view:not([hidden])');
  if (current && current.dataset.view !== 'home') showView('home', false, true);
  rvItems.forEach(el => el.classList.remove('in'));
  void document.body.offsetWidth;
  playReveal();
  scheduleTourStep();
}

function advanceTour() {
  if (!autoTour) return;
  tourIndex++;
  if (tourIndex >= tourViews.length) {
    endAutoTour();
    return;
  }
  const view = tourViews[tourIndex];
  setActive(view);
  setTourRoute(view);
  showView(view, false, false);
  scheduleTourStep();
}

export function stopAllMotion() {
  try {
    localStorage.setItem('sat-motion', 'off');
  } catch (e) {}
  try { sessionStorage.removeItem('sat-tour-active'); } catch (e) {}
  autoTour = false;
  clearTimeout(tourTimer);
  document.documentElement.classList.remove('motion-on', 'motion-paused');
  document.documentElement.classList.add('motion-off');
  rvItems.forEach(el => el.classList.add('in'));
  updateMotionControl(false);
}

export function chooseMotion(choice) {
  try {
    localStorage.setItem('sat-motion', choice);
  } catch (e) {}
  document.documentElement.classList.remove('motion-choice-required', 'motion-paused');
  document.documentElement.classList.toggle('motion-on', choice === 'on');
  document.documentElement.classList.toggle('motion-off', choice === 'off');
  motionChoicePending = false;
  if (motionPrompt) motionPrompt.classList.remove('show');
  if (choice === 'on') {
    if (motionControl) motionControl.hidden = true;
    beginAutoTour();
    return;
  }
  updateMotionControl(false);
  const req = initialRequestedView();
  setActive(req);
  if (req !== 'home') showView(req, false, true);
  else playReveal();
}

export function initialRequestedView() {
  const p = location.pathname.replace(/\/+$/, '') || '/';
  const q = new URLSearchParams(location.search).get('view');
  return (TITLES[q] ? q : null) || VIEW[p] || 'home';
}

export function setActive(t) {
  document.querySelectorAll('.nav-btn').forEach(x => {
    x.classList.toggle('active', x.dataset.view === t);
  });
}

export function showView(t, push, instant) {
  const cur = document.querySelector('.view:not([hidden])');
  const nxt = document.querySelector('.view[data-view="' + t + '"]');
  if (!nxt) return;

  if (push && location.pathname !== PATH[t]) {
    try {
      history.pushState({ v: t }, '', PATH[t] || '/');
    } catch (e) {}
  }
  if (cur === nxt) return;

  // Playback deliberately survives navigation: the dock is global, so leaving the
  // music view no longer tears down audio.

  document.title = TITLES[t] || 'Sativa';

  const go = function() {
    nxt.hidden = false;
    if (t === 'home' && !autoTour) playReveal();
    nxt.classList.remove('view-enter');
    void nxt.offsetWidth;
    nxt.classList.add('view-enter');
    setTimeout(scMax, 50);
  };

  const reduce = shouldReduceMotion();
  if (cur && !reduce && !instant) {
    cur.classList.add('view-out');
    clearTimeout(S.vT);
    S.vT = setTimeout(function() {
      cur.hidden = true;
      cur.classList.remove('view-out');
      go();
    }, 260);
  } else {
    if (cur) {
      cur.hidden = true;
      cur.classList.remove('view-out');
    }
    go();
  }

  scTo(0, true);
  if (SC.active) {
    SC.target = 0;
    SC.y = 0;
    scApply();
  } else {
    try {
      window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' });
    } catch (e) {}
  }
}

export function initNavigation() {
  rvItems = [].slice.call(document.querySelectorAll('[data-rv]')).filter(el => !el.hidden);
  motionPrompt = $('motionPrompt');
  motionControl = $('motionControl');
  const motionOnChoice = $('motionOn');
  const motionOffChoice = $('motionOff');
  const motionDialog = motionPrompt ? motionPrompt.querySelector('.motion-prompt') : null;

  if (motionPrompt) motionPrompt.classList.add('show');

  if (motionOnChoice) {
    motionOnChoice.addEventListener('click', () => chooseMotion('on'));
  }
  if (motionOffChoice) {
    motionOffChoice.addEventListener('click', () => chooseMotion('off'));
  }

  if (motionChoicePending && motionDialog && motionPrompt) {
    setTimeout(() => motionDialog.focus(), 0);
    motionPrompt.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === motionOffChoice) {
        e.preventDefault();
        motionOnChoice.focus();
      } else if (!e.shiftKey && document.activeElement === motionOnChoice) {
        e.preventDefault();
        motionOffChoice.focus();
      }
    });
  }

  if (motionControl) {
    motionControl.addEventListener('click', function() {
      const enabled = motionControl.getAttribute('aria-checked') === 'true';
      if (enabled) {
        stopAllMotion();
        return;
      }
      try {
        localStorage.setItem('sat-motion', 'on');
      } catch (e) {}
      document.documentElement.classList.remove('motion-off', 'motion-paused');
      document.documentElement.classList.add('motion-on');
      updateMotionControl(true);
    });
  }

  document.querySelectorAll('.nav-btn[data-view]').forEach(b => {
    b.addEventListener('click', () => {
      if (autoTour) endAutoTour();
      setActive(b.dataset.view);
      showView(b.dataset.view, true);
    });
  });

  window.addEventListener('popstate', function() {
    const p = location.pathname.replace(/\/+$/, '') || '/';
    const v = VIEW[p] || 'home';
    setActive(v);
    showView(v, false);
  });

  const prev = motionPreference();
  if (prev) {
    chooseMotion(prev);
  }
}

// Interactive 3D Tilt
export function initTilt() {
  function tilt(el) {
    if (!el || !(window.matchMedia && window.matchMedia('(hover:hover)').matches)) return;
    el.addEventListener('mouseenter', function() {
      el.style.transition = 'transform .12s linear,box-shadow .35s var(--e),border-color .35s var(--e)';
    });
    el.addEventListener('mousemove', function(e) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));
      el.style.transform = 'perspective(900px) translate3d(' + (dx * 14).toFixed(2) + 'px,' + (dy * 10).toFixed(2) + 'px,0) rotateY(' + (dx * 6).toFixed(2) + 'deg) rotateX(' + (-dy * 6).toFixed(2) + 'deg)';
    });
    el.addEventListener('mouseleave', function() {
      el.style.transition = 'transform .6s var(--e),box-shadow .35s var(--e),border-color .35s var(--e)';
      el.style.transform = '';
    });
  }

  tilt(document.querySelector('#motionPrompt .motion-prompt'));
  const w = $('weatherWidget');
  if (w && window.matchMedia && window.matchMedia('(hover:hover)').matches) {
    w.addEventListener('mouseenter', function() {
      w.style.transition = 'transform .1s linear,box-shadow .35s var(--e)';
    });
    w.addEventListener('mousemove', function(e) {
      if (!w.classList.contains('in')) return;
      const r = w.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));
      w.style.transform = 'perspective(900px) translate3d(' + (dx * 30).toFixed(2) + 'px,' + (dy * 20).toFixed(2) + 'px,0) rotateY(' + (dx * 10).toFixed(2) + 'deg) rotateX(' + (-dy * 10).toFixed(2) + 'deg)';
    });
    w.addEventListener('mouseleave', function() {
      w.style.transition = 'transform .55s var(--e),box-shadow .35s var(--e)';
      w.style.transform = '';
    });
  }
}

// WebGL Background Canvas
export function initBg() {
  if (MOB) return;
  const cv = $('bgCanvas');
  if (!cv) return;
  const rm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  const gl = cv.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }) || cv.getContext('experimental-webgl');
  if (!gl) return;

  const VERT = 'attribute vec2 position;varying vec2 vUv;void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}';
  const FRAG = 'precision highp float;uniform float uTime;uniform vec2 uResolution;varying vec2 vUv;void main(){vec2 uv=vUv;float t=uTime*0.09;float w=0.0;w+=sin(uv.x*3.1+t)*0.5;w+=sin(uv.x*5.3-t*1.15+uv.y*2.0)*0.3;w+=sin(uv.x*2.1+t*0.72+uv.y*4.0)*0.2;w=w*0.5+0.5;vec3 base=mix(vec3(0.024,0.026,0.030),vec3(0.052,0.056,0.062),uv.y);vec3 col=base+vec3(0.086,0.090,0.100)*smoothstep(0.42,0.92,w)*0.55;col*=1.0-length(uv-0.5)*0.42;col+=(fract(sin(dot(uv*uResolution,vec2(12.9898,78.233)))*43758.5453)-0.5)*0.005;gl_FragColor=vec4(max(col,vec3(0.0)),1.0);}';

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const pl = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(pl);
  gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);

  const uT = gl.getUniformLocation(prog, 'uTime');
  const uR = gl.getUniformLocation(prog, 'uResolution');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    cv.width = Math.max(1, Math.floor(w * dpr));
    cv.height = Math.max(1, Math.floor(h * dpr));
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(uR, w, h);
    if (rm) {
      gl.uniform1f(uT, 12);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();

  if (rm) return;
  const start = performance.now();
  let raf = null;
  function render(now) {
    raf = requestAnimationFrame(render);
    gl.uniform1f(uT, (now - start) * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function play() {
    if (!raf) raf = requestAnimationFrame(render);
  }
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    } else {
      play();
    }
  });
  play();
}

// View Counter Animation & Pings
export function animateCount(target) {
  const el = $('viewCount');
  if (!el) return;
  let cur = parseInt(String(el.textContent || '0').replace(/[^0-9]/g, ''), 10);
  if (!isFinite(cur) || cur < 0) cur = 0;
  if (cur === target) {
    el.textContent = target.toLocaleString();
    return;
  }
  const t0 = performance.now(), dur = 1800;
  function step(now) {
    const t = (now - t0) / dur;
    if (t >= 1) {
      el.textContent = target.toLocaleString();
      return;
    }
    const e = Math.pow(t, 2.2);
    const v = Math.round(cur + (target - cur) * e);
    el.textContent = v.toLocaleString();
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function newVisitId() {
  return window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

export function initViewCounter() {
  let viewSessionId = '';
  let viewVisitId = '';
  try {
    viewSessionId = sessionStorage.getItem('sat-view-session') || newVisitId();
    sessionStorage.setItem('sat-view-session', viewSessionId);
    viewVisitId = sessionStorage.getItem('sat-view-visit') || newVisitId();
    sessionStorage.setItem('sat-view-visit', viewVisitId);
  } catch (e) {
    viewSessionId = newVisitId();
    viewVisitId = newVisitId();
  }

  const localPreview = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?$/i.test(location.hostname || location.origin);

  function sendViewPing(isVisit) {
    if (localPreview) return;
    const body = { sessionId: viewSessionId };
    if (isVisit) body.visitId = viewVisitId;
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      keepalive: true
    }).then(r => r.ok ? r.json() : null).then(d => {
      if (!d || typeof d.count !== 'number') return;
      cSet(CK_V, d.count);
      if ($('viewCounter')) $('viewCounter').hidden = false;
      if ($('railViews')) $('railViews').textContent = d.count.toLocaleString();
      animateCount(d.count);
    }).catch(() => {});
  }

  const cvv = cGet(CK_V, 86400000);
  if (cvv && typeof cvv === 'number') {
    if ($('viewCounter')) $('viewCounter').hidden = false;
    if ($('railViews')) $('railViews').textContent = cvv.toLocaleString();
    animateCount(cvv);
  }

  sendViewPing(true);
  setInterval(() => sendViewPing(false), 45000);
}
