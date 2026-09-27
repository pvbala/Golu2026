// Golu app: reads content.json, shows the summary and 9 tiles, plays videos.

const els = {
  title: document.getElementById('title'),
  summary: document.getElementById('summary'),
  grid: document.getElementById('grid'),
  status: document.getElementById('status'),
  player: document.getElementById('player'),
  playerTitle: document.getElementById('player-title'),
  video: document.getElementById('video'),
  videoError: document.getElementById('video-error'),
  close: document.getElementById('close'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
};

let items = [];
let current = -1;

// ---------- Load content ----------
async function loadContent() {
  try {
    const res = await fetch('content.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    render(data);
  } catch (err) {
    els.summary.textContent = 'Videos could not load.';
    showStatus('Check the internet connection, then close and reopen the app.');
    console.error('content.json failed:', err);
  }
}

function render(data) {
  if (data.title) {
    els.title.textContent = data.title;
    document.title = data.title;
  }
  els.summary.textContent = data.summary || '';
  items = Array.isArray(data.items) ? data.items : [];

  els.grid.innerHTML = '';
  items.forEach((item, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile';
    btn.setAttribute('aria-label', 'Play ' + item.title);

    const thumb = document.createElement('span');
    thumb.className = 'thumb';

    if (item.thumb) {
      const img = document.createElement('img');
      img.src = item.thumb;
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = () => img.remove(); // tile colour shows instead
      thumb.appendChild(img);
    }

    const play = document.createElement('span');
    play.className = 'play';
    play.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z"/></svg>';
    thumb.appendChild(play);

    const title = document.createElement('span');
    title.className = 'tile-title';
    title.textContent = item.title;

    btn.append(thumb, title);
    btn.addEventListener('click', () => openPlayer(i, true));
    li.appendChild(btn);
    els.grid.appendChild(li);
  });

  if (items.length === 0) showStatus('No videos yet. Add items to content.json.');
}

function showStatus(msg) {
  els.status.textContent = msg;
  els.status.hidden = false;
}

// ---------- Player ----------
function openPlayer(index, addHistory) {
  const item = items[index];
  if (!item) return;
  current = index;

  els.playerTitle.textContent = item.title;
  els.videoError.hidden = true;
  els.video.poster = item.thumb || '';
  els.video.src = item.video;

  els.prev.disabled = index === 0;
  els.next.disabled = index === items.length - 1;

  const wasOpen = !els.player.hidden;
  els.player.hidden = false;
  document.body.style.overflow = 'hidden';

  // Lets the phone's Back button / swipe close the player instead of leaving the app
  if (addHistory && !wasOpen) history.pushState({ player: true }, '');

  const p = els.video.play();
  if (p && p.catch) p.catch(() => { /* user can press play */ });
  els.close.focus();
}

function closePlayer() {
  els.video.pause();
  els.video.removeAttribute('src');
  els.video.load(); // stops the download
  els.player.hidden = true;
  document.body.style.overflow = '';

  const tiles = els.grid.querySelectorAll('.tile');
  if (tiles[current]) tiles[current].focus();
  current = -1;
}

els.close.addEventListener('click', () => {
  if (history.state && history.state.player) history.back(); // triggers popstate
  else closePlayer();
});

window.addEventListener('popstate', () => {
  if (!els.player.hidden) closePlayer();
});

els.prev.addEventListener('click', () => openPlayer(current - 1, false));
els.next.addEventListener('click', () => openPlayer(current + 1, false));

// When a video ends, offer the next one without auto-playing it
els.video.addEventListener('ended', () => {
  if (current < items.length - 1) els.next.focus();
});

els.video.addEventListener('error', () => {
  if (!els.video.getAttribute('src')) return; // ignore errors from closing
  els.videoError.textContent = navigator.onLine
    ? 'This video is missing. Check that the file is in the videos folder on GitHub.'
    : 'No internet. Connect to Wi-Fi or mobile data to watch videos.';
  els.videoError.hidden = false;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.player.hidden) els.close.click();
});

// ---------- Offline support ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker failed:', err));
  });
}

loadContent();
