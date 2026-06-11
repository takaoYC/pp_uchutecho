document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackTop();
  loadWorksPreview();
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
