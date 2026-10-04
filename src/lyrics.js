import { $, S, C, FB, DEF_BG, safeUrl, esc } from './config.js';
import { scMax } from './navigation.js';

let lyrCache = {};
let artCache = {};

try { lyrCache = JSON.parse(localStorage.getItem('sat-lyr') || localStorage.getItem('kast-lyr') || '{}') || {}; } catch (e) { lyrCache = {}; }

function trimStore(o, m) {
  try {
    const ks = Object.keys(o);
    if (ks.length > m) {
      const k2 = {};
      ks.slice(-m).forEach(k => { k2[k] = o[k]; });
      return k2;
    }
    return o;
  } catch (e) { return o; }
}

function saveLyrCache() {
  try {
    lyrCache = trimStore(lyrCache, 200);
    localStorage.setItem('sat-lyr', JSON.stringify(lyrCache));
  } catch (e) {}
}

export function discordSec() {
  if (!S.spStart) return 0;
  let e = (Date.now() - S.spStart) / 1000;
  if (!isFinite(e) || e < 0) e = 0;
  if (S.spEnd) {
    const t = (S.spEnd - S.spStart) / 1000;
    if (t > 0 && e > t) e = t;
  }
  return e;
}

export function spDur() {
  return S.spStart && S.spEnd ? Math.max(0, (S.spEnd - S.spStart) / 1000) : 0;
}

export function fmtEl(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h ? h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') : m + ':' + String(s).padStart(2, '0');
}

export function updSongTime() {
  if (!S.sp) return;
  const total = spDur();
  const el = discordSec();
  const cTxt = fmtEl(el * 1000);
  if (cTxt !== S.lastTs) {
    S.lastTs = cTxt;
    const cur = $('timeCurrent');
    if (cur) cur.textContent = cTxt;
  }
  const tot = $('timeTotal');
  if (tot) tot.textContent = total > 0 ? fmtEl(total * 1000) : '--:--';
  const fill = $('progressFill');
  if (fill) fill.style.width = total > 0 ? Math.min(100, el / total * 100).toFixed(2) + '%' : '0%';
}

export function findIdx(s) {
  let i = 0;
  for (let k = 0; k < S.disp.length; k++) {
    if (s >= S.disp[k].time) i = k;
    else break;
  }
  return i;
}

export function setArt(url) {
  const bg = $('lyricsBg');
  const c = safeUrl(url);
  const lyrArt = $('lyricsArt');
  if (c) {
    if (bg) {
      bg.style.backgroundImage = 'url("' + c.replace(/["\\\n]/g, encodeURIComponent) + '")';
      bg.classList.add('show');
    }
    if (lyrArt) {
      lyrArt.src = c;
      lyrArt.style.display = '';
    }
  } else {
    if (bg) {
      bg.style.backgroundImage = '';
      bg.classList.remove('show');
    }
    if (lyrArt) {
      lyrArt.removeAttribute('src');
      lyrArt.style.display = 'none';
    }
  }
}

export function setBgArt(url) {
  const c = safeUrl(url) || DEF_BG;
  if (c === S.lastBgKey) return;
  S.lastBgKey = c;
  const a = $('bgArt');
  const s = $('bgArtShadow');
  if (a) {
    a.style.backgroundImage = 'url("' + c.replace(/["\\\n]/g, encodeURIComponent) + '")';
    a.classList.add('show');
  }
  if (s) s.classList.add('show');
}

export function dominantColor(img) {
  try {
    const c = document.createElement('canvas');
    const n = 20;
    c.width = c.height = n;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, n, n);
    const d = x.getImageData(0, 0, n, n).data;
    const acc = [0, 0, 0];
    let wt = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const l = (mx + mn) / 2;
      const s = mx === mn ? 0 : l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
      const w = s * (1 - Math.abs(l - 0.5) * 1.4);
      if (l > 0.1 && l < 0.92) {
        acc[0] += d[i] * w;
        acc[1] += d[i + 1] * w;
        acc[2] += d[i + 2] * w;
        wt += w;
      }
    }
    if (wt < 0.001) return [255, 255, 255];
    return [Math.round(acc[0] / wt), Math.round(acc[1] / wt), Math.round(acc[2] / wt)];
  } catch (e) {
    return [255, 255, 255];
  }
}

export function applyAccent(c) {
  document.documentElement.style.setProperty('--ac1', Math.min(255, c[0] + 45) + ',' + Math.min(255, c[1] + 45) + ',' + Math.min(255, c[2] + 45));
}

