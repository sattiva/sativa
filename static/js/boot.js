// Runs before first paint so the scroller and motion classes are on <html> early.
// External rather than inline: the strict CSP in vercel.json allows no inline script.
(function () {
  var d = document.documentElement;
  d.classList.add('motion-choice-required');
  var touch = false;
  try {
    touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  } catch (e) {}
  if (!touch) d.classList.add('smooth-scroll');
  try {
    var m = localStorage.getItem('kast-motion');
    if (m === 'on' || m === 'off') d.classList.add('motion-' + m);
  } catch (e) {}
})();