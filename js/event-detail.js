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

    if (!ev) {
      showError(container, '找不到這篇紀錄，可能已被移除。');
      return;
    }

    // Update page title
    document.title = `${ev.title || '活動紀錄'} — ピピ宇宙手帖`;

    const dateStr = ev.date ? ev.date.replace(/-/g, '.') : '';
    const venue = ev.venue ? `<span class="event-venue">✦ ${escHtml(ev.venue)}</span>` : '';

    container.innerHTML = `
      <a class="event-detail-back" href="events.html">← 返回活動紀錄</a>
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
      </article>
    `;
  } catch (e) {
    showError(container, '載入失敗，請稍後再試。');
  }
});

function showError(container, msg) {
  container.innerHTML = `
    <a class="event-detail-back" href="events.html">← 返回活動紀錄</a>
    <div class="empty-state"><div class="emoji">⚠️</div>${msg}</div>`;
}

function renderContent(blocks) {
  return blocks.map(block => {
    if (block.type === 'text') {
      return `<div class="event-body">${block.value || ''}</div>`;
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
