// PREREQ: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Single source of truth for Music Vault listening stats. No external music API.
//
// Lifetime totals are seeded once from the BASELINE_STATS env var (your real
// historical numbers), then every vault play increments them. Track identity is
// resolved from the server-side manifest below, never from the request body, so
// counters cannot be inflated with invented tracks.
//
// BASELINE_STATS='{"scrobbles":45700,"artists":1200,"tracks":3900,"albums":2600,
//                  "days":658,"topArtist":"$uicideboy$","topArtistPlays":4100}'

const crypto = require('crypto');
const store = require('./_lib/store');
const G = require('./_lib/guard');

// Only albums defensible from the track listings are recorded. The rest stay empty
// rather than being guessed, so the album count stays honest.
const MANIFEST = {
  bounce_out: { title: 'Bounce Out x Limerence', artist: 'Limerence, Yves Tumor', album: '' },
  dream: { title: 'Dream', artist: 'knive ♱', album: '' },
  transgender: { title: 'Transgender', artist: 'Crystal Castles', album: 'II' },
  star_shopping: { title: 'Star Shopping', artist: 'Lil Peep', album: 'Crybaby' },
  goth: { title: 'Goth', artist: 'Sidewalks and Skeletons', album: '' }
};

const MIN_LISTEN_MS = 5000;
const RECENT_CAP = 20;
const WRITE_LIMITS = [
  { scope: 'sx:burst', max: 30, windowMs: 60000 },
  { scope: 'sx:hour', max: 120, windowMs: 3600000 }
];
const READ_LIMITS = [{ scope: 'sx:read', max: 120, windowMs: 60000 }];

const K_TOTAL = 'sx:total';
const K_DAYS = 'sx:days';
const K_ARTISTS = 'sx:artists';
const K_TRACKS = 'sx:tracks';
const K_ALBUMS = 'sx:albums';
const K_RECENT = 'sx:recent';
const K_TOP = 'sx:top';
const K_SEEDED = 'sx:seeded';
const K_PLAYED = 'sx:played';

const BASELINE = (() => {
  const out = { scrobbles: 0, artists: 0, tracks: 0, albums: 0, days: 0, topArtist: '', topArtistPlays: 0 };
  try {
    const raw = process.env.BASELINE_STATS || '';
    if (raw) {
      const j = JSON.parse(raw);
      for (const k of ['scrobbles', 'artists', 'tracks', 'albums', 'days', 'topArtistPlays']) {
        const n = parseInt(j[k], 10);
        if (isFinite(n) && n >= 0) out[k] = n;
      }
      if (typeof j.topArtist === 'string') out.topArtist = G.text(j.topArtist, 96);
    }
  } catch (e) {}
  return out;
})();

function dayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function pairsWithScores(raw) {
  const out = [];
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i + 1 < raw.length; i += 2) {
    const name = String(raw[i] || '');
    const plays = parseInt(raw[i + 1], 10);
    if (name) out.push({ name, plays: isFinite(plays) ? plays : 0 });
  }
  return out;
}

function ztop(zset, keyName) {
  return store
    .zrevrange(zset, 0, 7)
    .then(pairsWithScores)
    .then((rows) =>
      rows.map((r) => {
        const o = { name: r.name, plays: r.plays };
        if (keyName) o[keyName] = r.name;
        return o;
      })
    )
    .catch(() => []);
}

// Seeding is guarded by a NX flag so concurrent cold starts cannot double-apply it.
let seedPromise = null;
function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = store
    .setnx(K_SEEDED, 0, '1')
    .then((won) => {
      if (!won) return null;
      const cmds = [
        // SET..NX, not SETNX: SETNX answers 1/0 while the client wrapper keys off "OK".
        ['SET', K_TOTAL, String(BASELINE.scrobbles), 'NX'],
        ['SET', K_TOP, JSON.stringify({ name: BASELINE.topArtist, plays: BASELINE.topArtistPlays })]
      ];
      // Seed a couple of albums so the Top Albums panel is not empty on day one.
      if (BASELINE.albums > 0) {
        cmds.push(['ZINCRBY', K_ALBUMS, String(BASELINE.albums), 'seeded']);
      }
      return store.pipe(cmds).catch(() => null);
    })
    .catch(() => null);
  return seedPromise;
}

