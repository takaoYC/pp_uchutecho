document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();
  loadWorks();
});

let allWorks = [];
let worksFilter = 'all';
let worksSearch = '';

async function loadWorks() {
  const res = await fetch('./data/works.json?t=' + Date.now());
  allWorks = await res.json();
  const count = document.getElementById('worksCount');
  if (count) count.textContent = `共 ${allWorks.length} 部`;
  renderWorks();
}

function renderWorks() {
  const grid = document.getElementById('worksGrid');
  let works = [...allWorks];
  if (worksFilter !== 'all') works = works.filter(w => w.type === worksFilter);
  if (worksSearch) {
    const q = worksSearch.toLowerCase();
    works = works.filter(w =>
      w.title.toLowerCase().includes(q) ||
      (w.role || '').toLowerCase().includes(q) ||
      (w.note || '').toLowerCase().includes(q)
    );
  }
  works.sort((a, b) => b.year - a.year);
  if (!works.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🎬</div>找不到符合的作品</div>`;
    return;
  }
  grid.innerHTML = works.map(w => workCard(w)).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.works-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.works-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      worksFilter = btn.dataset.filter;
      renderWorks();
    });
  });
  document.getElementById('worksSearch').addEventListener('input', e => {
    worksSearch = e.target.value;
    renderWorks();
  });
});
