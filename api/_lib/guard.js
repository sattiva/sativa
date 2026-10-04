
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '';
const TURNSTILE_SITE = process.env.TURNSTILE_SITE_KEY || '';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_TIMEOUT_MS = 5000;

const MAX_BODY_BYTES = 4096;
const VERIFY_TIMEOUT_MS = 5000;

function turnstileMode() {
  return TURNSTILE_SECRET.length > 20 ? 'enforce' : 'honeypot';
}

function turnstileSiteKey() {
  return TURNSTILE_SITE.length > 5 ? TURNSTILE_SITE : '';
}

function clientIp(req) {
  const h = req.headers || {};
  const v =
    h['x-vercel-forwarded-for'] ||
    h['x-forwarded-for'] ||
    h['cf-connecting-ip'] ||
    h['x-real-ip'] ||
    '';
  const first = String(v).split(',')[0].trim();
  return /^[0-9a-f:.]{3,45}$/i.test(first) ? first : 'anon';
}

function send(res, status, payload, extraHeaders) {
  const body = JSON.stringify(payload);
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (extraHeaders) {
    for (const k in extraHeaders) res.setHeader(k, extraHeaders[k]);
  }
  res.end(body);
}

function fail(res, status, code, detail, extraHeaders) {
  send(res, status, { ok: false, error: code, detail: detail || '' }, extraHeaders);
}

function preflight(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function method(req, res, allowed) {
  if (allowed.indexOf(req.method) !== -1) return true;
  res.setHeader('Allow', allowed.join(', '));
  fail(res, 405, 'method_not_allowed', 'Allowed: ' + allowed.join(', '));
  return false;
}

function readJson(req, res) {
  const len = parseInt((req.headers || {})['content-length'] || '0', 10);
  if (len > MAX_BODY_BYTES) {
    fail(res, 413, 'payload_too_large', 'Body exceeds ' + MAX_BODY_BYTES + ' bytes.');
    return null;
  }
  const b = req.body;
  if (b === undefined || b === null || b === '') {
    fail(res, 400, 'empty_body', 'Expected a JSON object.');
    return null;
  }
  if (typeof b === 'string') {
    if (b.length > MAX_BODY_BYTES) {
      fail(res, 413, 'payload_too_large', 'Body exceeds ' + MAX_BODY_BYTES + ' bytes.');
      return null;
    }
    try {
      b = JSON.parse(b);
    } catch (e) {
      fail(res, 400, 'malformed_json', 'Body is not valid JSON.');
      return null;
    }
  }
  if (typeof b !== 'object' || Array.isArray(b)) {
    fail(res, 400, 'malformed_json', 'Expected a JSON object.');
    return null;
  }
  if (JSON.stringify(b).length > MAX_BODY_BYTES) {
    fail(res, 413, 'payload_too_large', 'Body exceeds ' + MAX_BODY_BYTES + ' bytes.');
    return null;
  }
  return b;
}

const CTRL = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u206F\uFEFF]/g;

function text(v, max) {
  if (typeof v !== 'string') return '';
  let s = v.replace(CTRL, ' ').replace(/\s+/g, ' ').trim();
  if (s.length > max) s = s.slice(0, max).trim();
  return s;
}

function sameOrigin(req) {
  const h = req.headers || {};
  const origin = h.origin || h.referer || '';
  if (!origin) return true; // same-origin form posts and native navigations send neither
  try {
    return new URL(origin).host === (h.host || '');
  } catch (e) {
    return false;
  }
}

function verifyTurnstile(token, ip) {
  if (turnstileMode() !== 'enforce') return Promise.resolve({ success: true, skipped: true });
  if (typeof token !== 'string' || token.length < 10 || token.length > 4096) {
    return Promise.resolve({ success: false, codes: ['missing-input-response'] });
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TURNSTILE_TIMEOUT_MS);
  const fd = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token });
  if (ip && ip !== 'anon') fd.set('remoteip', ip);
  return fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: fd.toString(),
    signal: ctl.signal
  })
    .then((r) => (r.ok ? r.json() : { success: false, codes: ['http_' + r.status] }))
    .then((j) => ({ success: !!(j && j.success), codes: (j && j['error-codes']) || [] }))
    .catch((e) => ({
      success: false,
      codes: [e && e.name === 'AbortError' ? 'timeout' : 'verify_unreachable']
    }))
    .then((v) => {
      clearTimeout(timer);
      return v;
    });
}

function applyLimits(store, req, res, limits, ident) {
  const ip = clientIp(req);
  return limits.reduce((chain, l) => {
    return chain.then((acc) => {
      if (!acc.ok) return acc;
      return store.rateLimit(l.scope + ':' + ip, l.max, l.windowMs, ident).then((rl) => {
        if (rl.error) {
          acc.broken = rl.error;
          acc.ok = false;
        } else if (!rl.ok) {
          acc.ok = false;
          acc.retryAfterMs = rl.retryAfterMs;
        }
        return acc;
      });
    });
  }, Promise.resolve({ ok: true, retryAfterMs: 0, broken: '' })).then((acc) => {
    if (acc.ok) return true;
    if (acc.broken) {
      fail(res, 503, 'limiter_unavailable', 'Request throttling is temporarily unavailable.');
      return false;
    }
    const retry = Math.max(1, Math.ceil((acc.retryAfterMs || 1000) / 1000));
    fail(res, 429, 'rate_limited', 'Too many requests. Try again in ' + retry + 's.', {
      'Retry-After': String(retry)
    });
    return false;
  });
}

module.exports = {
  MAX_BODY_BYTES,
  turnstileMode,
  turnstileSiteKey,
  clientIp,
  send,
  fail,
  preflight,
  method,
  readJson,
  text,
  sameOrigin,
  verifyTurnstile,
  applyLimits
};
