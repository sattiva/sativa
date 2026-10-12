(function () {
  var d = document.documentElement;
  d.classList.add('motion-off');
  var touch = false;
  try {
    touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  } catch (e) {}
  if (!touch) d.classList.add('smooth-scroll');
})();
