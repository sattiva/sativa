// Custom Music Vault Player Module
let curAudio = null;
let curTrackRow = null;

export function stopCustomAudio() {
  if (curAudio) {
    curAudio.pause();
    curAudio = null;
  }
  if (curTrackRow) {
    curTrackRow.classList.remove('playing');
    const btn = curTrackRow.querySelector('.track-play-btn');
    if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    curTrackRow = null;
  }
}

export function initMusic() {
  document.querySelectorAll('#customTrackList .track-row').forEach(row => {
    row.addEventListener('click', function() {
      const src = this.dataset.src;
      const btn = this.querySelector('.track-play-btn');
      if (curTrackRow === this) {
        if (curAudio && curAudio.paused) {
          curAudio.play().catch(() => {});
          this.classList.add('playing');
          if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        } else if (curAudio) {
          curAudio.pause();
          this.classList.remove('playing');
          if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        }
        return;
      }
      stopCustomAudio();
      curTrackRow = this;
      this.classList.add('playing');
      if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
      curAudio = new Audio(src);
      curAudio.volume = 0.7;
      curAudio.play().catch(() => {});
      curAudio.addEventListener('ended', () => {
        stopCustomAudio();
      });
    });
  });
}
