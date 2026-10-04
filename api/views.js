module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BASE_COUNT = 1452;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const upstream = await fetch('https://hits.dwyl.com/sativac/sativa.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (upstream.ok) {
      const data = await upstream.json();
      const hits = parseInt(data.message, 10);
      if (!isNaN(hits)) {
        const count = BASE_COUNT + hits;
        return res.status(200).json({ count, raw: hits });
      }
    }
  } catch (err) {}

  return res.status(200).json({ count: BASE_COUNT + 1 });
};
