
const crypto = require('crypto');
const store = require('./_lib/store');
const G = require('./_lib/guard');

const NOTES_KEY = 'gb:notes';
const COUNT_KEY = 'gb:count';
const SEED_KEY = 'gb:seeded';
const LIST_CAP = 500;
const PAGE_MAX = 100;
const NAME_MIN = 2;
const NAME_MAX = 32;
const MSG_MIN = 4;
const MSG_MAX = 500;
const DWELL_MS = 2500;
const URL_CAP = 2;
const DEDUPE_TTL = 86400;

const READ_LIMITS = [{ scope: 'gb:read', max: 90, windowMs: 60000 }];

const WRITE_LIMITS = [
  { scope: 'gb:burst', max: 1, windowMs: 15000 },
  { scope: 'gb:hour', max: 4, windowMs: 3600000 },
  { scope: 'gb:day', max: 12, windowMs: 86400000 }
];

const SEED = [
  { n: 'Kovak', m: 'Sick redesign! The music vault & gaming hub are clean af.', t: 1759500000000 },
  { n: 'vivid_ghost', m: 'Love the Toronto weather widget and the neon aesthetic.', t: 1759410000000 },
  { n: 'cipher_9', m: 'lanyard discord presence synced instant, nice work', t: 1759320000000 },
  { n: 'blaze', m: 'sealanterns12 gang, added u', t: 1759230000000 }
];

function id() {
  return crypto.randomBytes(9).toString('base64url');
}

function parseNotes(raw) {
  const out = [];
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i];
    if (typeof s !== 'string') continue;
    let v;
    try {
      v = JSON.parse(s);
    } catch (e) {
      continue;
    }
    if (!v || typeof v !== 'object') continue;
    out.push({
      id: G.text(v.id, 32) || id(),
      n: G.text(v.n, NAME_MAX),
      m: G.text(v.m, MSG_MAX),
      t: Number(v.t) > 0 ? Number(v.t) : Date.now()
    });
  }
  return out;
}

function seedOnce() {
  return store
    .setnx(SEED_KEY, 60 * 60 * 24 * 365, '1')
    .then((won) => {
      if (!won) return null;
      const now = Date.now();
      const cmds = SEED.map((s, i) => ['LPUSH', NOTES_KEY, JSON.stringify({ id: id() + i, n: s.n, m: s.m, t: s.t || now })]);
      cmds.push(['LTRIM', NOTES_KEY, '0', String(LIST_CAP - 1)]);
      cmds.push(['SET', COUNT_KEY, String(SEED.length)]);
      return store
        .pipe(cmds)
        .then(() => true)
        .catch(() => false);
    })
    .catch(() => null);
}

function handleGet(req, res) {
  return G.applyLimits(store, req, res, READ_LIMITS, id())
    .then((ok) => {
      if (!ok) return;
      const want = Math.min(
        PAGE_MAX,
        Math.max(1, parseInt((req.query && req.query.limit) || '60', 10) || 60)
      );
      return seedOnce()
        .then(() => Promise.all([store.lrange(NOTES_KEY, 0, want - 1), store.get(COUNT_KEY)]))
        .then((r) => {
          const notes = parseNotes(r[0]);
          const total = Math.max(Number(r[1]) || 0, notes.length);
          res.setHeader('Cache-Control', 'no-store, max-age=0');
          G.send(res, 200, {
            ok: true,
            total,
            count: notes.length,
            notes,
            limit: want,
            turnstile: { mode: G.turnstileMode(), siteKey: G.turnstileSiteKey() }
          });
        })
        .catch(() => {
          G.fail(res, 503, 'guestbook_unavailable', 'Guestbook storage is unavailable.');
        });
    })
    .catch(() => {
      G.fail(res, 500, 'guestbook_error', 'Unexpected error.');
    });
}

function handlePost(req, res) {
  const ident = id();
  return G.applyLimits(store, req, res, WRITE_LIMITS, ident)
    .then((ok) => {
      if (!ok) return;
      if (!G.sameOrigin(req)) {
        G.fail(res, 403, 'bad_origin', 'Cross-origin submissions are not accepted.');
        return;
      }

      const body = G.readJson(req, res);
      if (!body) return;

      if (G.text(body.website, 64) !== '') {
        G.fail(res, 400, 'rejected', 'Submission rejected.');
        return;
      }

      const dwell = Number(body.renderedAt);
      if (!isFinite(dwell) || Date.now() - dwell < DWELL_MS) {
        G.fail(res, 400, 'too_fast', 'Take a moment before submitting.');
        return;
      }

      const name = G.text(body.name, NAME_MAX);
      const msg = G.text(body.message, MSG_MAX);
      if (name.length < NAME_MIN) {
        G.fail(res, 422, 'bad_name', 'Name must be at least ' + NAME_MIN + ' characters.');
        return;
      }
      if (msg.length < MSG_MIN) {
        G.fail(res, 422, 'bad_message', 'Message must be at least ' + MSG_MIN + ' characters.');
        return;
      }
      if ((msg.match(/https?:\/\//gi) || []).length > URL_CAP) {
        G.fail(res, 422, 'bad_message', 'Too many links in the message.');
        return;
      }

      return G.verifyTurnstile(body.turnstileToken, G.clientIp(req)).then((v) => {
        if (!v.success) {
          G.fail(res, 403, 'turnstile_failed', 'Human verification failed. Try again.');
          return;
        }

        const entry = { id: ident, n: name, m: msg, t: Date.now() };
        const dedupeKey = 'gb:d:' + crypto
          .createHash('sha256')
          .update(name.toLowerCase() + '\u0000' + msg.toLowerCase())
          .digest('hex')
          .slice(0, 32);

        return store.setnx(dedupeKey, DEDUPE_TTL, '1').then((fresh) => {
          if (!fresh) {
            G.fail(res, 409, 'duplicate', 'You already signed with this exact message.');
            return;
          }
          return store
            .pipe([
              ['LPUSH', NOTES_KEY, JSON.stringify(entry)],
              ['LTRIM', NOTES_KEY, '0', String(LIST_CAP - 1)],
              ['INCR', COUNT_KEY]
            ])
            .then(() => {
              res.setHeader('Cache-Control', 'no-store, max-age=0');
              G.send(res, 201, { ok: true, total: null, note: entry });
            });
        });
      });
    })
    .catch((e) => {
      const st = e && e.status ? e.status : 500;
      G.fail(
        res,
        st,
        st === 503 ? 'guestbook_unavailable' : 'guestbook_error',
        st === 503 ? 'Guestbook storage is unavailable. Try again later.' : 'Unexpected error.'
      );
    });
}

module.exports = async function handler(req, res) {
  if (G.preflight(req, res)) return;
  if (!G.method(req, res, ['GET', 'HEAD', 'POST'])) return;

  if (!store.READY) {
    G.fail(res, 503, 'guestbook_unavailable', 'Guestbook storage is not configured.');
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') return handleGet(req, res);
  return handlePost(req, res);
};
