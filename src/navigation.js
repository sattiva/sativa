import { $, S, TITLES, PATH, VIEW, MOB, TOUCH, CK_V, cGet, cSet } from './config.js';

const $stage = typeof document !== 'undefined' ? document.querySelector('.stage') : null;

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

let rvItems = [];

export function playReveal(items) {
  items = items || rvItems;
  for (let i = 0; i < items.length; i++) items[i].classList.add('in');
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

export function showView(t, push) {
  const cur = document.querySelector('.view:not([hidden])');
  const nxt = document.querySelector('.view[data-view="' + t + '"]');
  if (!nxt) return;

  if (push && location.pathname !== PATH[t]) {
    try {
      history.pushState({ v: t }, '', PATH[t] || '/');
    } catch (e) {}
  }
  if (cur === nxt) return;

  document.title = TITLES[t] || 'Sativa';

  if (cur) {
    cur.hidden = true;
    cur.classList.remove('view-out', 'view-enter');
  }
  nxt.hidden = false;
  nxt.classList.remove('view-out');
  if (t === 'home') playReveal();
  setTimeout(scMax, 50);

  scTo(0, true);
  if (SC.active) {
    SC.target = 0;
    SC.y = 0;
    scApply();
  } else {
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
  }
}

export function initNavigation() {
  rvItems = [].slice.call(document.querySelectorAll('[data-rv]')).filter(el => !el.hidden);
  playReveal();

  document.querySelectorAll('.nav-btn[data-view]').forEach(b => {
    b.addEventListener('click', () => {
      setActive(b.dataset.view);
      showView(b.dataset.view, true);
    });
  });

  const burger = $('burger');
  const drawer = $('ident');
  const scrim = $('scrim');

  function setDrawer(on) {
    if (!drawer || !burger) return;
    drawer.classList.toggle('on', on);
    if (scrim) {
      if (on) {
        scrim.hidden = false;
        requestAnimationFrame(() => scrim.classList.add('on'));
      } else {
        scrim.classList.remove('on');
        setTimeout(() => {
          if (!drawer.classList.contains('on')) scrim.hidden = true;
        }, 320);
      }
    }
    burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    burger.setAttribute('aria-label', on ? 'Close profile menu' : 'Open profile menu');
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) {
      const first = drawer.querySelector('a,button');
      if (first) setTimeout(() => first.focus(), 60);
    }
  }

  if (burger && drawer) {
    burger.addEventListener('click', () => {
      setDrawer(!drawer.classList.contains('on'));
    });
  }
  if (scrim) scrim.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (drawer && drawer.classList.contains('on')) {
      setDrawer(false);
      if (burger) burger.focus();
    }
  });
  document.querySelectorAll('.nav-btn[data-view]').forEach((b) => {
    b.addEventListener('click', () => setDrawer(false));
  });

  window.addEventListener('popstate', function() {
    const p = location.pathname.replace(/\/+$/, '') || '/';
    const v = VIEW[p] || 'home';
    setActive(v);
    showView(v, false);
  });
}

// One static frame. The shader is a drifting tint; without a loop it is just a
// background, which is the whole point of a still page.
export function initBg() {
  if (MOB) return;
  const cv = $('bgCanvas');
  if (!cv) return;
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
    gl.uniform1f(uT, 12);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();
}

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
