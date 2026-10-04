import { $, S, SI, VB, FB, C, CK_P, esc, safeUrl, cSet } from './config.js';
import { applySp, clearNow } from './lyrics.js';
import { scMax } from './navigation.js';

export function resolveAsset(a, img) {
  const urls = [];
  img = String(img || '').trim();
  if (!a || !img) return urls;
  if (/^https?:\/\//i.test(img)) { urls.push(img); return urls; }
  if (img.indexOf('//') === 0) { urls.push('https:' + img); return urls; }
  if (img.indexOf('mp:') === 0) {
    const r = img.slice(3);
    urls.push('https://media.discordapp.net/' + r);
    if (r.indexOf('external/') !== 0 && r.indexOf('attachments/') !== 0) {
      urls.push('https://media.discordapp.net/external/' + r);
    }
    return urls;
  }
  if (img.indexOf('spotify:') === 0) {
    urls.push('https://i.scdn.co/image/' + img.slice(8));
    return urls;
  }
  if (a.application_id) {
    const base = 'https://cdn.discordapp.com/app-assets/' + a.application_id + '/' + img;
    if (/\.(png|gif|webp|jpe?g)$/i.test(img)) urls.push(base);
    else {
      urls.push(base + (img.indexOf('a_') === 0 ? '.gif' : '.png'));
      urls.push(base + '.gif');
      urls.push(base);
    }
  }
  return urls;
}

export function getImgs(a) {
  const o = [];
  if (!a || !a.assets) return o;
  ['large_image', 'small_image'].forEach(k => {
    resolveAsset(a, a.assets[k]).forEach(u => {
      if (!o.includes(u)) o.push(u);
    });
  });
  return o;
}

export function getPrimary(as) {
  if (!Array.isArray(as)) return null;
  let fb = null;
  for (let i = 0; i < as.length; i++) {
    const a = as[i];
    if (!a || a.type === 2 || a.type === 4) continue;
    if (a.assets && (a.assets.large_image || a.assets.small_image)) return a;
    if (!fb) fb = a;
  }
  return fb;
}

export function getCustom(as) {
  if (!Array.isArray(as)) return null;
  for (let i = 0; i < as.length; i++) {
    if (as[i] && as[i].type === 4) return as[i];
  }
  return null;
}

export function fmtEl(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h ? h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') : m + ':' + String(s).padStart(2, '0');
}

export function updActT() {
  if (S.actStart) {
    const el = $('activityTime');
    if (el) el.textContent = fmtEl(Date.now() - S.actStart);
  }
}

export function stopActT() {
  clearInterval(S.actTimer);
  S.actTimer = null;
  S.actStart = 0;
}

export function act(a) {
  const line = $('activityLine');
  const actArt = $('activityArt');
  if (!line) return;
  if (!a) {
    line.hidden = true;
    stopActT();
    S.actKey = '';
    return;
  }
  const st = a.timestamps ? a.timestamps.start : 0;
  const key = (a.application_id || a.name || '') + ':' + st;
  const changed = key !== S.actKey;
  S.actKey = key;
  const imgs = getImgs(a);
  if (actArt) {
    if (imgs.length) {
      if (actArt.dataset.primary !== imgs[0] || actArt.hidden) {
        actArt.dataset.primary = imgs[0];
        actArt.dataset.fallbacks = JSON.stringify(imgs.slice(1));
        actArt.hidden = false;
        actArt.src = imgs[0];
      }
    } else {
      actArt.dataset.primary = '';
      actArt.dataset.fallbacks = '[]';
      actArt.removeAttribute('src');
      actArt.hidden = true;
    }
  }
  const name = a.name || '';
  const det = a.details || '';
  const stat = a.state || '';
  let main = (VB[a.type] || 'Playing') + ' <b>' + esc(name) + '</b>';
  let by = '';
  if (det && det !== name) main += ' · ' + esc(det);
  if (stat) {
    if (stat.toLowerCase().indexOf('by ') === 0) {
      by = '<div class="activity-by">' + esc(stat.substring(3).replace(/[\u2705\u2611\uFE0F]/g, '').trim()) + ' <img src="https://cdn3.emoji.gg/emojis/663784-robloxverified.png" class="verified-icon" alt="verified" referrerpolicy="no-referrer"></div>';
    } else {
      main += ' · ' + esc(stat);
    }
  }
  const actText = $('activityText');
  if (actText) actText.innerHTML = '<div class="activity-main">' + main + '</div>' + by;
  const meta = $('activityMeta');
  if (st && meta) {
    meta.hidden = false;
    if (changed || !S.actTimer) {
      S.actStart = st;
      updActT();
      clearInterval(S.actTimer);
      S.actTimer = setInterval(updActT, 1000);
    }
  } else if (meta) {
    meta.hidden = true;
    stopActT();
  }
  line.hidden = false;
  line.classList.add('in');
  setTimeout(scMax, 50);
}

export function custom(s) {
  const c = $('customStatusContainer');
  const e = $('customStatusEmoji');
  if (!c || !e) return;
  if (!s || (!s.state && !s.emoji)) {
    c.hidden = true;
    return;
  }
  if (s.emoji && s.emoji.id) {
    e.src = 'https://cdn.discordapp.com/emojis/' + encodeURIComponent(s.emoji.id) + (s.emoji.animated ? '.gif' : '.png');
    e.hidden = false;
  } else if (s.emoji && s.emoji.name) {
    e.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><text x="0" y="13" font-size="13">' + esc(s.emoji.name) + '</text></svg>');
    e.hidden = false;
  } else {
    e.removeAttribute('src');
    e.hidden = true;
  }
  const statText = $('customStatusText');
  if (statText) statText.textContent = s.state || '';
  c.hidden = false;
  c.classList.add('in');
  setTimeout(scMax, 50);
}

function setAll(sel, fn) {
  const nodes = document.querySelectorAll(sel);
  for (let i = 0; i < nodes.length; i++) fn(nodes[i]);
}

export function presence(p) {
  const u = p.discord_user;
  if (u) {
    const avUrl = u.avatar ? 'https://cdn.discordapp.com/avatars/' + encodeURIComponent(u.id) + '/' + encodeURIComponent(u.avatar) + (u.avatar.indexOf('a_') === 0 ? '.gif' : '.png') + '?size=512' : FB;
    const name = u.global_name || u.display_name || 'Sativa';
    const handle = '@' + u.username;
    setAll('.js-avatar', (n) => {
      n.src = avUrl;
    });
    setAll('.js-name', (n) => {
      n.textContent = name;
    });
    setAll('.js-handle', (n) => {
      n.textContent = handle;
    });
  }
  const status = SI[p.discord_status] || SI.offline;
  setAll('.js-status', (n) => {
    n.innerHTML = status;
  });
  const ld = $('linkDiscord');
  if (ld) ld.textContent = '@' + (u && u.username ? u.username : 'zgwf') + (p.discord_status && p.discord_status !== 'offline' ? ' · ' + p.discord_status : '');
  act(getPrimary(p.activities));
  custom(getCustom(p.activities));

  let sp = null;
  if (p.listening_to_spotify && p.spotify) {
    sp = p.spotify;
  } else if (Array.isArray(p.activities)) {
    for (let i = 0; i < p.activities.length; i++) {
      const a = p.activities[i];
      if (a && (a.type === 2 || a.name === 'Spotify' || a.name === 'Apple Music' || a.name === 'YouTube Music')) {
        const song = a.details || a.name || '';
        const artist = a.state ? a.state.replace(/^by\s+/i, '') : '';
        let artUrl = '';
        const imgs = getImgs(a);
        if (imgs.length) artUrl = imgs[0];
        sp = { song, artist, album: a.assets ? a.assets.large_text : '', album_art_url: artUrl, timestamps: a.timestamps };
        break;
      }
    }
  }

  if (sp && (sp.song || sp.artist)) {
    applySp(sp);
  } else {
    if (S.sp) clearNow();
  }

  const hp = $('homePresence');
  const hpt = $('homePresenceText');
  const hpe = $('homePresenceEmoji');
  const cs = getCustom(p.activities);
  if (hp && hpt) {
    if (cs && (cs.state || cs.emoji)) {
      hp.hidden = false;
      hpt.textContent = cs.state || '';
      if (hpe) {
        if (cs.emoji && cs.emoji.id) {
          hpe.src = 'https://cdn.discordapp.com/emojis/' + encodeURIComponent(cs.emoji.id) + (cs.emoji.animated ? '.gif' : '.png');
          hpe.hidden = false;
        } else if (cs.emoji && cs.emoji.name) {
          hpe.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><text x="0" y="13" font-size="13">' + esc(cs.emoji.name) + '</text></svg>');
          hpe.hidden = false;
        } else {
          hpe.hidden = true;
        }
      }
    } else {
      hp.hidden = true;
    }
  }

  cSet(CK_P, p);
  setTimeout(scMax, 100);
}

export function pollLanyard() {
  fetch('https://api.lanyard.rest/v1/users/' + C.id, { cache: 'no-store', referrerPolicy: 'no-referrer' })
    .then(r => r.ok ? r.json() : null)
    .then(res => {
      if (res && res.success && res.data) presence(res.data);
    })
    .catch(() => {});
}

export function connect() {
  pollLanyard();
  if (!S.apiTimer) S.apiTimer = setInterval(pollLanyard, 3000);

  let ws;
  try {
    ws = new WebSocket('wss://api.lanyard.rest/socket');
  } catch (e) {
    return;
  }
  S.sock = ws;
  ws.onopen = () => {};
  ws.onmessage = (ev) => {
    let p;
    try { p = JSON.parse(ev.data); } catch (e) { return; }
    if (p.op === 1) {
      try { ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: C.id } })); } catch (e) {}
      clearInterval(S.hb);
      S.hb = setInterval(() => {
        if (ws.readyState === 1) ws.send(JSON.stringify({ op: 3 }));
      }, (p.d && p.d.heartbeat_interval) || 30000);
    }
    if ((p.t === 'INIT_STATE' || p.t === 'PRESENCE_UPDATE') && p.d) presence(p.d);
  };
  ws.onclose = () => { clearInterval(S.hb); };
  ws.onerror = () => { try { ws.close(); } catch (e) {} };

  const actArt = $('activityArt');
  if (actArt) {
    actArt.addEventListener('error', function() {
      let l = [];
      try { l = JSON.parse(actArt.dataset.fallbacks || '[]'); } catch (e) {}
      if (l.length) {
        actArt.dataset.fallbacks = JSON.stringify(l.slice(1));
        actArt.src = l[0];
        return;
      }
      actArt.removeAttribute('src');
      actArt.hidden = true;
    });
  }
}
