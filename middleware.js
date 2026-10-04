// Global request ceiling. Sits in front of the static tree, the API functions and any
// path that does not resolve, so nothing reaches the origin unmetered. The per-endpoint
// Redis limiter in api/_lib/guard.js is the tight, authoritative one; this is the cheap
// outer ring that also covers asset scraping and probe traffic.
//
// Edge instances are per-region and per-isolate, so the counters are deliberately
// generous: they exist to stop a single flood, not to meter a visitor.

const SLOTS = 20000;

const TIERS = [
  { max: 150, windowMs: 10000 },
  { max: 700, windowMs: 60000 },
  { max: 15000, windowMs: 3600000 }
];

const API_TIERS = [
  { max: 80, windowMs: 10000 },
  { max: 400, windowMs: 60000 },
  { max: 6000, windowMs: 3600000 }
];

const SKIP = /^(\/_vercel\/|\/_next\/|\/favicon\.ico$|\/__|\/\.well-known\/)/;
const buckets = new Map();

export const config = { matcher: '/:path*' };

function hdr(req, name) {
  const h = (req && req.headers) || null;
  if (!h) return '';
  if (typeof h.get === 'function') return String(h.get(name) || '');
  const v = h[name] !== undefined ? h[name] : h[name.toLowerCase()];
  return String(v === undefined || v === null ? '' : v);
}

// request.headers is a Headers instance, not a plain object. Property access on it
// returns undefined, which silently collapses every visitor into one shared bucket.
function ip(req) {
  const raw =
    hdr(req, 'x-vercel-forwarded-for') ||
    hdr(req, 'cf-connecting-ip') ||
    hdr(req, 'x-forwarded-for') ||
    hdr(req, 'x-real-ip');
  const first = String(raw).split(',')[0].trim();
  return /^[0-9a-f:.]{3,45}$/i.test(first) ? first : 'anon';
}

function prune(now) {
  if (buckets.size < SLOTS) return;
  for (const [k, e] of buckets) if (now >= e.reset) buckets.delete(k);
  if (buckets.size >= SLOTS) buckets.clear();
}

function hit(key, max, windowMs, now) {
  const slot = Math.floor(now / windowMs);
  const k = key + ':' + slot;
  let e = buckets.get(k);
  if (!e) {
    prune(now);
    e = { n: 0, reset: (slot + 1) * windowMs };
    buckets.set(k, e);
  }
  e.n++;
  if (e.n > max) return Math.max(1, Math.ceil((e.reset - now) / 1000));
  return 0;
}

function blocked(retry, isApi) {
  const body = isApi
    ? JSON.stringify({ ok: false, error: 'rate_limited', detail: 'Too many requests. Try again in ' + retry + 's.' })
    : 'Too many requests. Try again in ' + retry + 's.';
  return new Response(body, {
    status: 429,
    headers: {
      'Content-Type': isApi ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'Retry-After': String(retry),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    }
  });
}

export default async function middleware(req) {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    if (SKIP.test(path)) return undefined;
    if ((req.method || 'GET') === 'OPTIONS') return undefined;

    const now = Date.now();
    const isApi = path === '/api' || path.indexOf('/api/') === 0;
    const tiers = isApi ? API_TIERS : TIERS;
    const key = (isApi ? 'a:' : 's:') + ip(req);

    for (let i = 0; i < tiers.length; i++) {
      const retry = hit(key, tiers[i].max, tiers[i].windowMs, now);
      if (retry > 0) return blocked(retry, isApi);
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}