export function parseLrc(t) {
  const o = [];
  String(t || '').split(/\r?\n/).forEach(r => {
    const re = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
    let m;
    const ts = [];
    while ((m = re.exec(r))) {
      ts.push(parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) / Math.pow(10, m[3].length) : 0));
    }
    const x = r.replace(re, '').replace(/\[([^\]]+)\]/g, '($1)').trim();
    if (x) ts.forEach(time => { o.push({ time, text: x }); });
  });
  return o.sort((a, b) => a.time - b.time);
}

export function cleanTrack(t) {
  return String(t || '')
    .replace(/\s*[-–]\s*(remaster(ed)?|single|album|radio|deluxe|bonus|explicit|clean|version|edit).*/i, '')
    .replace(/\s*[\[\(][^\]\)]*(remaster|feat\.|ft\.|live|version|edit|radio)[^\]\)]*[\]\)]/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function primaryArtist(a) {
  return String(a || '').split(/[,;]|\s+feat(?:uring)?\s+|\s+ft\.?\s+|\s+x\s+/i)[0].replace(/^by\s+/i, '').trim();
}

export function normMeta(s) {
  return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^@+/, '').replace(/&/g, ' and ').replace(/\b(feat(?:uring)?|ft)\b.*$/, '').replace(/\b(official|audio|video|lyrics|lyric)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function normArtist(s) {
  return normMeta(primaryArtist(s)).replace(/\s*(topic|vevo|official|music|records|entertainment)\s*$/, '').replace(/\s+/g, ' ').trim();
}

export function normTitle(s) {
  return normMeta(cleanTrack(s)).replace(/\b(remaster(?:ed)?|single|album|radio|deluxe|bonus|explicit|clean|version|edit)\b/g, ' ').replace(/\s+/g, ' ').trim();
}

export function wordT(t, start, next) {
  const ws = String(t).trim().split(/\s+/).filter(Boolean);
  if (!ws.length) return [];
  let tot = 0;
  ws.forEach(w => { tot += w.length; });
  const dur = Math.max(0.4, Math.min(next && next > start ? next - start : 2.6, 6));
  let c = start;
  const o = [];
  ws.forEach(w => {
    const sp = Math.max(0.12, w.length / Math.max(1, tot) * dur);
    o.push({ start: c, end: c + sp });
    c += sp;
  });
  return o;
}

export function buildDisplay(lines) {
  const out = [];
  lines.forEach((cur, i) => {
    if (i === 0 && cur.time > 8) out.push({ time: 0, text: '', instrumental: true });
    else if (i > 0 && cur.time - lines[i - 1].time > 8) out.push({ time: lines[i - 1].time + 1, text: '', instrumental: true });
    out.push({ time: cur.time, text: cur.text, instrumental: false });
  });
  out.forEach((l, k) => {
    l.wordTimings = l.instrumental ? [] : wordT(l.text, l.time, out[k + 1] ? out[k + 1].time : 0);
  });
  return out;
}

export function fetchJSON(url, ms) {
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), ms || 5000);
  return fetch(url, { signal: ac.signal, referrerPolicy: 'no-referrer' })
    .then(r => { clearTimeout(to); return r.ok ? r.json() : null; })
    .catch(() => { clearTimeout(to); return null; });
}

export function fetchArtwork(artist, song, album) {
  const cleanA = (artist || '').replace(/^by\s+/i, '').trim();
  const cleanS = cleanTrack(song || '');
  if (!cleanA || !cleanS) return Promise.resolve('');
  const ck = (cleanA + '|' + cleanS).toLowerCase();
  if (artCache[ck]) return Promise.resolve(artCache[ck]);

  const deezerUrl = 'https://api.deezer.com/search?q=' + encodeURIComponent('artist:"' + cleanA.replace(/"/g, '') + '" track:"' + cleanS.replace(/"/g, '') + '"') + '&limit=1';
  const itunesUrl = 'https://itunes.apple.com/search?term=' + encodeURIComponent(cleanA + ' ' + cleanS) + '&entity=song&limit=3';

  return Promise.all([
    fetchJSON(deezerUrl).then(d => (d && d.data && d.data[0] && d.data[0].album) ? (d.data[0].album.cover_xl || d.data[0].album.cover_big || '') : ''),
    fetchJSON(itunesUrl).then(d => {
      if (d && d.results) {
        for (let i = 0; i < d.results.length; i++) {
          const a = d.results[i].artworkUrl100 || d.results[i].artworkUrl60;
          if (a) return a.replace('100x100bb', '1000x1000bb').replace('100x100', '1000x1000');
        }
      }
      return '';
    })
  ]).then(r => {
    const art = r[0] || r[1] || '';
    if (art) artCache[ck] = art;
    return art;
  }).catch(() => '');
}

