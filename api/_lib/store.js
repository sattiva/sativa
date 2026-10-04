// PREREQ: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Upstash exposes a plain REST command endpoint, so the serverless path needs no SDK
// and no node_modules install. Single command -> POST url, body is a JSON arg array.

const BASE = process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

const TLS_READY = /^https:\/\//i.test(BASE) && TOKEN.length > 8;
// Loopback http is allowed so `vercel dev` and the integration test can point at a
// local Upstash emulator. Everything else must be https so the bearer token is never
// sent in the clear.
const LOCAL_READY = /^http:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?\/?$/i.test(BASE) && TOKEN.length > 8;
const READY = TLS_READY || LOCAL_READY;
const TIMEOUT_MS = 4000;

class StoreErr extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status || 503;
  }
}

async function cmd(parts) {
  if (!READY) throw new StoreErr('store_unconfigured');
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(BASE, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parts),
      signal: ctl.signal
    });
    if (!r.ok) throw new StoreErr('store_http_' + r.status);
    const j = await r.json();
    if (!j) throw new StoreErr('store_bad_response');
    if (j.error) throw new StoreErr('store_' + String(j.error).slice(0, 40));
    return j.result === undefined ? null : j.result;
  } catch (e) {
    if (e instanceof StoreErr) throw e;
    if (e && e.name === 'AbortError') throw new StoreErr('store_timeout', 504);
    throw new StoreErr('store_unreachable', 503);
  } finally {
    clearTimeout(timer);
  }
}

// Pipeline issues every command in one round trip and always resolves.
// Used where a partial failure should degrade rather than abort the whole request.
async function pipe(cmds) {
  if (!READY) throw new StoreErr('store_unconfigured');
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(BASE + '/pipeline', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cmds),
      signal: ctl.signal
    });
    if (!r.ok) throw new StoreErr('store_http_' + r.status);
    const j = await r.json();
    if (!Array.isArray(j)) throw new StoreErr('store_bad_response');
    return j.map((x) => (x && !x.error ? x.result : null));
  } catch (e) {
    if (e instanceof StoreErr) throw e;
    if (e && e.name === 'AbortError') throw new StoreErr('store_timeout', 504);
    throw new StoreErr('store_unreachable', 503);
  } finally {
    clearTimeout(timer);
  }
}

// WHY: prune + count + insert must be one indivisible step, otherwise N concurrent
// requests all read the pre-insert count and N of them slip past the ceiling.
const RL_SCRIPT = [
  "local k=KEYS[1]",
  "local now=tonumber(ARGV[1])",
  "local win=tonumber(ARGV[2])",
  "local lim=tonumber(ARGV[3])",
  "redis.call('ZREMRANGEBYSCORE',k,0,now-win)",
  "local n=redis.call('ZCARD',k)",
  "if n>=lim then",
  "  local o=redis.call('ZRANGE',k,0,0,'WITHSCORES')",
  "  local reset=win",
  "  if o[2] then reset=(tonumber(o[2])+win)-now end",
  "  if reset<0 then reset=0 end",
  "  return {0,n,reset}",
  "end",
  "redis.call('ZADD',k,now,ARGV[4])",
  "redis.call('PEXPIRE',k,win)",
  "return {1,n+1,0}"
].join('\n');

let rlSeq = 0;

// Sliding-window limiter. Returns { ok, count, remaining, retryAfterMs }.
// member must be unique per attempt or duplicate adds collapse into one entry.
function rateLimit(key, limit, windowMs, ident) {
  const now = Date.now();
  const member = now + '-' + (rlSeq++).toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  return cmd(['EVAL', RL_SCRIPT, '1', 'rl:' + key, String(now), String(windowMs), String(limit), member])
    .then((res) => {
      const ok = Number(res && res[0]) === 1;
      const count = Number(res && res[1]) || 0;
      return {
        ok,
        count,
        remaining: Math.max(0, limit - count),
        retryAfterMs: Number(res && res[2]) || 0
      };
    })
    .catch((e) => {
      // Fail closed: an unreachable limiter must not become an unlimited limiter.
      return { ok: false, count: limit, remaining: 0, retryAfterMs: windowMs, error: e && e.code };
    });
}

function get(key) {
  return cmd(['GET', key]);
}

function setex(key, ttl, value) {
  return cmd(['SET', key, value, 'EX', String(ttl)]);
}

// Returns true only for the caller that won the race. Used for dedupe and one-shot seeds.
function setnx(key, ttl, value) {
  if (!ttl) return cmd(['SET', key, value, 'NX']).then((r) => r === 'OK');
  return cmd(['SET', key, value, 'NX', 'EX', String(ttl)]).then((r) => r === 'OK');
}

function incr(key) {
  return cmd(['INCR', key]);
}

function lpush(key, value) {
  return cmd(['LPUSH', key, value]);
}

function ltrim(key, max) {
  return cmd(['LTRIM', key, '0', String(max - 1)]);
}

function lrange(key, start, stop) {
  return cmd(['LRANGE', key, String(start), String(stop)]);
}

function llen(key) {
  return cmd(['LLEN', key]);
}

function sadd(key, member) {
  return cmd(['SADD', key, member]);
}

function scard(key) {
  return cmd(['SCARD', key]);
}

function zincrby(key, delta, member) {
  return cmd(['ZINCRBY', key, String(delta), member]);
}

function zrevrange(key, start, stop) {
  return cmd(['ZREVRANGE', key, String(start), String(stop), 'WITHSCORES']);
}

function zcard(key) {
  return cmd(['ZCARD', key]);
}

module.exports = {
  READY,
  StoreErr,
  cmd,
  pipe,
  rateLimit,
  get,
  setex,
  setnx,
  incr,
  lpush,
  ltrim,
  lrange,
  llen,
  sadd,
  scard,
  zincrby,
  zrevrange,
  zcard
};