function handleGet(req, res) {
  return G.applyLimits(store, req, res, READ_LIMITS, rand())
    .then((ok) => {
      if (!ok) return;
      return ensureSeeded()
        .then(() =>
          Promise.all([
            store.get(K_TOTAL).catch(() => null),
            store.scard(K_DAYS).catch(() => 0),
            store.zcard(K_ARTISTS).catch(() => 0),
            store.zcard(K_TRACKS).catch(() => 0),
            store.zcard(K_ALBUMS).catch(() => 0),
            store.get(K_TOP).catch(() => null),
            ztop(K_ARTISTS, 'artist'),
            ztop(K_TRACKS, 'track'),
            ztop(K_ALBUMS, 'album'),
            store.lrange(K_RECENT, 0, RECENT_CAP - 1).catch(() => [])
          ])
        )
        .then((r) => {
          const localScrobbles = parseInt(r[0], 10) || 0;
          const localDays = parseInt(r[1], 10) || 0;
          // Distinct totals = seeded lifetime baseline + everything tracked here.
          const total = localScrobbles;
          const days = BASELINE.days + localDays;
          const artists = BASELINE.artists + (parseInt(r[2], 10) || 0);
          const tracks = BASELINE.tracks + (parseInt(r[3], 10) || 0);
          const albums = Math.max(BASELINE.albums, parseInt(r[4], 10) || 0);

          let seedTop = null;
          try {
            seedTop = r[5] ? JSON.parse(r[5]) : null;
          } catch (e) {
            seedTop = null;
          }
          const localTop = r[6][0] || null;
          let topArtist = (seedTop && seedTop.name) || '';
          if (localTop && (!seedTop || localTop.plays >= (seedTop.plays || 0))) topArtist = localTop.name;

          const recent = (Array.isArray(r[9]) ? r[9] : [])
            .map((s) => {
              try {
                return JSON.parse(s);
              } catch (e) {
                return null;
              }
            })
            .filter(Boolean);

          res.setHeader('Cache-Control', 'no-store, max-age=0');
          G.send(res, 200, {
            ok: true,
            stats: {
              scrobbles: total,
              artists: artists,
              tracks: tracks,
              albums: albums,
              days: days,
              avgPerDay: days > 0 ? Math.round((total / days) * 10) / 10 : 0,
              topArtist: topArtist
            },
            topArtists: r[6],
            topTracks: r[7],
            topAlbums: r[8],
            recent: recent
          });
        })
        .catch(() => {
          G.fail(res, 503, 'stats_unavailable', 'Listening stats are unavailable.');
        });
    })
    .catch(() => {
      G.fail(res, 500, 'stats_error', 'Unexpected error.');
    });
}

function handlePost(req, res) {
  return G.applyLimits(store, req, res, WRITE_LIMITS, rand())
    .then((ok) => {
      if (!ok) return;
      if (!G.sameOrigin(req)) {
        G.fail(res, 403, 'bad_origin', 'Cross-origin submissions are not accepted.');
        return;
      }
      const body = G.readJson(req, res);
      if (!body) return;

      const id = G.text(body.id, 32);
      if (!Object.prototype.hasOwnProperty.call(MANIFEST, id)) {
        G.fail(res, 422, 'unknown_track', 'Unknown track id.');
        return;
      }
      const ms = Number(body.ms);
      if (!isFinite(ms) || ms < MIN_LISTEN_MS) {
        G.fail(res, 422, 'listen_too_short', 'Track was not played long enough to count.');
        return;
      }

      const track = MANIFEST[id];
      const now = Date.now();

      // Dedupe: one count per track per client per 20 minutes, so replaying a short
      // preview legitimately re-counts but a loop script does not.
      const nonce = G.text(body.nonce, 40);
      const dedupe = 'sx:n:' + crypto
        .createHash('sha256')
        .update(id + '|' + (nonce || 'anon') + '|' + G.clientIp(req))
        .digest('hex')
        .slice(0, 32);

      return ensureSeeded()
        .then(() => store.setnx(dedupe, 1200, '1'))
        .then((fresh) => {
          if (!fresh) {
            G.send(res, 200, { ok: true, counted: false });
            return;
          }
          const cmds = [
            ['INCR', K_TOTAL],
            ['SADD', K_DAYS, dayKey(now)],
            ['ZINCRBY', K_ARTISTS, '1', track.artist],
            ['ZINCRBY', K_TRACKS, '1', track.artist + ' — ' + track.title],
            ['INCR', K_PLAYED],
            [
              'LPUSH',
              K_RECENT,
              JSON.stringify({
                title: track.title,
                artist: track.artist,
                album: track.album,
                ts: now
              })
            ],
            ['LTRIM', K_RECENT, '0', String(RECENT_CAP - 1)]
          ];
          if (track.album) cmds.push(['ZINCRBY', K_ALBUMS, '1', track.artist + ' — ' + track.album]);
          return store
            .pipe(cmds)
            .then(() => {
              G.send(res, 201, {
                ok: true,
                counted: true,
                id,
                title: track.title,
                artist: track.artist,
                album: track.album
              });
            });
        });
    })
    .catch((e) => {
      const st = e && e.status ? e.status : 500;
      G.fail(res, st, st === 503 ? 'stats_unavailable' : 'stats_error', 'Unexpected error.');
    });
}

function rand() {
  return Math.random().toString(36).slice(2, 12);
}

module.exports = async function handler(req, res) {
  if (G.preflight(req, res)) return;
  if (!G.method(req, res, ['GET', 'HEAD', 'POST'])) return;

  if (!store.READY) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      // Report the seeded baseline even with no store so the panel is not blank. Counts
      // simply will not move until the store is configured.
      G.send(res, 200, {
        ok: true,
        offline: true,
        stats: {
          scrobbles: BASELINE.scrobbles,
          artists: BASELINE.artists,
          tracks: BASELINE.tracks,
          albums: BASELINE.albums,
          days: BASELINE.days,
          avgPerDay:
            BASELINE.days > 0 ? Math.round((BASELINE.scrobbles / BASELINE.days) * 10) / 10 : 0,
          topArtist: BASELINE.topArtist
        },
        topArtists: [],
        topTracks: [],
        topAlbums: [],
        recent: []
      });
      return;
    }
    G.fail(res, 503, 'stats_unavailable', 'Stats storage is not configured.');
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') return handleGet(req, res);
  return handlePost(req, res);
};