// Custom Guestbook Module with interactive notes & persistence
import { $, esc, toast } from './config.js';
import { scMax } from './navigation.js';

const INITIAL_NOTES = [
  { name: 'Kovak', note: 'Sick redesign Sativa! The custom music & games are clean af 🔥', date: 'Oct 4, 2026' },
  { name: 'vivid_ghost', note: 'Love the Toronto weather widget and neon aesthetic!', date: 'Oct 3, 2026' },
  { name: 'cipher_9', note: 'lanyard discord presence synced instant, nice work', date: 'Oct 2, 2026' },
  { name: 'blaze', note: 'Roblox sealanterns12 gang, added u', date: 'Oct 1, 2026' }
];

export function initGuestbook() {
  const list = $('guestbookEntries');
  const form = $('guestbookForm');
  if (!list || !form) return;

  function getNotes() {
    try {
      const stored = localStorage.getItem('sat-guestbook');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_NOTES;
  }

  function saveNotes(notes) {
    try {
      localStorage.setItem('sat-guestbook', JSON.stringify(notes));
    } catch (e) {}
  }

  function renderNotes() {
    const notes = getNotes();
    list.innerHTML = notes.map(n => `
      <div class="gb-card">
        <div class="gb-card-header">
          <span class="gb-author">${esc(n.name)}</span>
          <span class="gb-date">${esc(n.date)}</span>
        </div>
        <p class="gb-text">${esc(n.note)}</p>
      </div>
    `).join('');
    setTimeout(scMax, 50);
  }

  renderNotes();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = $('gbNameInput');
    const msgInput = $('gbMsgInput');
    if (!nameInput || !msgInput) return;

    const name = nameInput.value.trim();
    const note = msgInput.value.trim();

    if (!name || !note) {
      toast('Please enter both name and message', true);
      return;
    }

    const d = new Date();
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const notes = getNotes();
    notes.unshift({ name, note, date: dateStr });
    saveNotes(notes);

    nameInput.value = '';
    msgInput.value = '';

    renderNotes();
    toast('Note added to guestbook!');
  });
}
