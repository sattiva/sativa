// PREREQ: LASTFM_API_KEY + LASTFM_USERNAME
// Read-only Last.fm proxy. The username is never taken from the request, so this
// cannot be repurposed as an open relay against arbitrary Last.fm accounts.
// Responses are cached in Redis to stay under Last.fm's 5 req/s ceiling.

const store = require('./_lib/store');
const G = require('./_lib/guard');

const API = 'https://ws.audioscrobbler.com/2.0/';
const KEY = process.env.LASTFM_API_KEY || '';
const USER = process.env.LASTFM_USERNAME || '';
const READY = KEY.length > 8 && USER.length > 1;

const TOP_LIMIT = 8;
const RECENT_LIMIT = 12;
const SWEEP_PAGES = 4;
const SWEEP_LIMIT = 100;
const SWEEP_BUDGET_MS = 8000;
const UPSTREAM_MS = 4500;
const CACHE_TTL_STATS = 900;
const CACHE_TTL_RECENT = 120;
const CACHE_TTL_COUNTS = 86400;

// Last.fm's public API exposes no distinct artist/track/album totals, and the profile
// page derives them from an internal endpoint. LASTFM_COUNTS supplies the real figures;
// without it we sweep the top-N endpoints and flag the result as a lower bound.
const COUNTS_OVERRIDE = (() => {
  try {
    const raw = process.env.LASTFM_COUNTS || '';
    if (!raw) return null;
    const j = JSON.parse(raw);
    const o = {};
    for (const k of ['artists', 'tracks', 'albums']) {
      const n = parseInt(j[k], 10);
      if (isFinite(n) && n >= 0) o[k] = n;
    }
    return Object.keys(o).length ? o : null;
  } catch (e) {
    return null;
  }
})();

const READ_LIMITS = [{ scope: 'lf:read', max: 60, windowMs: 60000 }];

function artOf(node) {
  if (!node || !Array.isArray(node.image)) return '';
  const order = ['extralarge', 'large', 'medium', 'small'];
  for (let i = 0; i < order.length; i++) {
    const hit = node.image.find((im) => im && im.size === order[i] && im['#text']);
    if (hit) return G.text(hit['#text'], 400);
  }
  return '';
}

function txt(v, max) {
  if (v === undefined || v === null) return '';
  return G.text(typeof v === 'object' ? v['#text'] || '' : v, max);
}

function num(v) {
  const n = parseInt(v, 10);
  return isFinite(n) && n >= 0 ? n : 0;
}

async function lf(method, params) {
  const qs = new URLSearchParams(Object.assign({ method, user: USER, api_key: KEY, format: 'json' }, params));
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), UPSTREAM_MS);
  try {
    const r = await fetch(API + '?' + qs.toString(), {
      headers: { Accept: 'application/json', 'User-Agent': 'sativa.cfd/1.0 (+https://sativa.cfd)' },
      signal: ctl.signal
    });
    if (!r.ok) return null;
    const j = await r.json();
    // Last.fm reports every failure as HTTP 200 with an `error` field.
    if (!j || j.error) return null;
    return j;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function cached(key, ttl, produce) {
  if (store.READY) {
    try {
      const hit = await store.get(key);
      if (typeof hit === 'string' && hit.length > 2) {
        const parsed = JSON.parse(hit);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      // cache miss on store failure is not fatal; fall through to upstream
    }
  }
  const fresh = await produce();
  if (fresh && store.READY) {
    try {
      await store.setex(key, ttl, JSON.stringify(fresh));
    } catch (e) {}
  }
  return fresh;
}

function shapeStats(info) {
  if (!info || !info.user) return null;
  const scrobbles = num(info.user.playcount);
  const reg = info.user.registered && parseInt(info.user.registered.unixtime, 10);
  const registeredMs = isFinite(reg) && reg > 0 ? reg * 1000 : 0;
  const days = registeredMs > 0 ? Math.max(1, Math.floor((Date.now() - registeredMs) / 86400000)) : 1;
  return {
    scrobbles,
    listeners: num(info.user.listeners),
    registered: registeredMs,
    days,
    avgPerDay: Math.round((scrobbles / days) * 10) / 10,
    name: txt(info.user.name, 64) || USER
  };
}

function shapeTopArtists(j) {
  const rows = (j && j.topartists && j.topartists.artist) || [];
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, TOP_LIMIT).map((a) => ({
    name: txt(a.name, 96),
    plays: num(a.playcount),
    art: artOf(a),
    url: G.text(a.url, 300)
  }));
}

function shapeTopAlbums(j) {
  const rows = (j && j.topalbums && j.topalbums.album) || [];
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, TOP_LIMIT).map((a) => ({
    name: txt(a.name, 128),
    artist: txt(a.artist, 96),
    plays: num(a.playcount),
    art: artOf(a),
    url: G.text(a.url, 300)
  }));
}

function shapeTopTracks(j) {
  const rows = (j && j.toptracks && j.toptracks.track) || [];
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, TOP_LIMIT).map((t) => ({
    name: txt(t.name, 128),
    artist: txt(t.artist, 96),
    plays: num(t.playcount),
    art: artOf(t),
    url: G.text(t.url, 300)
  }));
}

