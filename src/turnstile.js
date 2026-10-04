// Cloudflare Turnstile loader. Explicit render mode, loaded once, promise-cached.
// When the site key is absent the widget is skipped entirely and the server falls back
// to honeypot + tighter rate limits, so local dev never needs a secret.

import { toast } from './config.js';

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const READY_TIMEOUT_MS = 12000;

let loader = null;
let widgetId = null;
let token = '';
let active = false;

function scriptReady() {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.defer = true;
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('turnstile_timeout'));
    }, READY_TIMEOUT_MS);
    function cleanup() {
      clearTimeout(timer);
      s.onload = null;
      s.onerror = null;
    }
    s.onload = () => {
      cleanup();
      // The api.js callback can land after the load event; poll briefly for the global.
      let tries = 0;
      (function wait() {
        if (window.turnstile) return resolve(window.turnstile);
        if (++tries > 40) return reject(new Error('turnstile_absent'));
        setTimeout(wait, 50);
      })();
    };
    s.onerror = () => {
      cleanup();
      reject(new Error('turnstile_blocked'));
    };
    document.head.appendChild(s);
  });
  loader.catch(() => {
    loader = null;
  });
  return loader;
}

function clearToken() {
  token = '';
}

// Renders the widget into `mount` if a site key is configured.
// Returns true when a token will be required before submit.
export async function mountTurnstile(mount, siteKey, theme) {
  if (!mount) return false;
  if (!siteKey || siteKey.length < 10) {
    mount.hidden = true;
    return false;
  }
  mount.hidden = false;
  try {
    const api = await scriptReady();
    if (widgetId !== null) {
      try {
        api.remove(widgetId);
      } catch (e) {}
      widgetId = null;
    }
    mount.innerHTML = '';
    widgetId = api.render(mount, {
      sitekey: siteKey,
      theme: theme === 'light' ? 'light' : 'dark',
      appearance: 'always',
      callback: function (t) {
        token = t;
      },
      'expired-callback': clearToken,
      'error-callback': clearToken,
      'timeout-callback': clearToken,
      'unsupported-callback': clearToken
    });
    active = true;
    return true;
  } catch (e) {
    mount.hidden = true;
    active = false;
    return false;
  }
}

export function turnstileActive() {
  return active;
}

export function turnstileToken() {
  return token;
}

export function resetTurnstile() {
  token = '';
  if (!active || !window.turnstile || widgetId === null) return;
  try {
    window.turnstile.reset(widgetId);
  } catch (e) {}
}

export function turnstileError() {
  toast('Human verification failed to load', true);
}