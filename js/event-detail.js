document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();

  const container = document.getElementById('eventDetail');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  if (!id) {
    showError(container, '找不到紀錄 ID。');
    return;
  }

  try {
    const res = await fetch('./data/events.json?t=' + Date.now());
    const events = await res.json();
    const ev = events.find(e => e.id === id);

    if (!ev || ev.published === false) {
      showError(container, '找不到這篇紀錄，可能已被移除或暫時下架。');
      return;
    }

    // Update page title
    document.title = `${ev.title || '活動紀錄'} — ピピ宇宙手帖`;

    const dateStr = ev.date ? ev.date.replace(/-/g, '.') : '';
    const venue = ev.venue ? `<span class="event-venue">✦ ${escHtml(ev.venue)}</span>` : '';

    const relatedHtml = renderRelated(ev.related || [], events);
    const linksHtml = renderLinks(ev.links || []);
    container.innerHTML = `
      <a class="event-detail-back" href="events.html">← 返回紀錄</a>
      <article>
        <header class="event-detail-header">
          <div class="event-meta">
            ${dateStr ? `<span class="event-date">${dateStr}</span>` : ''}
            ${venue}
          </div>
          <h1 class="event-title">${escHtml(ev.title || '')}</h1>
        </header>
        <div class="event-detail-content">
          ${renderContent(ev.content || [])}
        </div>
        ${relatedHtml}
        ${linksHtml}
      </article>
    `;
    if (container.querySelector('.instagram-media')) {
      const sc = document.createElement('script');
      sc.async = true;
      sc.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(sc);
    }
    initStickyTitle();
  } catch (e) {
    showError(container, '載入失敗，請稍後再試。');
  }
});

function showError(container, msg) {
  container.innerHTML = `
    <a class="event-detail-back" href="events.html">← 返回紀錄</a>
    <div class="empty-state"><div class="emoji">⚠️</div>${msg}</div>`;
}

function renderRelated(related, allEvents) {
  if (!related.length) return '';
  const cards = related
    .map(r => allEvents.find(e => e.id === r.id))
    .filter(e => e && e.published !== false);
  if (!cards.length) return '';
  return `
    <div class="event-related">
      <div class="event-related-title">系列文章</div>
      <div class="event-related-list">
        ${cards.map(e => `
          <a href="event.html?id=${escHtml(e.id)}" class="event-related-card">
            ${e.date ? `<div class="event-related-card-date">${e.date.replace(/-/g, '.')}</div>` : ''}
            <div class="event-related-card-title">${escHtml(e.title || '')}</div>
          </a>`).join('')}
      </div>
    </div>`;
}

function renderLinks(links) {
  if (!links || !links.length) return '';
  return `
    <div class="event-links">
      <div class="event-links-title">延伸連結</div>
      <div class="event-links-list">
        ${links.map(l => `
          <a href="${escHtml(l.url)}" target="_blank" rel="noopener" class="event-link-btn">
            ${escHtml(l.label || l.url)}
          </a>`).join('')}
      </div>
    </div>`;
}

function stripEmptyParas(html) {
  // Remove <p> elements that only contain whitespace, <br>, or <span><br></span> (Google Docs empty lines)
  return html.replace(/<p[^>]*>(?:\s|<br\s*\/?>|<span[^>]*>\s*<br\s*\/?>\s*<\/span>| )*<\/p>/gi, '');
}

function renderContent(blocks) {
  return blocks.map(block => {
    if (block.type === 'text') {
      return `<div class="event-body">${stripEmptyParas(block.value || '')}</div>`;
    }
    if (block.type === 'image') {
      return `
        <figure class="event-figure">
          <a href="${block.url}" target="_blank" rel="noopener" class="event-photo-link"
             aria-label="查看大圖：${escHtml(block.alt || '')}">
            <img src="${block.url}" alt="${escHtml(block.alt || '')}" loading="lazy">
          </a>
          ${block.alt ? `<figcaption class="event-caption">${escHtml(block.alt)}</figcaption>` : ''}
        </figure>`;
    }
    return '';
  }).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Footnote links: scroll so the target sits just below the sticky header + article title
document.addEventListener('click', e => {
  const a = e.target.closest('.event-body a[href^="#fn"]');
  if (!a) return;
  const target = document.getElementById(a.getAttribute('href').slice(1));
  if (!target) return;
  e.preventDefault();
  const sticky = document.querySelector('.event-detail-header .event-title');
  // height of the header once it is stuck (its CSS top + its own height), not its current position
  // the title compacts to one line once stuck, so use that height (~60px) rather than its full height
  const offset = (sticky ? (parseFloat(getComputedStyle(sticky).top) || 60) + 60 : 80) + 20;
  history.replaceState(null, '', a.getAttribute('href'));
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
});

// 2. Once the article title sticks to the top, shrink it to one line so it doesn't cover the text
function initStickyTitle() {
  const title = document.querySelector('.event-detail-header .event-title');
  if (!title) return;
  const sentinel = document.createElement('div');
  title.before(sentinel);
  const top = parseFloat(getComputedStyle(title).top) || 60;
  const update = () => title.classList.toggle('is-stuck', sentinel.getBoundingClientRect().top < top);
  window.addEventListener('scroll', update, { passive: true });
  update();
}
