// Music Vault player. Resolves artwork per track from the iTunes Search API (with a
// deterministic monogram fallback so a lookup miss never leaves a blank tile), drives
// the now-playing strip, and scrobbles to /api/scrobble once a play passes the halfway
// mark. The server re-validates the track id against its own manifest.

import { $, toast, safeUrl, tile } from './config.js';

const SCROBBLE_AT = 0.5;
const ART_SIZE = 400;
const LOOKUP_TIMEOUT_MS = 6000;

const PLAY_ICON = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

let audio = null;
let curRow = null;
let curScrobbled = false;
let rafId = null;

function upscale(u) {
  return String(u || '').replace(/\/\d+x\d+(bb)?\.(jpg|png)/, '/' + ART_SIZE + 'x' + ART_SIZE + 'bb.$1');
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function itunesArt(title, artist) {
  const term = (artist ? artist + ' ' : '') + title;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const r = await fetch(
      'https://itunes.apple.com/search?media=music&entity=song&limit=3&country=US&term=' + encodeURIComponent(term),
      { signal: ctl.signal }
    );
    if (!r.ok) return '';
    const j = await r.json();
    const rows = Array.isArray(j && j.results) ? j.results : [];
    if (!rows.length) return '';
    const want = norm(title);
    const hit = rows.find((x) => norm(x.trackName) === want) || rows[0];
    return safeUrl(upscale(hit.artworkUrl100 || hit.artworkUrl60));
  } catch (e) {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function setArt(img, url, title) {
  if (!img) return;
  img.onerror = function () {
    this.onerror = null;
    this.src = tile(title, 2);
  };
  img.src = url || tile(title, 2);
}

function paintRow(row, playing) {
  if (!row) return;
  row.classList.toggle('playing', playing);
  const btn = row.querySelector('.track-play-btn');
  if (btn) {
    btn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    btn.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + (row.dataset.title || 'track'));
  }
  if (!playing) {
    const fill = row.querySelector('.track-bar i');
    if (fill) fill.style.width = '0%';
  }
}

function paintNow(row, on) {
  const wrap = $('vaultNow');
  if (!wrap) return;
  wrap.hidden = !on;
  if (!on || !row) return;
  const rowImg = row.querySelector('.track-art img');
  const art = $('vaultArt');
  const title = $('vaultTitle');
  const artist = $('vaultArtist');
  const bar = $('vaultBar');
  if (art) art.src = (rowImg && rowImg.src) || tile(row.dataset.title, 2);
  if (title) title.textContent = row.dataset.title || '';
  if (artist) artist.textContent = row.dataset.artist || '';
  if (bar) bar.style.width = '0%';
}

function fmtTime(s) {
  const v = Math.max(0, Math.floor(Number(s) || 0));
  return Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0');
}

function startLoop(row) {
  cancelAnimationFrame(rafId);
  (function step() {
    if (!audio || curRow !== row) return;
    rafId = requestAnimationFrame(step);
    const el = audio.currentTime || 0;
    const dur = audio.duration;
    const known = dur && isFinite(dur) ? dur : Number(row.dataset.dur) || 0;
    const pct = known > 0 ? Math.min(1, el / known) : 0;
    const rowFill = row.querySelector('.track-bar i');
    const nowFill = $('vaultBar');
    if (rowFill) rowFill.style.width = (pct * 100).toFixed(2) + '%';
    if (nowFill) nowFill.style.width = (pct * 100).toFixed(2) + '%';
    const stamp = $('vaultElapsed');
    if (stamp) stamp.textContent = fmtTime(el);
    if (!curScrobbled && dur && isFinite(dur) && el >= dur * SCROBBLE_AT) {
      curScrobbled = true;
      fireScrobble(row, el * 1000);
    }
  })();
}

async function fireScrobble(row, ms) {
  const id = row && row.dataset.id;
  if (!id) return;
  try {
    await fetch('/api/scrobble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        ms: Math.round(ms),
        nonce: Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      })
    });
  } catch (e) {
    // Best effort -- a dropped scrobble must never interrupt playback.
  }
}

export function stopCustomAudio() {
  cancelAnimationFrame(rafId);
  if (audio) {
    audio.pause();
    audio.src = '';
    audio = null;
  }
  paintRow(curRow, false);
  paintNow(null, false);
  curRow = null;
  curScrobbled = false;
}

function play(row) {
  const src = safeUrl(row.dataset.src);
  if (!src) return;
  stopCustomAudio();
  curRow = row;
  curScrobbled = false;
  paintRow(row, true);
  paintNow(row, true);

  const a = new Audio(src);
  a.preload = 'auto';
  a.volume = 0.7;
  audio = a;
  a.addEventListener('play', () => startLoop(row));
  a.addEventListener('ended', () => stopCustomAudio());
  a.addEventListener('error', () => {
    if (audio !== a) return;
    stopCustomAudio();
    toast('preview unavailable for this track', true);
  });
  // Belt and braces: the play event is the primary signal, but if it is ever missed
  // the resolved play() promise still gets the progress/scrobble loop running.
  a.play()
    .then(() => {
      if (audio === a) startLoop(row);
    })
    .catch(() => {
      if (audio !== a) return;
      stopCustomAudio();
      toast('playback blocked by the browser', true);
    });
}

function toggle(row) {
  if (curRow === row && audio) {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    return;
  }
  play(row);
}

export function initMusic() {
  const list = $('customTrackList');
  if (!list) return;

  const rows = Array.prototype.slice.call(list.querySelectorAll('.track-row'));
  rows.forEach((row) => {
    const nameEl = row.querySelector('.track-name');
    const artEl = row.querySelector('.track-artist');
    row.dataset.title = nameEl ? nameEl.textContent.trim() : '';
    row.dataset.artist = artEl ? artEl.textContent.replace(/\s*·\s*/g, ', ').trim() : '';
    const durEl = row.querySelector('.track-dur');
    const parts = (durEl ? durEl.textContent : '').split(':');
    row.dataset.dur = parts.length === 2 ? String(Number(parts[0]) * 60 + Number(parts[1])) : '0';

    const img = row.querySelector('.track-art img');
    setArt(img, '', row.dataset.title);
    itunesArt(row.dataset.title, row.dataset.artist).then((url) => {
      if (url) setArt(img, url, row.dataset.title);
    });

    row.addEventListener('click', () => toggle(row));
  });

  const stop = $('vaultStop');
  if (stop) stop.addEventListener('click', () => stopCustomAudio());

  const badge = $('musicStatusBadge');
  if (badge) badge.textContent = rows.length + ' Tracks';
}