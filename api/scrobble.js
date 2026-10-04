// PREREQ: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Tracks listens to the five Music Vault previews. Identity is resolved from a
// server-side manifest, never from the request body, so this cannot be used to
// inflate counters with invented tracks, artists or albums.

const crypto = require('crypto');
const store = require('./_lib/store');
const G = require('./_lib/guard');

const MANIFEST = {
  bounce_out: { title: 'Bounce Out x Limerence', artist: 'Limerence, Yves Tumor' },
  dream: { title: 'Dream', artist: 'knive ♱' },
  transgender: { title: 'Transgender', artist: 'Crystal Castles' },
  star_shopping: { title: 'Star Shopping', artist: 'Lil Peep' },
  goth: { title: 'Goth', artist: 'Sidewalks and Skeletons' }
};

const MIN_LISTEN_MS = 5000;
const WRITE_LIMITS = [
  { scope: 'sc:burst', max: 20, windowMs: 60000 },
  { scope: 'sc:hour', max: 60, windowMs: 3600000 }
];
const READ_LIMITS = [{ scope: 'sc:read', max: 90, windowMs: 60000 }];

const K_TOTAL = 'sc:total';
const K_DAYS = 'sc:days';
const K_ARTISTS = 'sc:artists';
const K_TRACKS = 'sc:tracks';

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

function zsetStats(zset, keyName) {
  return store
    .zrevrange(zset, 0, 4)
    .then(pairsWithScores)
    .then((rows) =>
      rows.map((r) => {
        const o = { plays: r.plays, name: r.name };
        if (keyName) o[keyName] = r.name;
        return o;
      })
    )
    .catch(() => []);
}

function handleGet(req, res) {
  return G.applyLimits(store, req, res, READ_LIMITS, rand())
    .then((ok) => {
      if (!ok) return;
      return Promise.all([
        store.get(K_TOTAL).catch(() => '0'),
        store.scard(K_DAYS).catch(() => 0),
        store.zcard(K_ARTISTS).catch(() => 0),
        store.zcard(K_TRACKS).catch(() => 0),
        zsetStats(K_ARTISTS, 'artist'),
        zsetStats(K_TRACKS, 'track')
      ])
        .then((r) => {
          const total = parseInt(r[0], 10) || 0;
          const days = parseInt(r[1], 10) || 0;
          // Distinct totals come from the cardinality of the sorted sets, not from the
          // length of the top-N slice -- otherwise this caps out at 5.
          const artistCount = parseInt(r[2], 10) || 0;
          const trackCount = parseInt(r[3], 10) || 0;
          const topArtists = r[4];
          const topTracks = r[5];
          const byDay = days > 0 ? Math.round((total / days) * 10) / 10 : 0;
          res.setHeader('Cache-Control', 'no-store, max-age=0');
          G.send(res, 200, {
            ok: true,
            source: 'vault',
            stats: {
              scrobbles: total,
              artists: artistCount,
              tracks: trackCount,
              days: days,
              avgPerDay: byDay,
              topArtist: topArtists[0] ? topArtists[0].artist : ''
            },
            topArtists: topArtists,
            topTracks: topTracks,
            recent: []
          });
        })
        .catch(() => {
          G.fail(res, 503, 'scrobble_unavailable', 'Stats storage is unavailable.');
        });
    })
    .catch(() => {
      G.fail(res, 500, 'scrobble_error', 'Unexpected error.');
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

      // Dedupe: one count per track per client per 20 minutes. Replaying a 2-minute
      // preview legitimately re-counts, but a loop script must not.
      const nonce = G.text(body.nonce, 40);
      const dedupe = 'sc:n:' + crypto
        .createHash('sha256')
        .update(id + '|' + (nonce || 'anon') + '|' + G.clientIp(req))
        .digest('hex')
        .slice(0, 32);

      return store.setnx(dedupe, 1200, '1').then((fresh) => {
        if (!fresh) {
          G.send(res, 200, { ok: true, counted: false });
          return;
        }
        return store
          .pipe([
            ['INCR', K_TOTAL],
            ['SADD', K_DAYS, dayKey(now)],
            ['ZINCRBY', K_ARTISTS, '1', track.artist],
            ['ZINCRBY', K_TRACKS, '1', track.artist + ' — ' + track.title]
          ])
          .then(() => {
            G.send(res, 201, { ok: true, counted: true, id, title: track.title, artist: track.artist });
          });
      });
    })
    .catch((e) => {
      const st = e && e.status ? e.status : 500;
      G.fail(res, st, st === 503 ? 'scrobble_unavailable' : 'scrobble_error', 'Unexpected error.');
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
      G.send(res, 200, {
        ok: true,
        source: 'vault',
        stats: { scrobbles: 0, artists: 0, tracks: 0, days: 0, avgPerDay: 0, topArtist: '' },
        topArtists: [],
        topTracks: [],
        recent: []
      });
      return;
    }
    G.fail(res, 503, 'scrobble_unavailable', 'Stats storage is not configured.');
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') return handleGet(req, res);
  return handlePost(req, res);
};