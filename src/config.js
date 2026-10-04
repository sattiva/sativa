
export const $ = (id) => document.getElementById(id);

export const C = {
  id: '430766308662050817',
  tz: 'America/Toronto',
  lat: 43.6532,
  lon: -79.3832,
  off: 0,
  bio: 'hi I\u2019m sativa!'
};

try {
  const so = parseFloat(localStorage.getItem('sat-off') || localStorage.getItem('kast-off'));
  if (isFinite(so) && Math.abs(so) <= 10) C.off = so;
} catch (e) {}

export const TITLES = {
  home: 'Sativa',
  music: 'Music — Sativa',
  guestbook: 'Recommend a track — Sativa'
};

export const PATH = {
  home: '/home',
  music: '/music',
  guestbook: '/recommend'
};

export const VIEW = { '/': 'home', '': 'home' };
for (const pk in PATH) VIEW[PATH[pk]] = pk;

export const FB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%230a0a0a'/%3E%3C/svg%3E";
export const DEF_BG = 'https://i.pinimg.com/originals/32/8c/88/328c881f1929b778adcc7d9c1c75adcd.gif';
export const MOB = typeof window !== 'undefined' && (window.innerWidth < 760 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
export const TOUCH = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

export const CK_W = 'sat-c-w';
export const CK_P = 'sat-c-p';
export const CK_V = 'sat-c-v';

export const S = {
  actKey: '',
  actStart: 0,
  actTimer: null,
  disp: [],
  idx: -1,
  songKey: '',
  sp: null,
  spStart: 0,
  spEnd: 0,
  raf: null,
  reqId: 0,
  modalOpen: false,
  sock: null,
  hb: null,
  delay: 250,
  wLoaded: false,
  lastTs: '',
  vT: null,
  lastBgKey: '',
  lastTick: 0,
  unit: 'c',
  wData: null,
  revealTok: 0
};

export const SI = {
  online: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#23a55a"/></svg>',
  idle: '<svg viewBox="0 0 24 24"><g transform="translate(24 0) scale(-1 1)"><path d="M21.3 12.65A9 9 0 1 1 11.35 2.7a7 7 0 0 0 9.95 9.95Z" fill="#e0a020"/></g></svg>',
  dnd: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#f23f43"/><rect x="6.8" y="10.15" width="10.4" height="3.7" rx="1.85" fill="#000"/></svg>',
  offline: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.7" fill="none" stroke="#9a9a9a" stroke-width="4.6"/></svg>'
};

export const VB = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in' };

export function fmtNum(n) {
  const v = Number(n) || 0;
  if (v >= 1e9) return trim1(v / 1e9) + 'B';
  if (v >= 1e6) return trim1(v / 1e6) + 'M';
  if (v >= 1e3) return trim1(v / 1e3) + 'K';
  if (Number.isInteger(v)) return String(v);
  return trim1(v);
}

function trim1(v) {
  return v.toFixed(1).replace(/\.0$/, '');
}

export function timeAgo(ms) {
  const d = Date.now() - Number(ms || 0);
  if (!isFinite(d) || d < 0) return '';
  if (d < 45000) return 'just now';
  const mins = Math.floor(d / 60000);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return new Date(Number(ms)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function esc(s) {
  return String(s || '').replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

export function safeUrl(u) {
  const s = String(u || '').trim();
  return /^(https?:|data:image\/|blob:)/i.test(s) ? s : '';
}

export function tile(text, letters) {
  const words = String(text || '?')
    .replace(/[^A-Za-z0-9\s\u0400-\u04FF]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const n = letters || 1;
  const txt = (
    words.length > 1 && n > 1
      ? words[0][0] + words[1][0]
      : (words[0] || '?').slice(0, n)
  )
    .toUpperCase()
    .slice(0, 2);
  let h = 0;
  const seed = String(text || 'x');
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="hsl(' + h + ' 58% 32%)"/>' +
    '<stop offset="1" stop-color="hsl(' + ((h + 46) % 360) + ' 54% 14%)"/>' +
    '</linearGradient></defs>' +
    '<rect width="100" height="100" fill="url(#g)"/>' +
    '<text x="50" y="52" font-family="Satoshi,system-ui,sans-serif" font-size="' + (n > 1 ? 34 : 46) +
    '" font-weight="700" fill="rgba(255,255,255,.92)" text-anchor="middle">' + txt + '</text></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function cGet(k, mx) {
  try {
    const v = JSON.parse(localStorage.getItem(k) || 'null');
    if (!v || !v.t || !v.d) return null;
    if (mx && Date.now() - v.t > mx) return null;
    return v.d;
  } catch (e) {
    return null;
  }
}

export function cSet(k, d) {
  try {
    localStorage.setItem(k, JSON.stringify({ t: Date.now(), d }));
  } catch (e) {}
}

let toastT = null;
export function toast(m, err) {
  const t = $('toast');
  if (!t) return;
  t.innerHTML = '<span class="ic">' + (err ? '<svg viewBox="0 0 24 24"><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/></svg>' : '<svg viewBox="0 0 24 24"><polyline points="4.5 12.5 9.5 17.5 19.5 6.5"/></svg>') + '</span><span>' + esc(m) + '</span>';
  t.classList.toggle('error', !!err);
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(function() {
    t.classList.remove('show');
  }, 2200);
}

function legacyCopy(t, cb) {
  try {
    const a = document.createElement('textarea');
    a.value = t;
    a.setAttribute('readonly', '');
    a.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(a);
    a.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(a);
    if (ok && cb) cb();
  } catch (e) {}
}

export function copy(t, btn) {
  const done = function() {
    toast('copied ' + t);
    if (btn) {
      btn.classList.add('copied');
      setTimeout(function() { btn.classList.remove('copied'); }, 1000);
    }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(done, function() { legacyCopy(t, done); });
  } else {
    legacyCopy(t, done);
  }
}
