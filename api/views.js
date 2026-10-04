// View counter. Counts unique visits in Redis when UPSTASH_REDIS_REST_URL/TOKEN are
// present, otherwise falls back to the public dwyl counter offset by a static floor.
// Visit-level dedupe rides on the client-supplied visitId so a reload refreshes the
// number but a refresh loop cannot inflate it.

const crypto = require('crypto');
const store = require('./_lib/store');
const G = require('./_lib/guard');

const BASE_COUNT = 1452;
const DWYL = 'https://hits.dwyl.com/sativac/sativa.json';
const DWYL_TIMEOUT_MS = 4000;
const VISIT_TTL = 1800;
const K_TOTAL = 'views:total';
const K_SEEN = 'views:seen:';

const PING_LIMITS = [
  { scope: 'vw:burst', max: 4, windowMs: 30000 },
  { scope: 'vw:min', max: 30, windowMs: 60000 }
];
const READ_LIMITS = [{ scope: 'vw:read', max: 120, windowMs: 60000 }];

async function dwyl() {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), DWYL_TIMEOUT_MS);
  try {
    const r = await fetch(DWYL, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; sativa.cfd/1.0)' },
      signal: ctl.signal
    });
    if (!r.ok) return 0;
    const j = await r.json();
    return Math.max(0, parseInt(j && j.hits, 10) || 0);
  } catch (e) {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

async function total() {
  const raw = await store.get(K_TOTAL).catch(() => null);
  const n = parseInt(raw, 10);
  return isFinite(n) && n > 0 ? n : BASE_COUNT;
}

async function bump(visitId) {
  // A 30-minute window means a genuine return visit still counts, but a refresh loop
  // inside the same window does not.
  const key = K_SEEN + (visitId || 'anon').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  const fresh = await store.setnx(key, VISIT_TTL, '1').catch(() => true);
  if (!fresh) return total();
  // WHY: the stored counter must start at the floor, otherwise the persisted value and
  // the reported value diverge (stored 1, reported 1453) and the next read regresses.
  await store.setnx(K_TOTAL, 0, String(BASE_COUNT)).catch(() => {});
  const n = await store.incr(K_TOTAL).catch(() => null);
  const parsed = parseInt(n, 10);
  if (!isFinite(parsed)) return BASE_COUNT;
  return parsed > BASE_COUNT ? parsed : BASE_COUNT;
}

async function handleRead(req, res) {
  const ok = await G.applyLimits(store, req, res, READ_LIMITS, crypto.randomUUID());
  if (!ok) return;
  const n = store.READY ? await total() : BASE_COUNT + (await dwyl());
  G.send(res, 200, { ok: true, count: n });
}

async function handlePing(req, res) {
  const ok = await G.applyLimits(store, req, res, PING_LIMITS, crypto.randomUUID());
  if (!ok) return;
  if (!G.sameOrigin(req)) {
    G.fail(res, 403, 'bad_origin', 'Cross-origin pings are not accepted.');
    return;
  }
  const body = G.readJson(req, res);
  if (!body) return;

  const visitId = G.text(body.visitId, 64);

  if (store.READY) {
    const n = await bump(visitId);
    G.send(res, 200, { ok: true, count: n });
    return;
  }
  const hits = await dwyl();
  G.send(res, 200, { ok: true, count: BASE_COUNT + hits + 1 });
}

module.exports = async function handler(req, res) {
  if (G.preflight(req, res)) return;
  if (!G.method(req, res, ['GET', 'HEAD', 'POST'])) return;
  try {
    if (req.method === 'GET' || req.method === 'HEAD') return await handleRead(req, res);
    return await handlePing(req, res);
  } catch (e) {
    G.fail(res, 500, 'views_error', 'Unexpected error.');
  }
};