export function lyricsMatch(it, artist, track, album, dur) {
  if (!it || !it.syncedLyrics) return -1;
  const at = normTitle(it.trackName || it.name), qt = normTitle(track);
  const aa = normArtist(it.artistName), qa = normArtist(artist);
  if (!at || !qt || !aa || !qa) return -1;
  if (!(at === qt || at.indexOf(qt) !== -1 || qt.indexOf(at) !== -1)) return -1;
  if (!(aa === qa || aa.indexOf(qa) !== -1 || qa.indexOf(aa) !== -1)) return -1;
  let sc = (at === qt ? 50 : 26) + (aa === qa ? 36 : 18) + 10;
  if (album && it.albumName) {
    const al = normTitle(it.albumName), q2 = normTitle(album);
    if (al === q2) sc += 14;
    else if (al.indexOf(q2) !== -1 || q2.indexOf(al) !== -1) sc += 6;
  }
  if (dur && it.duration) {
    const dd = Math.abs(Number(it.duration) - dur);
    if (dd <= 1) sc += 32;
    else if (dd <= 2.5) sc += 22;
    else if (dd <= 5) sc += 12;
    else if (dd <= 9) sc += 2;
    else if (dd > 14) sc -= 20;
  }
  return sc;
}

export function fetchLyrics(artist, track, dur, album) {
  const ck = (artist || '').toLowerCase() + '|' + (track || '').toLowerCase() + '|' + Math.round(dur || 0);
  const c = lyrCache[ck];
  if (c && Date.now() - c.t < 6048e5) return Promise.resolve(c.l);

  const cT = cleanTrack(track);
  const a = primaryArtist(artist);
  const al = album || '';
  const L = 'https://lrclib.net/api/';
  const urls = [L + 'search?artist_name=' + encodeURIComponent(a) + '&track_name=' + encodeURIComponent(cT)];

  return Promise.all(urls.map(u => fetchJSON(u, 6000))).then(res => {
    let best = null, bs = -1;
    function add(it) {
      const sc = lyricsMatch(it, a, track, al, dur);
      if (sc > bs) { bs = sc; best = it; }
    }
    res.forEach(r => {
      if (Array.isArray(r)) r.forEach(add);
      else if (r) add(r);
    });
    const lines = best && bs >= 52 ? parseLrc(best.syncedLyrics) : [];
    if (lines.length) {
      lyrCache[ck] = { l: lines, t: Date.now() };
      saveLyrCache();
    }
    return lines;
  }).catch(() => []);
}

function wSpans(t) {
  return String(t).trim().split(/\s+/).filter(Boolean).map(w => '<span class="w">' + esc(w) + '</span>').join(' ');
}

function lineHtml(l, i, active, modal) {
  return '<p class="' + (modal ? 'lyr-line' : 'lyric-line') + (l.instrumental ? ' instrumental' : '') + (active ? ' active' : '') + '" data-idx="' + i + '">' + (l.instrumental ? 'instrumental' : wSpans(l.text)) + '</p>';
}

export function renderTrack(l) {
  const track = $('lyricsTrack');
  if (!track) return;
  track.style.transform = 'translateY(0)';
  track.innerHTML = !l ? '' : !l.length ? '<p class="lyric-line active">no lyrics found</p>' : l.map((x, i) => lineHtml(x, i, i === 0, false)).join('');
}

export function buildList() {
  const list = $('lyricsList');
  if (!list) return;
  list.innerHTML = S.disp.length ? S.disp.map((l, i) => lineHtml(l, i, false, true)).join('') : '<p class="lyr-line empty">no lyrics found for this track</p>';
}

export function padList() {
  const scroll = $('lyricsScroll');
  const list = $('lyricsList');
  if (!scroll || !list) return;
  const h = Math.round(scroll.clientHeight / 2);
  list.style.paddingTop = Math.min(24, h) + 'px';
  list.style.paddingBottom = Math.max(80, h) + 'px';
}

export function syncModal(idx, smooth) {
  const scroll = $('lyricsScroll');
  const list = $('lyricsList');
  if (!scroll || !list) return;
  const els = list.children;
  if (!S.disp.length || !els.length) return;
  for (let i = 0; i < els.length; i++) {
    els[i].classList.toggle('active', i === idx);
    els[i].classList.toggle('passed', i < idx);
  }
  const a = els[idx];
  if (!a) return;
  const max = scroll.scrollHeight - scroll.clientHeight;
  if (max <= 0) return;
  let t = a.offsetTop - scroll.clientHeight / 2 + a.offsetHeight / 2;
  t = Math.max(0, Math.min(t, max));
  if (smooth) {
    try { scroll.scrollTo({ top: t, behavior: 'smooth' }); } catch (e) { scroll.scrollTop = t; }
  } else {
    scroll.scrollTop = t;
  }
}

