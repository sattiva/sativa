
import { $, esc, toast, safeUrl, fmtNum, timeAgo, tile } from './config.js';
import { scMax } from './navigation.js';

const API = '/api/scrobble';
const REFRESH_MS = 300000;

let loaded = false;
let timer = null;

async function getJSON(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 7000);
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctl.signal });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.ok === true ? j : null;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function set(id, v) {
  const el = $(id);
  if (el) el.textContent = v;
}

function art(seed, cls, url) {
  const clean = safeUrl(url);
  if (clean) {
    return '<img class="' + cls + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(clean) + '">';
  }
  return '<span class="' + cls + ' ' + cls + '-ph" style="background-image:url(' + tile(seed, 1) + ')"></span>';
}

function renderStats(st) {
  set('statScrobbles', fmtNum(st.scrobbles));
  set('statArtists', fmtNum(st.artists));
  set('statTracks', fmtNum(st.tracks));
  set('statAlbums', fmtNum(st.albums));
  set('statAvg', st.avgPerDay != null ? fmtNum(st.avgPerDay) : '—');
  set('statDays', st.days != null ? fmtNum(st.days) : '—');

  set('heroScrobbles', fmtNum(st.scrobbles));
  set('heroAvg', st.avgPerDay != null ? fmtNum(st.avgPerDay) : '—');
  set('heroDays', st.days != null ? fmtNum(st.days) : '—');
  set('statTopArtistName', st.topArtist || '—');

  const rail = $('railScrobbles');
  if (rail) rail.textContent = fmtNum(st.scrobbles);

  const grid = $('statGrid');
  if (grid) grid.classList.add('on');
}

function renderRecent(rows) {
  const el = $('recentList');
  if (!el) return;
  if (!rows || !rows.length) {
    el.innerHTML = '<p class="empty">nothing logged yet</p>';
    return;
  }
  el.innerHTML = rows
    .map(function (r) {
      const title = String(r.title || r.name || '').slice(0, 90);
      const artist = String(r.artist || '').slice(0, 90);
      const live = r.now ? ' live' : '';
      const when = r.now ? 'now' : r.ts ? timeAgo(r.ts) : '';
      return (
        '<div class="log-row' + live + '">' +
        '<span class="log-mark"></span>' +
        art(title, 'log-art', r.art) +
        '<span class="log-txt"><span class="log-name">' + esc(title) + '</span>' +
        '<span class="log-artist">' + esc(artist) + '</span></span>' +
        '<span class="log-when">' + esc(when) + '</span>' +
        '</div>'
      );
    })
    .join('');
}

function rank(items) {
  if (!items || !items.length) return '<p class="empty">nothing logged yet</p>';
  return items
    .map(function (r, i) {
      const name = String(r.name || '').slice(0, 80);
      return (
        '<div class="rk">' +
        '<span class="rk-n">' + (i + 1) + '</span>' +
        art(name, 'rk-art', r.art) +
        '<span class="rk-name">' + esc(name) + '</span>' +
        '<span class="rk-plays">' + esc(fmtNum(r.plays)) + '</span>' +
        '</div>'
      );
    })
    .join('');
}

function albums(items) {
  const el = $('topAlbumsList');
  if (!el) return;
  if (!items || !items.length) {
    el.innerHTML = '<p class="empty">nothing logged yet</p>';
    return;
  }
  el.innerHTML = items
    .map(function (r) {
      const name = String(r.name || '').slice(0, 70);
      const tail = String(r.artist || '').slice(0, 70);
      return (
        '<div class="al">' +
        art(name, 'al-art', r.art) +
        '<span class="al-name">' + esc(name) + '</span>' +
        (tail ? '<span class="al-artist">' + esc(tail) + '</span>' : '') +
        '<span class="al-plays">' + esc(fmtNum(r.plays)) + ' plays</span>' +
        '</div>'
      );
    })
    .join('');
}

function markSource(j) {
  const el = $('statsSource');
  if (!el) return;
  if (j && j.source === 'lanyard') {
    el.textContent = j.live ? 'now playing' : 'lanyard';
    el.dataset.src = 'live';
    return;
  }
  el.textContent = j && j.offline ? 'read-only' : 'live';
  el.dataset.src = j && j.offline ? 'off' : 'live';
}

async function load() {
  const j = await getJSON(API);
  if (!j || !j.stats) {
    const el = $('statsEmpty');
    if (el) {
      el.hidden = false;
      el.textContent = 'listening stats are unavailable right now';
    }
    const src = $('statsSource');
    if (src) {
      src.textContent = 'offline';
      src.dataset.src = 'unavailable';
    }
    return;
  }

  markSource(j);
  renderStats(j.stats);
  renderRecent(j.recent);

  const artistsEl = $('topArtistsList');
  if (artistsEl) artistsEl.innerHTML = rank(j.topArtists);
  albums(j.topAlbums);

  setTimeout(scMax, 80);
}

function refresh() {
  load().catch(() => toast('could not refresh listening stats', true));
}

export function initStats() {
  const section = document.querySelector('section[data-view="music"]');
  const grid = $('statGrid');
  if (!section || !grid) return;

  function begin() {
    if (loaded) return;
    loaded = true;
    refresh();
    clearInterval(timer);
    timer = setInterval(refresh, REFRESH_MS);
  }

  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      function (entries) {
        for (let i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          begin();
          io.disconnect();
          return;
        }
      },
      { threshold: 0, rootMargin: '120px' }
    );
    io.observe(section);
  } else {
    begin();
  }
}
