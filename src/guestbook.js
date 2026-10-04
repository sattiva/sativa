// Guestbook module. Notes live in Redis via /api/guestbook; nothing is stored locally.
// Submit is Turnstile-gated (when a site key is configured), honeypot-gated, dwell-gated
// and rate-limited server-side. This module never trusts server text -- every value that
// reaches innerHTML goes through esc().

import { $, esc, toast, timeAgo } from './config.js';
import { scMax } from './navigation.js';
import { mountTurnstile, turnstileToken, resetTurnstile, turnstileActive } from './turnstile.js';

const API = '/api/guestbook';
const NAME_MAX = 32;
const MSG_MAX = 500;
const REFRESH_MS = 90000;

export function initGuestbook() {
  const list = $('gbList');
  const form = $('gbForm');
  const nameInput = $('gbAuthor');
  const msgInput = $('gbText');
  const badge = $('gbCountBadge');
  const btn = $('gbSubmit');
  const tsMount = $('gbTurnstile');
  const trap = $('gbTrap');
  const hint = $('gbHint');

  // Every id is required; bail loudly in dev rather than silently dead-ending again.
  if (!list || !form || !nameInput || !msgInput) return;

  if (nameInput) nameInput.maxLength = NAME_MAX;
  if (msgInput) msgInput.maxLength = MSG_MAX;
  form.setAttribute('novalidate', '');

  let renderedAt = Date.now();
  let offline = false;
  let inFlight = false;

  // Nothing is submittable until the endpoint has confirmed it is reachable, so a
  // dead backend can never present the user with a button that silently drops writes.
  if (btn) btn.disabled = true;

  function setBusy(on) {
    inFlight = on;
    if (btn) {
      btn.disabled = on;
      btn.textContent = on ? 'Signing…' : 'Sign Guestbook';
    }
  }

  function renderNotes(notes) {
    if (!list) return;
    if (!notes.length) {
      list.innerHTML = '<p class="gb-empty">no notes yet — be the first</p>';
      return;
    }
    list.innerHTML = notes
      .map(function (n) {
        const who = String(n.n || '').slice(0, NAME_MAX);
        const body = String(n.m || '').slice(0, MSG_MAX);
        if (!who || !body) return '';
        return (
          '<article class="gb-entry">' +
          '<div class="gb-entry-head">' +
          '<span class="gb-entry-name">' + esc(who) + '</span>' +
          '<time class="gb-entry-time" datetime="' + esc(new Date(Number(n.t) || 0).toISOString()) + '">' +
          esc(timeAgo(n.t)) +
          '</time>' +
          '</div>' +
          '<p class="gb-entry-msg">' + esc(body) + '</p>' +
          '</article>'
        );
      })
      .join('');
    setTimeout(scMax, 60);
  }

  function renderBadges(total) {
    if (badge) badge.textContent = total > 0 ? total + ' signature' + (total === 1 ? '' : 's') : 'no notes yet';
  }

  function setOffline(on, msg) {
    offline = on;
    if (hint) {
      hint.textContent = msg || '';
      hint.hidden = !msg;
    }
    if (btn) btn.disabled = on || inFlight;
    form.classList.toggle('is-offline', on);
  }

  async function load(quiet) {
    let r;
    try {
      r = await fetch(API + '?limit=40', { headers: { Accept: 'application/json' } });
    } catch (e) {
      setOffline(true, 'cannot reach the guestbook — check your connection');
      return;
    }
    let j = null;
    try {
      j = await r.json();
    } catch (e) {
      setOffline(true, 'guestbook returned an unreadable response');
      return;
    }
    if (!r.ok || !j || j.ok !== true) {
      const d = j && j.detail ? String(j.detail) : '';
      setOffline(true, d || 'guestbook is unavailable right now');
      return;
    }
    setOffline(false, '');
    renderBadges(j.total || 0);
    if (!quiet || !list.childElementCount) renderNotes(Array.isArray(j.notes) ? j.notes : []);
    mountTurnstile(tsMount, (j.turnstile && j.turnstile.siteKey) || '', 'dark').then(function (armed) {
      if (btn) btn.disabled = false;
      if (armed) form.classList.add('is-armed');
      else form.classList.remove('is-armed');
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (inFlight || offline) return;

    const name = nameInput.value.trim().replace(/\s+/g, ' ');
    const msg = msgInput.value.trim().replace(/\s+/g, ' ');
    // Bot trap: hidden from humans, reachable to naive scrapers.
    if (trap && trap.value.trim() !== '') return;

    if (name.length < 2) {
      toast('name needs at least 2 characters', true);
      nameInput.focus();
      return;
    }
    if (msg.length < 4) {
      toast('message needs at least 4 characters', true);
      msgInput.focus();
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
          message: msg,
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
          toast(j.detail || 'too many signatures — slow down', true);
        } else if (code === 'duplicate') {
          toast('you already signed with this message', true);
        } else if (code === 'turnstile_failed') {
          toast('verification failed — try again', true);
          resetTurnstile();
        } else {
          toast((j && j.detail) || 'could not sign the guestbook', true);
        }
        return;
      }
      nameInput.value = '';
      msgInput.value = '';
      if (trap) trap.value = '';
      renderedAt = Date.now();
      resetTurnstile();
      const note = j.note;
      const existing = Array.prototype.slice.call(list.querySelectorAll('.gb-entry'));
      renderNotes(note ? [note].concat(existing.map(remap)) : []);
      toast('signed the guestbook');
      load(true);
    } catch (e) {
      toast('network error — signature not saved', true);
    } finally {
      setBusy(false);
    }
  });

  // Re-render from a live DOM node keeps optimistic inserts consistent with the
  // server shape without a second round trip.
  function remap(el) {
    return {
      n: (el.querySelector('.gb-entry-name') || {}).textContent || '',
      m: (el.querySelector('.gb-entry-msg') || {}).textContent || '',
      t: Date.parse((el.querySelector('time') || {}).getAttribute('datetime') || '') || Date.now()
    };
  }

  // renderedAt is stamped at init, so the dwell check measures time since the page
  // rendered -- which is exactly the signal a too-fast bot cannot fake for free.
  load(false);
  setTimeout(function () {
    load(true);
  }, REFRESH_MS);
}