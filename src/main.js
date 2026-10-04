// Sativa Main Entry Point
import { $, S, C, SI, CK_P, cGet, copy } from './config.js';
import { initScroll, initNavigation, initTilt, initBg, initViewCounter, playReveal, scMax } from './navigation.js';
import { initWeather } from './weather.js';
import { initLyricsModal, setArt, setBgArt, clearNow } from './lyrics.js';
import { connect, presence } from './lanyard.js';
import { initMusic } from './music.js';
import { initStats } from './stats.js';
import { initGames } from './games.js';
import { initGuestbook } from './guestbook.js';

function boot(fn) {
  try {
    fn();
  } catch (e) {
    if (window.console && console.warn) console.warn('[init] ' + (fn && fn.name) + ' failed:', e);
  }
}

// Registered at module scope in the capture phase, deliberately outside initGuestbook.
// If the guestbook module throws or bails on a missing node, a native form GET would
// still fire: the browser would navigate the SPA to /guestbook?... and Vercel would 404,
// losing the note. This makes that unrepresentable regardless of module state.
if (typeof document !== 'undefined') {
  document.addEventListener(
    'submit',
    function (e) {
      const f = e.target;
      if (f && f.id === 'gbForm') e.preventDefault();
    },
    true
  );
}

let booted = false;

function init() {
  // Idempotent: a double DOMContentLoaded would otherwise attach every listener twice,
  // double-fetch every endpoint and double-count every guestbook entry.
  if (booted) return;
  booted = true;
  // Bio & Status setup
  const bio = $('bioText');
  if (bio) bio.innerHTML = C.bio;
  const status = $('statusDot');
  if (status) status.innerHTML = SI.offline;

  // Discord handle copy
  const handle = $('handle');
  if (handle) {
    handle.addEventListener('click', function() {
      const v = $('handleText') ? $('handleText').textContent.trim() : '';
      if (v) copy(v, this);
    });
  }

  // Clear music/bg state
  setArt('');
  setBgArt('');
  clearNow();

  // Each module is isolated: one bad init (a canvas that will not getContext, a missing
  // node) must not cascade into every module after it staying dead. This is exactly how
  // the guestbook shipped broken with nobody noticing.
  boot(initScroll);
  boot(initTilt);
  boot(initBg);
  boot(initWeather);
  boot(initLyricsModal);
  boot(initMusic);
  boot(initStats);
  boot(initGames);
  boot(initGuestbook);
  boot(initViewCounter);
  boot(initNavigation);

  // Cached Discord presence recovery
  try {
    const cp = cGet(CK_P, 300000);
    if (cp && cp.discord_user && cp.discord_user.id === C.id) {
      presence(cp);
    }
  } catch (e) {}

  // Connect real-time Lanyard
  connect();

  // Scroll recalculation
  setTimeout(scMax, 300);
  setTimeout(scMax, 1200);

  // Initial reveal animation
  if (document.readyState === 'complete') {
    setTimeout(playReveal, 40);
  } else {
    window.addEventListener('load', () => setTimeout(playReveal, 40));
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
