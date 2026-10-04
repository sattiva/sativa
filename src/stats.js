// Music Vault statistics. Redis is the only source: GET /api/scrobble returns the
// lifetime baseline plus everything tracked locally. Nothing renders until the fetch
// resolves, so the grid never flashes placeholder zeros as if they were real numbers.

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

function renderStats(st) {
  set('statScrobbles', fmtNum(st.scrobbles));
  set('statArtists', fmtNum(st.artists));
  set('statTracks', fmtNum(st.tracks));
  set('statAlbums', fmtNum(st.albums));
  set('statAvg', st.avgPerDay != null ? fmtNum(st.avgPerDay) : '—');
  set('statDays', st.days != null ? fmtNum(st.days) : '—');

  const wrap = $('statTopArtist');
  const name = $('statTopArtistName');
  const v = st.topArtist || '';
  if (wrap && name) {
    wrap.hidden = !v;
    name.textContent = v;
  }
  const grid = $('statGrid');
  if (grid) grid.classList.add('is-loaded');
}

// Redis stores no image URLs, so every tile is a generated gradient monogram. If an
// artwork URL ever does appear it wins, so this is a floor rather than a hardcode.
function art(name, cls) {
  const url = safeUrl(name && name.art);
  const seed = String((name && (name.title || name.name)) || '');
  if (url) {
    return '<img class="' + cls + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(url) + '">';
  }
  return '<span class="' + cls + ' ' + cls + '-ph" style="background-image:url(' + tile(seed, 1) + ')"></span>';
}

function renderRecent(rows) {
  const el = $('recentList');
  if (!el) return;
  if (!rows || !rows.length) {
    el.innerHTML = '<p class="rp-empty">nothing played yet</p>';
    return;
  }
  el.innerHTML = rows
    .map(function (r) {
      const title = String(r.title || r.name || '').slice(0, 90);
      const artist = String(r.artist || '').slice(0, 90);
      const live = r.now ? ' is-live' : '';
      const when = r.now ? 'now' : r.ts ? timeAgo(r.ts) : '';
      return (
        '<div class="rp-row' + live + '">' +
        art({ title, art: r.art }, 'rp-art') +
        '<span class="rp-txt">' +
        '<span class="rp-name">' + esc(title) + '</span>' +
        '<span class="rp-artist">' + esc(artist) + '</span>' +
        '</span>' +
        '<span class="rp-when">' + esc(when) + '</span>' +
        '</div>'
      );
    })
    .join('');
}

function rows(items) {
  if (!items || !items.length) return '<p class="rp-empty">no data yet</p>';
  return items
    .map(function (r, i) {
      const name = String(r.name || '').slice(0, 80);
      return (
        '<div class="rk-row">' +
        '<span class="rk-n">' + (i + 1) + '</span>' +
        art(r, 'rk-art') +
        '<span class="rk-txt"><span class="rk-name">' + esc(name) + '</span></span>' +
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
    el.innerHTML = '<p class="rp-empty">no data yet</p>';
    return;
  }
  el.innerHTML = items
    .map(function (r) {
      const name = String(r.name || '').slice(0, 70);
      const tail = String(r.artist || '').slice(0, 70);
      return (
        '<div class="al-card">' +
        art(r, 'al-art') +
        '<span class="al-name">' + esc(name) + '</span>' +
        (tail ? '<span class="al-artist">' + esc(tail) + '</span>' : '') +
        '<span class="al-plays">' + esc(fmtNum(r.plays)) + ' plays</span>' +
        '</div>'
      );
    })
    .join('');
}

function markSource(label) {
  const el = $('statsSource');
  if (!el) return;
  el.textContent = label;
  el.dataset.src = label === 'read-only' ? 'off' : 'live';
}

async function load() {
  const j = await getJSON(API);
  if (!j || !j.stats) {
    const el = $('statsEmpty');
    if (el) {
      el.hidden = false;
      el.textContent = 'listening stats are unavailable right now';
    }
    markSource('unavailable');
    return;
  }

  markSource(j.offline ? 'read-only' : 'live');
  renderStats(j.stats);
  renderRecent(j.recent);

  const artistsEl = $('topArtistsList');
  if (artistsEl) artistsEl.innerHTML = rows(j.topArtists);
  const albumsEl = $('topAlbumsList');
  if (albumsEl) albums(j.topAlbums);

  setTimeout(scMax, 80);
}

function refresh() {
  load().catch(() => toast('could not refresh listening stats', true));
}

export function initStats() {
  const section = document.querySelector('[data-view="music"]');
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
      { threshold: 0.05 }
    );
    io.observe(section);
  } else {
    begin();
  }
}