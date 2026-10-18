const crypto = require('crypto');

const MAX_MS = 240000;
const CHUNK = 1 << 14;
const NAMES = [
  'sativa_dump',
  'sativa_backup',
  'sativa_src',
  'sativa_keys',
  'sativa_archive',
  'sativa_database',
  'sativa_full',
  'sativa_mirror'
];
const EXT = ['bin', 'sql', 'zip', 'dat', 'enc', 'bak'];

function junk(n) {
  return crypto.randomBytes(n);
}

function name() {
  const n = NAMES[(Math.random() * NAMES.length) | 0];
  const e = EXT[(Math.random() * EXT.length) | 0];
  return n + '_' + crypto.randomBytes(6).toString('hex') + '.' + e;
}

module.exports = async (req, res) => {
  const start = Date.now();
  let sent = 0;
  res.setHeader('content-type', 'application/octet-stream');
  res.setHeader('content-disposition', 'attachment; filename="' + name() + '"');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-tarpit', '1');

  const pump = () => {
    if (res.destroyed || Date.now() - start > MAX_MS) {
      res.end();
      return;
    }
    sent += CHUNK;
    res.write(junk(CHUNK));
    if (sent % (CHUNK << 2) === 0) {
      setTimeout(pump, 60 + Math.floor(Math.random() * 90));
    } else {
      setImmediate(pump);
    }
  };

  req.on('close', () => res.destroy());
  res.on('close', () => res.destroy());
  pump();
};

module.exports.maxDuration = 300;
