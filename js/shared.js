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
  const endorsement = b.endorsement || (b.has_foreword ? 'foreword' : '');
  const forewordBadge = endorsement === 'foreword'
    ? `<span class="book-foreword-badge" title="姚愛寗撰寫推薦序，收錄於書中">✦ 推薦序</span>`
    : endorsement === 'blurb'
    ? `<span class="book-blurb-badge" title="姚愛寗為此書撰寫推薦語">✧ 推薦語</span>`
    : '';
  return `
    <div class="book-card">
      <div class="book-header">
        <div class="book-title">${b.title}</div>
        ${forewordBadge}
      </div>
      ${author}${isbn}
      ${links ? `<div class="book-links">${links}</div>` : ''}
    </div>`;
}

/* ── YouTube helpers ── */
function youtubeId(input) {
  if (!input) return '';
  const m = input.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : input.trim();
}

function youtubeCard(item) {
  const vid = youtubeId(item.youtube_url || '');
  if (!vid) return '';
  const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
  const link  = `https://www.youtube.com/watch?v=${vid}`;
  return `
    <div class="yt-card">
      <a href="${link}" target="_blank" rel="noopener" class="yt-thumb-wrap">
        <img src="${thumb}" alt="${item.title}" class="yt-thumb" loading="lazy">
        <div class="yt-play-btn"></div>
      </a>
      <div class="yt-info">
        <div class="yt-title-row">
          <div class="yt-title">${item.title}</div>
          ${item.directed ? `<span class="yt-directed-badge">🎬 執導</span>` : ''}
        </div>
        ${item.artist ? `<div class="yt-sub">${item.artist}</div>` : ''}
        ${item.source ? `<div class="yt-sub">${item.source}</div>` : ''}
        ${item.date   ? `<div class="yt-date">${item.date}</div>` : ''}
      </div>
    </div>`;
}

function interviewTextCard(item) {
  return `
    <a href="${item.url}" target="_blank" rel="noopener" class="interview-text-card">
      <div class="itc-date">${item.date}</div>
      <div class="itc-title">${item.title}</div>
      ${item.source ? `<div class="itc-source">${item.source}</div>` : ''}
      <span class="itc-arrow">閱讀全文 →</span>
    </a>`;
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

/* ── GoatCounter cumulative visitor count (no token needed) ── */
async function initLiveCount() {
  const el = document.getElementById('liveCount');
  if (!el) return;
  try {
    const res = await fetch('https://pp-uchutecho.goatcounter.com/counter//pp_uchutecho/index.html.json');
    if (!res.ok) return;
    const data = await res.json();
    const total = parseInt(data.count_unique || data.count || '0', 10);
    if (total < 1) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = `✦ 累計已有 ${total} 位旅人翻閱手帖 ✦`;
  } catch (e) { el.hidden = true; }
}

/* ── Last updated ── */
async function initLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (!el) return;
  const d = new Date(document.lastModified);
  const s = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  try {
    const res = await fetch('./data/changelog.json?t=' + Date.now());
    const data = await res.json();
    el.textContent = data.note ? `最後更新 ${s}｜${data.note}` : `最後更新 ${s}`;
  } catch {
    el.textContent = `最後更新 ${s}`;
  }
}

/* ── Back to top ── */
function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
