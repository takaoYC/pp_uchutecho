document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();
  loadMV();
});

let allMV = [];
let mvSearch = '';

async function loadMV() {
  const res = await fetch('./data/mv.json?t=' + Date.now());
  allMV = await res.json();
  const count = document.getElementById('mvCount');
  if (count) count.textContent = `共 ${allMV.length} 支`;
  renderMV();
}

function renderMV() {
  const grid = document.getElementById('mvGrid');
  let items = [...allMV];
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (mvSearch) {
    const q = mvSearch.toLowerCase();
    items = items.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q)
    );
  }
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🎵</div>${mvSearch ? '找不到符合的 MV' : '尚無 MV 資料'}</div>`;
    return;
  }
  grid.innerHTML = items.map(m => youtubeCard(m)).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const s = document.getElementById('mvSearch');
  if (s) s.addEventListener('input', e => { mvSearch = e.target.value; renderMV(); });
});
