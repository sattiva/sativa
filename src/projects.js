let solPrice = 148.50;
let solTimer = null;

export async function fetchLiveSolPrice() {
  const usdEl = document.getElementById('solUsdVal');
  const unitEl = document.getElementById('solUnitPrice');
  if (!usdEl && !unitEl) return;

  async function apply(p) {
    if (typeof p !== 'number' || isNaN(p) || p <= 0) return;
    solPrice = p;
    if (unitEl) unitEl.textContent = '1 SOL ≈ $' + p.toFixed(2);
    if (usdEl) {
      const total = 4.5 * p;
      usdEl.textContent = '≈ $' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
    }
  }

  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const p = parseFloat(data && data.price);
      if (p > 0) {
        apply(p);
        return;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const p = data && data.solana && data.solana.usd;
      if (typeof p === 'number' && p > 0) apply(p);
    }
  } catch (e) {}
}

export function startSolPricePolling() {
  fetchLiveSolPrice();
  if (!solTimer) {
    solTimer = setInterval(fetchLiveSolPrice, 45000);
  }
}

export function triggerProjectsEntrance() {
  const view = document.querySelector('section[data-view="projects"]');
  if (!view) return;
  view.classList.remove('projects-active');
  void view.offsetWidth;
  view.classList.add('projects-active');

  const cards = Array.from(view.querySelectorAll('.proj'));
  cards.forEach((card, idx) => {
    card.classList.remove('proj-entered');
    setTimeout(() => {
      card.classList.add('proj-entered');
    }, 60 + idx * 90);
  });
}

export function initProjectsScroller() {
  const view = document.querySelector('section[data-view="projects"]');
  if (!view) return;
  const cards = Array.from(view.querySelectorAll('.proj'));

  function check() {
    if (view.hidden) return;
    const vh = window.innerHeight || 800;
    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 50) {
        if (!card.classList.contains('proj-scrolled')) {
          card.classList.add('proj-scrolled');
          card.classList.add('proj-scrolled-' + (idx + 1));
        }
      }
    });
  }

  window.addEventListener('wheel', check, { passive: true });
  window.addEventListener('scroll', check, { passive: true });
  document.addEventListener('keydown', check);
  setTimeout(check, 100);
}
