/* ── Theme ── */
(function () {
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

/* ── Platform config ── */
const PLATFORMS = {
  'Netflix': 'plat-netflix', 'Disney+': 'plat-disney',
  'friDay影音': 'plat-friday', 'KKTV': 'plat-kktv',
  'LINE TV': 'plat-linetv', 'YouTube': 'plat-youtube',
  'MyVideo': 'plat-myvideo', 'Catchplay+': 'plat-catchplay',
  'Apple TV+': 'plat-appletv', 'Amazon Prime': 'plat-prime',
};
function platformClass(name) { return PLATFORMS[name] || 'plat-other'; }

const TYPE_LABEL = { film: '電影', drama: '電視劇', variety: '短劇', other: '其他' };

/* ── Card renderers ── */
function workCard(w) {
  const typeCls = `type-${w.type || 'other'}`;
  const typeLabel = TYPE_LABEL[w.type] || '其他';
  const platforms = (w.platforms || []).map(p => {
    const cls = platformClass(p.name);
    return p.url
      ? `<a href="${p.url}" target="_blank" rel="noopener" class="platform-badge ${cls} has-link">${p.name}</a>`
      : `<span class="platform-badge ${cls}">${p.name}</span>`;
  }).join('');
  const noPlatform = !w.platforms || !w.platforms.length
    ? `<span style="font-size:0.78rem;color:var(--text-muted)">平台資訊待補</span>` : '';
  const link = w.link_url
    ? `<a href="${w.link_url}" target="_blank" rel="noopener" class="work-link-btn">🔗 詳情</a>` : '';
  return `
    <div class="work-card">
      <div class="work-year-type">
        <span class="work-year">${w.year}</span>
        <span class="type-badge ${typeCls}">${typeLabel}</span>
        ${link}
      </div>
      <div class="work-title">${w.title}</div>
      ${w.role ? `<div class="work-role">飾演 <span>${w.role}</span></div>` : ''}
      <div class="platforms">${platforms || noPlatform}</div>
    </div>`;
}

function bookCard(b) {
  const author = [b.author && `作者：${b.author}`, b.translator && `譯者：${b.translator}`]
    .filter(Boolean).map(s => `<div class="book-author">${s}</div>`).join('');
  const isbn = b.isbn ? `<div class="book-isbn">ISBN ${b.isbn}</div>` : '';
  const links = [
    b.buy_url && `<a href="${b.buy_url}" target="_blank" rel="noopener" class="book-link">🛒 購買</a>`,
    b.library_url && `<a href="${b.library_url}" target="_blank" rel="noopener" class="book-link">📖 圖書館</a>`
  ].filter(Boolean).join('');
  return `
    <div class="book-card">
      <div class="book-header"><div class="book-title">${b.title}</div></div>
      ${author}${isbn}
      ${links ? `<div class="book-links">${links}</div>` : ''}
    </div>`;
}

/* ── Theme toggle ── */
function initTheme() {
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn) return;
  const update = () => {
    icon.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  };
  update();
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    update();
  });
}

/* ── Back to top ── */
function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
