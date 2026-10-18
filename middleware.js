const RIP_UA = /wget|curl|httrack|webcopier|webzip|offline.?explorer|python-requests|python-urllib|libwww|scrapy|node-fetch|axios\/|go-http-client|java\/|gptbot|ccbot|claudebot|bytespider|google-extended|commoncrawl|semrush|ahrefs|dotscraper|petalbot|mj12bot/i;

const FAKE_EXT = {
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  html: 'text/html',
  default: 'application/octet-stream'
};

function junkChunk(size) {
  const a = new Uint8Array(size);
  const seed = (Math.random() * 0xffffffff) >>> 0;
  let s = seed || 1;
  for (let i = 0; i < size; i++) {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    a[i] = s & 0xff;
  }
  return a;
}

function dripStream(totalBytes) {
  let sent = 0;
  return new ReadableStream({
    async pull(controller) {
      if (sent >= totalBytes) {
        controller.close();
        return;
      }
      const n = Math.min(1 << 14, totalBytes - sent);
      sent += n;
      controller.enqueue(junkChunk(n));
      await new Promise((r) => setTimeout(r, 45 + Math.random() * 80));
    }
  });
}

function hexName(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += '0123456789abcdef'[(Math.random() * 16) | 0];
  return s;
}

function fakeName(path) {
  const m = /\.([a-z0-9]{2,4})$/i.exec(path);
  const ext = (m && FAKE_EXT[m[1].toLowerCase()] ? m[1].toLowerCase() : hexName(3))
    .toLowerCase();
  const t = FAKE_EXT[ext] ? ext : 'default';
  return { type: FAKE_EXT[t], ext, ct: FAKE_EXT[ext === 'default' ? 'default' : ext] || FAKE_EXT.default };
}

export default async function middleware(req) {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;

  const ua = req.headers.get('user-agent') || '';
  if (!RIP_UA.test(ua)) return;

  const fake = fakeName(url.pathname);
  const size = 3 << 20;
  const name = hexName(8) + '.' + (fake.ext === 'default' ? 'bin' : fake.ext);

  return new Response(dripStream(size), {
    status: 200,
    headers: {
      'content-type': fake.ct,
      'content-disposition': 'attachment; filename="sativa_' + name + '"',
      'cache-control': 'no-store',
      'x-tarpit': '1'
    }
  });
}

export const config = { runtime: 'edge', regions: ['fra1', 'iad1'] };
