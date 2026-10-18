const BLOCK_MOD = {
  KeyA: 'select-all',
  KeyC: 'copy',
  KeyX: 'cut',
  KeyU: 'view-source',
  KeyS: 'save-page',
  KeyP: 'print'
};

const BLOCK_SHIFT_MOD = { KeyI: 'devtools', KeyJ: 'console', KeyC: 'devtools' };

function editable(t) {
  if (!t) return false;
  const n = t.tagName;
  return n === 'INPUT' || n === 'TEXTAREA' || n === 'SELECT' || !!t.isContentEditable;
}

function swallow(e) {
  if (!e) return false;
  if (e.stopPropagation) e.stopPropagation();
  if (e.preventDefault) e.preventDefault();
  return false;
}

function onKey(e) {
  const mod = e.ctrlKey || e.metaKey;
  const code = e.code || '';
  const key = e.key || '';

  if (key === 'F11' || (mod && e.altKey && String(key).toLowerCase() === 'f')) return;

  if (mod && e.shiftKey && BLOCK_SHIFT_MOD[code]) return swallow(e);
  if (!mod) return;

  const what = BLOCK_MOD[code];
  if (!what) return;
  if ((what === 'copy' || what === 'cut' || what === 'select-all' || what === 'print') && editable(e.target)) return;
  return swallow(e);
}

function killSelection() {
  if (editable(document.activeElement)) return;
  try {
    const s = window.getSelection ? window.getSelection() : null;
    if (s && s.rangeCount && !s.isCollapsed) s.removeAllRanges();
  } catch (e) {}
}

function initSelection() {
  const css =
    '*{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;' +
    'user-select:none!important;-webkit-touch-callout:none!important}' +
    'input,textarea,select,[contenteditable]{-webkit-user-select:text!important;' +
    '-moz-user-select:text!important;user-select:text!important}' +
    '@media print{html,body{display:none!important;height:0!important;overflow:hidden!important}}';
  try {
    const st = document.createElement('style');
    st.setAttribute('data-lock', '1');
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}
}

function initEvents() {
  document.addEventListener('contextmenu', swallow, true);
  document.addEventListener('copy', swallow, true);
  document.addEventListener('cut', swallow, true);
  document.addEventListener('dragstart', swallow, true);
  document.addEventListener('dragover', swallow, true);
  document.addEventListener('drop', swallow, true);
  document.addEventListener('selectstart', (e) => (editable(e.target) ? undefined : swallow(e)), true);
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('keyup', (e) => {
    if (e.ctrlKey || e.metaKey) killSelection();
  }, true);
  document.addEventListener('selectionchange', killSelection);
}

function initClipboard() {

  try {
    if (typeof document.execCommand === 'function') document.execCommand = () => false;
  } catch (e) {}
}

function initSpeech() {
  try {
    const ss = window.speechSynthesis;
    if (ss) {
      ss.speak = () => undefined;
      ss.resume = () => undefined;
    }
    const u = window.SpeechSynthesisUtterance;
    if (u && u.prototype && typeof u.prototype.speak === 'function') u.prototype.speak = () => undefined;
  } catch (e) {}
}

function initPrint() {
  try {
    window.print = () => undefined;
  } catch (e) {}
  try {
    window.addEventListener('beforeprint', () => {
      try {
        const d = document.documentElement;
        d.style.visibility = 'hidden';
        setTimeout(() => {
          d.style.visibility = '';
        }, 500);
      } catch (e) {}
    });
  } catch (e) {}
}

export function initProtect() {
  if (typeof document === 'undefined') return;
  if (document.documentElement.getAttribute('data-locked') === '1') return;
  try {
    document.documentElement.setAttribute('data-locked', '1');
  } catch (e) {}
  initSelection();
  initEvents();
  initClipboard();
  initSpeech();
  initPrint();
}

const OK_HOST_RE = /(^|\.)(sativa\.cfd|vercel\.app)$/i;

function junkBrick() {
  let n = 0;
  const pre = document.createElement('pre');
  pre.style = 'position:fixed;inset:0;z-index:2147483647;background:#08090b;color:#5c5f66;font:700 12px monospace;overflow:hidden;white-space:pre-wrap;word-break:break-all;padding:8px';
  (document.body || document.documentElement).appendChild(pre);
  const glyph = 'fj9w$3kX#mQz@8hL^vR2&TrB*uY5xNcPdZqeH7sG4W1o6U%K+JiEtA0MFn!~';
  const spin = () => {
    let line = '';
    for (let k = 0; k < 260; k++) line += glyph[(Math.random() * glyph.length) | 0];
    pre.textContent += line + '\n';
    if (pre.textContent.length > 40000) pre.textContent = pre.textContent.slice(-40000);
    if (++n < 26000) setTimeout(spin, 30 + Math.random() * 120);
  };
  spin();
}

export function initMirrorLock() {
  let h = '';
  try {
    h = location.hostname.toLowerCase();
  } catch (e) {
    return;
  }
  if (location.protocol === 'file:') return;
  if (!h) return;
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]' || h === '0.0.0.0') return;
  if (OK_HOST_RE.test(h)) return;
  try {
    document.title = 'sativa';
    document.documentElement.style.visibility = 'hidden';
    document.body && (document.body.innerHTML = '');
    junkBrick();
  } catch (e) {}
}