function shapeRecent(j) {
  const rows = (j && j.recenttracks && j.recenttracks.track) || [];
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (let i = 0; i < rows.length && out.length < RECENT_LIMIT; i++) {
    const t = rows[i];
    const now = !!(t['@attr'] && t['@attr'].nowplaying === 'true');
    const date = t.date && parseInt(t.date.uts, 10);
    out.push({
      name: txt(t.name, 128),
      artist: txt(t.artist, 96),
      album: txt(t.album, 128),
      art: artOf(t),
      url: G.text(t.url, 300),
      ts: isFinite(date) && date > 0 ? date * 1000 : 0,
      now: now
    });
  }
  return out;
}

// Last.fm wraps collections as { topartists: { artist: [...] } }, so both the root
// key and the item key are needed to reach the rows.
async function sweep(method, rootKey, itemKey) {
  const deadline = Date.now() + SWEEP_BUDGET_MS;
  let seen = 0;
  for (let page = 1; page <= SWEEP_PAGES; page++) {
    if (Date.now() > deadline) return { n: seen, exact: false };
    const j = await lf(method, { period: 'overall', limit: String(SWEEP_LIMIT), page: String(page) });
    if (!j) return { n: seen, exact: false };
    const root = j[rootKey];
    const rows = root ? root[itemKey] : null;
    if (!Array.isArray(rows) || !rows.length) return { n: seen, exact: true };
    seen += rows.length;
    if (rows.length < SWEEP_LIMIT) return { n: seen, exact: true };
  }
  return { n: seen, exact: false };
}

async function buildCounts() {
  if (COUNTS_OVERRIDE) {
    return { counts: Object.assign({ artists: 0, tracks: 0, albums: 0 }, COUNTS_OVERRIDE), exact: true };
  }
  const [a, t, b] = await Promise.all([
    sweep('user.getTopArtists', 'topartists', 'artist'),
    sweep('user.getTopTracks', 'toptracks', 'track'),
    sweep('user.getTopAlbums', 'topalbums', 'album')
  ]);
  return {
    counts: { artists: a.n, tracks: t.n, albums: b.n },
    exact: a.exact && t.exact && b.exact
  };
}

async function build(part) {
  if (part === 'recent') {
    return cached('lf:recent:v1', CACHE_TTL_RECENT, async () => {
      const j = await lf('user.getRecentTracks', {
        limit: String(RECENT_LIMIT),
        extended: '1'
      });
      if (!j) return null;
      return { recent: shapeRecent(j) };
    });
  }

  if (part === 'counts') {
    return cached('lf:counts:v1', CACHE_TTL_COUNTS, buildCounts);
  }

  return cached('lf:stats:v1:' + (part === 'artists' ? 'a' : part === 'albums' ? 'b' : 't'), CACHE_TTL_STATS, async () => {
    const [info, top] = await Promise.all([
      lf('user.getinfo', {}),
      lf(
        part === 'artists' ? 'user.getTopArtists' : part === 'albums' ? 'user.getTopAlbums' : 'user.getTopTracks',
        { period: 'overall', limit: String(TOP_LIMIT) }
      )
    ]);
    const stats = shapeStats(info);
    if (!stats && !top) return null;
    const payload = { stats: stats, topArtists: [], topAlbums: [], topTracks: [] };
    if (top) {
      if (part === 'artists') payload.topArtists = shapeTopArtists(top);
      else if (part === 'albums') payload.topAlbums = shapeTopAlbums(top);
      else payload.topTracks = shapeTopTracks(top);
    }
    return payload;
  });
}

module.exports = async function handler(req, res) {
  if (G.preflight(req, res)) return;
  if (!G.method(req, res, ['GET', 'HEAD'])) return;

  const part = String((req.query && req.query.part) || 'stats');
  if (['stats', 'artists', 'albums', 'tracks', 'counts', 'recent'].indexOf(part) === -1) {
    G.fail(res, 400, 'bad_part', 'Unknown part.');
    return;
  }

  if (!READY) {
    G.send(res, 200, { ok: false, error: 'lastfm_unconfigured', stats: null }, { 'Cache-Control': 'public, max-age=60' });
    return;
  }

  G.applyLimits(store, req, res, READ_LIMITS, crypto_random())
    .then((ok) => {
      if (!ok) return;
      return build(part)
        .then((data) => {
          if (!data) {
            G.send(res, 200, { ok: false, error: 'lastfm_unavailable', stats: null }, { 'Cache-Control': 'no-store' });
            return;
          }
          G.send(res, 200, Object.assign({ ok: true, part: part }, data), {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
          });
        })
        .catch(() => {
          G.send(res, 200, { ok: false, error: 'lastfm_unavailable', stats: null }, { 'Cache-Control': 'no-store' });
        });
    })
    .catch(() => {
      G.fail(res, 500, 'lastfm_error', 'Unexpected error.');
    });
};

function crypto_random() {
  return Math.random().toString(36).slice(2, 12);
}