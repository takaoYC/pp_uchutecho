document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackTop();
  loadBooks();
});

let allBooks = [];
let booksSearch = '';

async function loadBooks() {
  const res = await fetch('./data/books.json?t=' + Date.now());
  allBooks = await res.json();
  const count = document.getElementById('booksCount');
  if (count) count.textContent = `共 ${allBooks.length} 本`;
  renderBooks();
}

function renderBooks() {
  const grid = document.getElementById('booksGrid');
  let books = [...allBooks];
  books.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  if (booksSearch) {
    const q = booksSearch.toLowerCase();
    books = books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.translator || '').toLowerCase().includes(q) ||
      (b.isbn || '').includes(q)
    );
  }
  if (!books.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">📚</div>找不到符合的書目</div>`;
    return;
  }
  grid.innerHTML = books.map(b => bookCard(b)).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('booksSearch').addEventListener('input', e => {
    booksSearch = e.target.value;
    renderBooks();
  });
});
