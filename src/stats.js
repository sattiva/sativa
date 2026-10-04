// Music Vault statistics. Last.fm is the primary source via /api/lastfm; if it is
// unconfigured or unreachable it degrades to locally tracked vault plays from
// /api/scrobble. Nothing renders until a fetch resolves, so the grid never flashes
// placeholder zeros as if they were real numbers.

import { $, esc, toast, safeUrl, fmtNum, timeAgo } from './config.js';
import { scMax } from './navigation.js';

const API = '/api/lastfm';
const VAULT = '/api/scrobble';
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

function renderStats(st, counts, exact) {
  const plus = exact ? '' : '+';
  set('statScrobbles', fmtNum(st.scrobbles));
  set('statArtists', counts && counts.artists != null ? fmtNum(counts.artists) + plus : '—');
  set('statTracks', counts && counts.tracks != null ? fmtNum(counts.tracks) + plus : '—');
  set('statAlbums', counts && counts.albums != null ? fmtNum(counts.albums) + plus : '—');
  set('statAvg', st.avgPerDay != null ? fmtNum(st.avgPerDay) : '—');
  set('statDays', st.days != null ? fmtNum(st.days) : '—');

  const wrap = $('statTopArtist');
  const name = $('statTopArtistName');
  if (wrap && name) {
    const v = st.topArtist || '';
    wrap.hidden = !v;
    name.textContent = v;
  }
  const grid = $('statGrid');
  if (grid) grid.classList.toggle('is-loaded', true);
  const exactNote = $('statsExact');
  if (exactNote) {
    exactNote.hidden = exact === true;
    exactNote.textContent = 'distinct counts are a lower bound';
  }
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
      const live = r.now ? ' is-live' : '';
      const art = safeUrl(r.art)
        ? '<img class="rp-art" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(safeUrl(r.art)) + '">'
        : '<span class="rp-art rp-art-ph" aria-hidden="true"></span>';
      const when = r.now ? 'now' : timeAgo(r.ts);
      return (
        '<a class="rp-row' + live + '"' +
        (safeUrl(r.url) ? ' href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener noreferrer"' : '') +
        '>' +
        art +
        '<span class="rp-txt">' +
        '<span class="rp-name">' + esc(String(r.name || '').slice(0, 90)) + '</span>' +
        '<span class="rp-artist">' + esc(String(r.artist || '').slice(0, 90)) + '</span>' +
        '</span>' +
        '<span class="rp-when">' + esc(when) + '</span>' +
        '</a>'
      );
    })
    .join('');
}

function rankRows(rows) {
  if (!rows || !rows.length) return '<p class="rp-empty">no data</p>';
  return rows
    .map(function (r, i) {
      const art = safeUrl(r.art)
        ? '<img alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(safeUrl(r.art)) + '">'
        : '<span class="rk-art rk-art-ph" aria-hidden="true"></span>';
      const tag = safeUrl(r.url)
        ? '<a class="rk-row" href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener noreferrer">'
        : '<div class="rk-row">';
      const end = safeUrl(r.url) ? '</a>' : '</div>';
      return (
        tag +
        '<span class="rk-n">' + (i + 1) + '</span>' +
        '<span class="rk-art">' + art + '</span>' +
        '<span class="rk-txt"><span class="rk-name">' + esc(String(r.name || '').slice(0, 80)) + '</span>' +
        (r.artist ? '<span class="rk-sub">' + esc(String(r.artist).slice(0, 80)) + '</span>' : '') +
        '</span>' +
        '<span class="rk-plays">' + esc(fmtNum(r.plays)) + '</span>' +
        end
      );
    })
    .join('');
}

function renderAlbums(rows) {
  const el = $('topAlbumsList');
  if (!el) return;
  if (!rows || !rows.length) {
    el.innerHTML = '<p class="rp-empty">no data</p>';
    return;
  }
  el.innerHTML = rows
    .map(function (r) {
      const art = safeUrl(r.art)
        ? '<img alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(safeUrl(r.art)) + '">'
        : '<span class="al-art al-art-ph" aria-hidden="true"></span>';
      const inner =
        '<span class="al-art">' + art + '</span>' +
        '<span class="al-name">' + esc(String(r.name || '').slice(0, 70)) + '</span>' +
        '<span class="al-artist">' + esc(String(r.artist || '').slice(0, 70)) + '</span>' +
        '<span class="al-plays">' + esc(fmtNum(r.plays)) + ' plays</span>';
      return safeUrl(r.url)
        ? '<a class="al-card" href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>'
        : '<div class="al-card">' + inner + '</div>';
    })
    .join('');
}

function markSource(label) {
  const el = $('statsSource');
  if (el) {
    el.textContent = label;
    el.dataset.src = label === 'last.fm' ? 'lf' : 'vault';
  }
}

async function load() {
  const parts = await Promise.all([
    getJSON(API + '?part=stats'),
    getJSON(API + '?part=counts'),
    getJSON(API + '?part=artists'),
    getJSON(API + '?part=albums'),
    getJSON(API + '?part=recent')
  ]);

  const statsPart = parts[0];
  if (statsPart && statsPart.stats) {
    markSource('last.fm');
    const counts = parts[1] && parts[1].counts ? parts[1].counts : {};
    const exact = parts[1] ? parts[1].exact === true : false;
    const topArtist = parts[2] && parts[2].topArtists && parts[2].topArtists[0];
    renderStats(
      Object.assign({}, statsPart.stats, { topArtist: topArtist ? topArtist.name : '' }),
      Object.assign({ artists: 0, tracks: 0, albums: 0 }, counts),
      exact
    );
    renderRecent(parts[4] && parts[4].recent);
    const artistsEl = $('topArtistsList');
    if (artistsEl) artistsEl.innerHTML = rankRows(parts[2] && parts[2].topArtists);
    renderAlbums(parts[3] && parts[3].topAlbums);
    setTimeout(scMax, 80);
    return;
  }

  // Degraded path: use whatever the vault has tracked locally.
  const vault = await getJSON(VAULT);
  if (!vault || !vault.stats) {
    const el = $('statsEmpty');
    if (el) {
      el.hidden = false;
      el.textContent = 'listening stats are unavailable right now';
    }
    markSource('unavailable');
    return;
  }
  markSource('this site');
  renderStats(vault.stats, { artists: vault.stats.artists, tracks: vault.stats.tracks, albums: 0 }, true);
  const artistsEl = $('topArtistsList');
  if (artistsEl) artistsEl.innerHTML = rankRows(vault.topArtists);
  renderAlbums([]);
  renderRecent(vault.recent);
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