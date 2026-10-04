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
  if (booted) return;
  booted = true;
  const bio = $('bioText');
  if (bio) bio.innerHTML = C.bio;
  const status = $('statusDot');
  if (status) status.innerHTML = SI.offline;

  document.querySelectorAll('.js-handle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const v = document.querySelector('.js-handle');
      if (v) {
        const t = v.textContent.trim();
        if (t) copy(t, btn);
      }
    });
  });

  setArt('');
  setBgArt('');
  clearNow();

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

  try {
    const cp = cGet(CK_P, 300000);
    if (cp && cp.discord_user && cp.discord_user.id === C.id) {
      presence(cp);
    }
  } catch (e) {}

  connect();

  setTimeout(scMax, 300);
  setTimeout(scMax, 1200);

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