export function resetWords(c) {
  if (!c) return;
  const w = c.querySelectorAll('.w');
  for (let i = 0; i < w.length; i++) {
    w[i].style.opacity = '';
    w[i].classList.remove('now');
  }
}

export function updWords(c, idx, sec) {
  if (!c) return;
  const l = S.disp[idx];
  if (!l || l.instrumental) return;
  const el = c.children[idx];
  if (!el) return;
  const ws = el.querySelectorAll('.w'), ts = l.wordTimings;
  if (!ts) return;
  const n = Math.min(ws.length, ts.length);
  for (let i = 0; i < n; i++) {
    const wt = ts[i];
    const op = sec <= wt.start ? 0.32 : sec >= wt.end ? 1 : 0.32 + (sec - wt.start) / (wt.end - wt.start) * 0.68;
    ws[i].style.opacity = op.toFixed(3);
    ws[i].classList.toggle('now', sec >= wt.start && sec < wt.end);
  }
}

export function loop() {
  S.raf = requestAnimationFrame(loop);
  const now = performance.now();
  if (now - S.lastTick < 28) return;
  S.lastTick = now;
  updSongTime();
  if (!S.disp.length) return;
  const sec = Math.max(0, discordSec() - C.off);
  const idx = findIdx(sec);
  const track = $('lyricsTrack');
  const list = $('lyricsList');

  if (idx !== S.idx) {
    S.idx = idx;
    if (track) {
      resetWords(track);
      const els = track.children;
      for (let j = 0; j < els.length; j++) els[j].classList.toggle('active', j === idx);
      track.style.transform = 'translateY(' + (-idx * 38) + 'px)';
    }
    if (S.modalOpen && list) {
      resetWords(list);
      syncModal(idx, true);
    }
  }

  if (track) updWords(track, idx, sec);
  if (S.modalOpen && list) updWords(list, idx, sec);
}

export function startLoop() {
  if (!S.raf) S.raf = requestAnimationFrame(loop);
}

export function stopLoop() {
  if (S.raf) cancelAnimationFrame(S.raf);
  S.raf = null;
}

export function resetLyrics() {
  S.disp = [];
  S.idx = -1;
  S.reqId++;
}

export function setLyrics(l) {
  S.disp = buildDisplay(l);
  S.idx = -1;
  renderTrack(S.disp);
  buildList();
  padList();
  if (S.modalOpen) {
    requestAnimationFrame(() => syncModal(S.idx < 0 ? 0 : S.idx, false));
  }
}

export function openLyrics() {
  if (!S.sp) return;
  S.modalOpen = true;
  const overlay = $('lyricsOverlay');
  if (overlay) overlay.classList.add('show');
  document.body.classList.add('locked');
  buildList();
  padList();
  updSongTime();
  const target = S.idx < 0 ? 0 : S.idx;
  syncModal(target, false);
  requestAnimationFrame(() => syncModal(target, false));
}

export function exitFs() {
  try {
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex && (document.fullscreenElement || document.webkitFullscreenElement)) {
      const r = ex.call(document);
      if (r && r.catch) r.catch(() => {});
    }
  } catch (e) {}
}

export function closeLyrics() {
  if (!S.modalOpen) return;
  S.modalOpen = false;
  const overlay = $('lyricsOverlay');
  if (overlay) overlay.classList.remove('show');
  document.body.classList.remove('locked');
  exitFs();
}

