// Sativa Main Entry Point
import { $, S, C, SI, CK_P, cGet, copy } from './config.js';
import { initScroll, initNavigation, initTilt, initBg, initViewCounter, playReveal, scMax } from './navigation.js';
import { initWeather } from './weather.js';
import { initLyricsModal, setArt, setBgArt, clearNow } from './lyrics.js';
import { connect, presence } from './lanyard.js';
import { initMusic } from './music.js';
import { initGames } from './games.js';
import { initGuestbook } from './guestbook.js';

function init() {
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

  // Initialize modules
  initScroll();
  initTilt();
  initBg();
  initWeather();
  initLyricsModal();
  initMusic();
  initGames();
  initGuestbook();
  initViewCounter();
  initNavigation();

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
