import { $, S, C, CK_W, cGet, cSet } from './config.js';
import { scMax } from './navigation.js';

const tFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: C.tz });
const dFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: C.tz });
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ic(p) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
}

const CL = '<path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>';
const W = {
  sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
  moon: ic('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
  cloud: ic('<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>'),
  partly: ic('<path d="M12 3v1M5.22 5.22l.7.7M3 12h1M5.22 18.78l.7-.7"/><path d="M17.5 10.5h-.5A6 6 0 1 0 9 20h8a4.75 4.75 0 0 0 .5-9.5z"/>'),
  rain: ic('<path d="M16 13v6M8 13v6M12 15v6M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>'),
  drizzle: ic(CL + '<path d="M8 19v1M16 19v1M12 21v1"/>'),
  snow: ic(CL + '<path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"/>'),
  thunder: ic('<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/>'),
  fog: ic('<path d="M4 14h16M4 18h16M6 10h12M8 6h8"/>')
};

function wIcon(c, d) {
  if (c === 0) return d === 0 ? W.moon : W.sun;
  if (c < 3) return W.partly;
  if (c === 3) return W.cloud;
  if (c === 45 || c === 48) return W.fog;
  if (c < 58) return W.drizzle;
  if (c < 68) return W.rain;
  if (c < 78) return W.snow;
  if (c < 83) return W.rain;
  if (c < 87) return W.snow;
  if (c >= 95) return W.thunder;
  return W.cloud;
}

function wDesc(c) {
  return c === 0 ? 'Clear sky' : c === 1 ? 'Mainly clear' : c === 2 ? 'Partly cloudy' : c === 3 ? 'Overcast' : c === 45 ? 'Fog' : c === 48 ? 'Depositing rime fog' : c >= 51 && c <= 53 ? 'Light drizzle' : c === 55 ? 'Dense drizzle' : c === 56 ? 'Light freezing drizzle' : c === 57 ? 'Dense freezing drizzle' : c === 61 ? 'Slight rain' : c === 63 ? 'Moderate rain' : c === 65 ? 'Heavy rain' : c === 66 ? 'Light freezing rain' : c === 67 ? 'Heavy freezing rain' : c === 71 ? 'Slight snow' : c === 73 ? 'Moderate snow' : c === 75 ? 'Heavy snow' : c === 77 ? 'Snow grains' : c === 80 ? 'Slight rain showers' : c === 81 ? 'Moderate rain showers' : c === 82 ? 'Violent rain showers' : c === 85 ? 'Slight snow showers' : c === 86 ? 'Heavy snow showers' : c === 95 ? 'Thunderstorm' : c === 96 ? 'Thunderstorm with slight hail' : c === 99 ? 'Thunderstorm with heavy hail' : '—';
}

export function tick() {
  const n = new Date();
  $('localTime').textContent = tFmt.format(n);
  $('localDate').textContent = dFmt.format(n);
}

export function fT(v) {
  if (v == null || isNaN(v)) return '—';
  let n = Number(v);
  if (S.unit === 'f') n = n * 9 / 5 + 32;
  return Math.round(n) + '°';
}

export function renderW(d) {
  if (!d || !d.current) return;
  S.wData = d;
  const c = d.current;
  $('weatherNowIcon').innerHTML = wIcon(c.weather_code, c.is_day);
  $('weatherNowTemp').textContent = fT(c.temperature_2m);
  $('weatherNowDesc').textContent = wDesc(c.weather_code);
  $('weatherNowFeels').textContent = 'feels like ' + fT(c.apparent_temperature);
  S.wLoaded = true;
  const day = d.daily;
  if (!day || !day.time) return;
  let html = '';
  for (let i = 0; i < day.time.length && i < 7; i++) {
    const dt = new Date(day.time[i] + 'T12:00:00');
    html += '<div class="weather-fday' + (i ? '' : ' today') + '"><span class="weather-fname">' + (i ? DAYS[dt.getDay()] : 'today') + '</span><span class="weather-ficon">' + wIcon(day.weather_code[i], 1) + '</span><span class="weather-ftemps"><b class="weather-ftmax">' + fT(day.temperature_2m_max[i]) + '</b><span class="weather-ftmin">' + fT(day.temperature_2m_min[i]) + '</span></span></div>';
  }
  $('weatherForecast').innerHTML = html;
  setTimeout(scMax, 50);
}

export function setUnit(u) {
  if (u !== 'c' && u !== 'f') return;
  S.unit = u;
  try { localStorage.setItem('sat-unit', u); } catch (e) {}
  const bs = document.querySelectorAll('.unit-btn');
  for (let i = 0; i < bs.length; i++) bs[i].classList.toggle('active', bs[i].dataset.unit === u);
  if (S.wData) renderW(S.wData);
}

export function initWeather() {
  try {
    const su = localStorage.getItem('sat-unit');
    if (su === 'c' || su === 'f') setUnit(su);
  } catch (e) {}

  document.querySelectorAll('.unit-btn').forEach(b => {
    b.addEventListener('click', function() { setUnit(this.dataset.unit); });
  });

  const cached = cGet(CK_W, 3600000);
  if (cached) renderW(cached);

  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 8000);

  fetch('https://api.open-meteo.com/v1/forecast?latitude=' + C.lat + '&longitude=' + C.lon + '&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=' + encodeURIComponent(C.tz) + '&temperature_unit=celsius&forecast_days=7', { referrerPolicy: 'no-referrer', signal: ac.signal })
    .then(r => { clearTimeout(to); return r.ok ? r.json() : null; })
    .then(d => {
      if (!d || !d.current) return;
      cSet(CK_W, d);
      renderW(d);
    })
    .catch(() => { clearTimeout(to); });

  tick();
  setInterval(tick, 1000);
}