export function applySp(sp) {
  S.sp = sp;
  const np = $('nowPlaying');
  if (np) {
    np.hidden = false;
    np.classList.add('in');
  }

  const sName = sp.song || '';
  const aName = sp.artist ? sp.artist.replace(/^by\s+/i, '') : '';
  const songEl = $('nowSong'), artEl = $('nowArtist');
  const lyrSong = $('lyricsSong'), lyrArt = $('lyricsArtist');
  if (songEl) songEl.textContent = sName;
  if (artEl) artEl.textContent = aName;
  if (lyrSong) lyrSong.textContent = sName;
  if (lyrArt) lyrArt.textContent = aName;

  const k = aName + ' - ' + sName;
  const isNew = k !== S.songKey;

  if (isNew) {
    S.songKey = k;
    S.spEnd = 0;
    S.lastTs = '';
    const nowArt = $('nowArt');
    const art = safeUrl(sp.album_art_url);
    if (art) {
      if (nowArt) { nowArt.src = art; nowArt.style.display = ''; }
      setArt(art);
      setBgArt(art);
    } else {
      fetchArtwork(aName, sName, sp.album).then(fetchedArt => {
        if (fetchedArt && S.songKey === k) {
          if (nowArt) { nowArt.src = fetchedArt; nowArt.style.display = ''; }
          setArt(fetchedArt);
          setBgArt(fetchedArt);
        } else {
          if (nowArt) nowArt.src = FB;
          setArt('');
          setBgArt(DEF_BG);
        }
      });
    }
  }

  if (sp.timestamps) {
    if (sp.timestamps.start) {
      const ns = sp.timestamps.start;
      if (isNew || !S.spStart || Math.abs(ns - S.spStart) > 1500) S.spStart = ns;
    }
    if (sp.timestamps.end) S.spEnd = sp.timestamps.end;
  }

  startLoop();
  updSongTime();
  setTimeout(scMax, 50);

  if (!isNew) return;
  resetLyrics();
  renderTrack(null);

  const ck = (aName || '').toLowerCase() + '|' + (sName || '').toLowerCase() + '|' + Math.round(spDur());
  const cachedLyr = lyrCache[ck];
  if (cachedLyr && Date.now() - cachedLyr.t < 6048e5 && cachedLyr.l && cachedLyr.l.length) {
    setLyrics(cachedLyr.l);
    return;
  }

  const list = $('lyricsList');
  if (list) list.innerHTML = '<p class="lyr-line empty">loading lyrics…</p>';
  padList();

  const rid = S.reqId;
  const dur = Math.round(spDur());
  fetchLyrics(aName, sName, dur, sp.album || '').then(lines => {
    if (rid !== S.reqId || !S.sp || S.songKey !== k) return;
    setLyrics(lines);
  });
}

export function clearNow() {
  S.sp = null;
  S.songKey = '';
  S.spStart = 0;
  S.spEnd = 0;
  S.lastTs = '';
  if ($('nowPlaying')) $('nowPlaying').hidden = true;
  resetLyrics();
  renderTrack(null);
  const list = $('lyricsList');
  if (list) list.innerHTML = '<p class="lyr-line empty">nothing playing right now</p>';
  setArt('');
  setBgArt('');
  const nowArt = $('nowArt');
  if (nowArt) nowArt.removeAttribute('src');
  if ($('progressFill')) $('progressFill').style.width = '0%';
  if ($('timeCurrent')) $('timeCurrent').textContent = '0:00';
  if ($('timeTotal')) $('timeTotal').textContent = '--:--';
  closeLyrics();
  stopLoop();
  applyAccent([255, 255, 255]);
  setTimeout(scMax, 50);
}

export function initLyricsModal() {
  const overlay = $('lyricsOverlay');
  const listeningLine = $('listeningLine');
  const fsBtn = $('fsBtn');
  const modal = $('lyricsModal');
  const lyrArt = $('lyricsArt');
  const nowArt = $('nowArt');

  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === e.currentTarget) closeLyrics();
    });
  }

  if (listeningLine) {
    listeningLine.addEventListener('click', openLyrics);
    listeningLine.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLyrics();
      }
    });
  }

  if (fsBtn && modal) {
    fsBtn.addEventListener('click', function() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const req = modal.requestFullscreen || modal.webkitRequestFullscreen;
        if (req) {
          try {
            const r = req.call(modal);
            if (r && r.catch) r.catch(() => {});
          } catch (e) {}
        }
      } else {
        exitFs();
      }
      setTimeout(() => {
        if (!S.modalOpen) return;
        padList();
        if (S.disp.length && S.idx >= 0) syncModal(S.idx, false);
      }, 400);
    });
  }

  if (lyrArt) {
    lyrArt.addEventListener('load', function() {
      applyAccent(dominantColor(this));
    });
  }

  if (nowArt) {
    nowArt.addEventListener('error', function() {
      this.src = FB;
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && S.modalOpen && !document.fullscreenElement) {
      closeLyrics();
      return;
    }
    if (!S.sp) return;
    if (e.key === '[') C.off -= 0.1;
    else if (e.key === ']') C.off += 0.1;
    else if (e.key === '\\') C.off = 0;
    else return;

    C.off = Math.max(-10, Math.min(10, Math.round(C.off * 100) / 100));
    try { localStorage.setItem('sat-off', String(C.off)); } catch (err) {}
    S.idx = -1;
  });
}
