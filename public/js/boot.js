// Runs before first paint so the scroller class is on <html> early.
// External rather than inline: the strict CSP in vercel.json allows no inline script.
(function () {
  var d = document.documentElement;
  d.classList.add('motion-off');
  var touch = false;
  try {
    touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  } catch (e) {}
  if (!touch) d.classList.add('smooth-scroll');
})();