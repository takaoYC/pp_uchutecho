document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();
  loadWorksPreview();
  loadMVPreview();
  loadInterviewsPreview();
  loadBooksPreview();
});

async function loadWorksPreview() {
  const res = await fetch('./data/works.json?t=' + Date.now());
  const works = await res.json();
  works.sort((a, b) => b.year - a.year);
  const preview = works.slice(0, 6);
  const grid = document.getElementById('worksGrid');
  const count = document.getElementById('worksCount');
  if (count) count.textContent = `共 ${works.length} 部`;
  if (!preview.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🎬</div>作品清單尚無資料</div>`;
    return;
  }
  grid.innerHTML = preview.map(w => workCard(w)).join('');
}

async function loadMVPreview() {
  const res = await fetch('./data/mv.json?t=' + Date.now());
  const items = await res.json();
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  const preview = items.slice(0, 3);
  const grid = document.getElementById('mvGrid');
  const count = document.getElementById('mvCount');
  if (count) count.textContent = `共 ${items.length} 支`;
  if (!preview.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🎵</div>MV 尚無資料</div>`;
    return;
  }
  grid.innerHTML = preview.map(m => youtubeCard(m)).join('');
}

async function loadInterviewsPreview() {
  const res = await fetch('./data/interviews.json?t=' + Date.now());
  const items = await res.json();
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  const textItems  = items.filter(i => i.type === 'text').slice(0, 3);
  const videoItems = items.filter(i => i.type === 'video').slice(0, 3);

  const textGrid  = document.getElementById('interviewTextGrid');
  const videoGrid = document.getElementById('interviewVideoGrid');

  textGrid.innerHTML = textItems.length
    ? textItems.map(i => interviewTextCard(i)).join('')
    : `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">📰</div>尚無文字訪談</div>`;

  videoGrid.innerHTML = videoItems.length
    ? videoItems.map(i => youtubeCard(i)).join('')
    : `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🎥</div>尚無影音訪談</div>`;
}

async function loadBooksPreview() {
  const res = await fetch('./data/books.json?t=' + Date.now());
  const books = await res.json();
  books.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const preview = books.slice(0, 3);
  const grid = document.getElementById('booksGrid');
  const count = document.getElementById('booksCount');
  if (count) count.textContent = `共 ${books.length} 本`;
  if (!preview.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">📚</div>書單尚無資料</div>`;
    return;
  }
  grid.innerHTML = preview.map(b => bookCard(b)).join('');
}
