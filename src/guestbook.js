import { $, esc, toast, timeAgo } from './config.js';
import { scMax } from './navigation.js';
import { mountTurnstile, turnstileToken, resetTurnstile, turnstileActive } from './turnstile.js';

const API = '/api/guestbook';
const NAME_MAX = 32;
const TRACK_MAX = 80;
const ARTIST_MAX = 80;
const WHY_MAX = 140;
const REFRESH_MS = 90000;

export function initGuestbook() {
  const list = $('gbList');
  const form = $('gbForm');
  const nameInput = $('gbAuthor');
  const trackInput = $('gbTrack');
  const artistInput = $('gbArtist');
  const whyInput = $('gbWhy');
  const badge = $('gbCountBadge');
  const btn = $('gbSubmit');
  const tsMount = $('gbTurnstile');
  const trap = $('gbTrap');
  const hint = $('gbHint');
  const count = $('gbCount');
  const rate = $('gbRate');
  const fill = $('gbFill');

  if (!list || !form || !nameInput || !trackInput || !whyInput) return;

  if (nameInput) nameInput.maxLength = NAME_MAX;
  if (trackInput) trackInput.maxLength = TRACK_MAX;
  if (artistInput) artistInput.maxLength = ARTIST_MAX;
  if (whyInput) whyInput.maxLength = WHY_MAX;
  form.setAttribute('novalidate', '');

  let renderedAt = Date.now();
  let offline = false;
  let inFlight = false;
  let cooldownUntil = 0;
  let cooldownTimer = null;

  if (btn) btn.disabled = true;

  const BURST_SECONDS = 15;

  function paintCooldown() {
    const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    if (fill) fill.style.width = left > 0 ? Math.min(100, (left / BURST_SECONDS) * 100).toFixed(0) + '%' : '0%';
    if (rate) {
      rate.classList.toggle('hot', left > 0);
      rate.textContent = left > 0 ? 'ready in ' + left + 's' : '4 per hour';
    }
    if (btn && !offline && !inFlight) btn.disabled = left > 0;
    if (left > 0 && !cooldownTimer) {
      cooldownTimer = setInterval(paintCooldown, 250);
    } else if (left <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }

  function startCooldown(seconds) {
    cooldownUntil = Date.now() + Math.max(1, Math.round(seconds || BURST_SECONDS)) * 1000;
    paintCooldown();
  }

  function paintCount() {
    if (!count) return;
    const n = whyInput.value.length;
    count.textContent = n + '/' + WHY_MAX;
    count.classList.toggle('warn', n > WHY_MAX - 40);
  }

  if (whyInput) {
    whyInput.addEventListener('input', paintCount);
    paintCount();
  }
  paintCooldown();

  function setBusy(on) {
    inFlight = on;
    setLabel(on ? 'Sending' : 'Recommend');
    if (btn) btn.disabled = on || offline || cooldownUntil > Date.now();
  }

  function setLabel(text) {
    if (!btn) return;
    const bar = fill;
    if (bar) {
      while (btn.firstChild && btn.firstChild !== bar) btn.removeChild(btn.firstChild);
      btn.insertBefore(document.createTextNode(text), bar);
    } else {
      btn.textContent = text;
    }
  }

  function renderNotes(notes) {
    if (!list) return;
    if (!notes.length) {
      list.innerHTML = '<p class="empty">nothing recommended yet — drop the first track</p>';
      return;
    }
    list.innerHTML = notes
      .map(function (n) {
        const who = String(n.n || '').slice(0, NAME_MAX);
        const track = String(n.m || '').slice(0, TRACK_MAX);
        const artist = String(n.a || '').slice(0, ARTIST_MAX);
        const why = String(n.w || '').slice(0, WHY_MAX);
        if (!who || !track || !why) return '';
        return (
          '<article class="gb">' +
          '<div class="gb-head">' +
          '<span class="gb-name">' + esc(who) + '</span>' +
          '<time class="gb-time" datetime="' + esc(new Date(Number(n.t) || 0).toISOString()) + '">' +
          esc(timeAgo(n.t)) +
          '</time>' +
          '</div>' +
          '<p class="gb-track">' + esc(track) + (artist ? '<span class="gb-artist">' + esc(artist) + '</span>' : '') + '</p>' +
          '<p class="gb-msg">' + esc(why) + '</p>' +
          '</article>'
        );
      })
      .join('');
    setTimeout(scMax, 60);
  }

  function renderBadges(total) {
    if (badge) {
      badge.textContent = total > 0 ? total + ' recommendation' + (total === 1 ? '' : 's') : 'none yet';
    }
  }

  function setOffline(on, msg) {
    offline = on;
    if (hint) {
      hint.textContent = msg || '';
      hint.hidden = !msg;
    }
    if (rate && on) {
      rate.classList.add('hot');
      rate.textContent = 'unavailable';
    } else if (rate && !on) {
      paintCooldown();
    }
    if (btn) btn.disabled = on || inFlight || cooldownUntil > Date.now();
    form.classList.toggle('is-offline', on);
  }

  async function load(quiet) {
    let r;
    try {
      r = await fetch(API + '?limit=40', { headers: { Accept: 'application/json' } });
    } catch (e) {
      setOffline(true, 'cannot reach the recommendations — check your connection');
      return;
    }
    let j = null;
    try {
      j = await r.json();
    } catch (e) {
      setOffline(true, 'recommendations returned an unreadable response');
      return;
    }
    if (!r.ok || !j || j.ok !== true) {
      const d = j && j.detail ? String(j.detail) : '';
      setOffline(true, d || 'recommendations are unavailable right now');
      return;
    }
    setOffline(false, '');
    renderBadges(j.total || 0);
    if (!quiet || !list.childElementCount) renderNotes(Array.isArray(j.notes) ? j.notes : []);
    mountTurnstile(tsMount, (j.turnstile && j.turnstile.siteKey) || '', 'dark').then(function (armed) {
      if (btn) btn.disabled = offline || cooldownUntil > Date.now();
      if (armed) form.classList.add('is-armed');
      else form.classList.remove('is-armed');
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (inFlight || offline) return;
    if (cooldownUntil > Date.now()) {
      toast('one recommendation every ' + BURST_SECONDS + 's — wait for the timer', true);
      return;
    }

    const name = nameInput.value.trim().replace(/\s+/g, ' ');
    const track = trackInput.value.trim().replace(/\s+/g, ' ');
    const artist = artistInput ? artistInput.value.trim().replace(/\s+/g, ' ') : '';
    const why = whyInput.value.trim().replace(/\s+/g, ' ');
    if (trap && trap.value.trim() !== '') return;

    if (name.length < 2) {
      toast('name needs at least 2 characters', true);
      nameInput.focus();
      return;
    }
    if (track.length < 1) {
      toast('add a track title', true);
      trackInput.focus();
      return;
    }
    if (why.length < 4) {
      toast('say why in at least 4 characters', true);
      whyInput.focus();
      return;
    }

    const token = turnstileToken();
    if (turnstileActive() && !token) {
      toast('finish the verification first', true);
      return;
    }

    setBusy(true);
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name,
          track: track,
          artist: artist,
          why: why,
          website: trap ? trap.value : '',
          turnstileToken: token,
          renderedAt: renderedAt
        })
      });
      const j = await r.json().catch(function () {
        return null;
      });
      if (!r.ok || !j || j.ok !== true) {
        const code = (j && j.error) || 'submit_failed';
        if (code === 'rate_limited') {
          const retry = parseInt(r.headers && r.headers.get && r.headers.get('retry-after'), 10);
          startCooldown(isFinite(retry) && retry > 0 ? retry : BURST_SECONDS);
          toast(j.detail || 'too many recommendations — try again shortly', true);
        } else if (code === 'duplicate') {
          startCooldown(BURST_SECONDS);
          toast('you already recommended this exact track', true);
        } else if (code === 'turnstile_failed') {
          toast('verification failed — try again', true);
          resetTurnstile();
        } else {
          toast((j && j.detail) || 'could not send the recommendation', true);
        }
        return;
      }
      nameInput.value = '';
      trackInput.value = '';
      if (artistInput) artistInput.value = '';
      whyInput.value = '';
      if (trap) trap.value = '';
      renderedAt = Date.now();
      resetTurnstile();
      paintCount();
      startCooldown(BURST_SECONDS);
      const note = j.note;
      const existing = Array.prototype.slice.call(list.querySelectorAll('.gb'));
      renderNotes(note ? [note].concat(existing.map(remap)) : []);
      toast('recommended');
      load(true);
    } catch (e) {
      toast('network error — recommendation not saved', true);
    } finally {
      setBusy(false);
    }
  });

  function remap(el) {
    const nameEl = el.querySelector('.gb-name');
    const trackEl = el.querySelector('.gb-track');
    const artistEl = el.querySelector('.gb-artist');
    const msgEl = el.querySelector('.gb-msg');
    const timeEl = el.querySelector('time');
    return {
      n: nameEl ? nameEl.textContent : '',
      m: trackEl ? trackEl.childNodes[0].textContent : '',
      a: artistEl ? artistEl.textContent : '',
      w: msgEl ? msgEl.textContent : '',
      t: (timeEl && Date.parse(timeEl.getAttribute('datetime') || '')) || Date.now()
    };
  }

  load(false);
  setTimeout(function () {
    load(true);
  }, REFRESH_MS);
}