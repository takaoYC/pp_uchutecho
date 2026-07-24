document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();

  const container = document.getElementById('mediaDetail');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  if (!id) { showError(container, '找不到報導 ID。'); return; }

  try {
    const res = await fetch('./data/media.json?t=' + Date.now());
    const items = await res.json();
    const m = items.find(x => x.id === id);

    if (!m || m.published === false) {
      showError(container, '找不到這篇報導，可能已被移除或暫時下架。');
      return;
    }

    document.title = `${m.title || '媒體報導'} — ピピ宇宙手帖`;

    const dateStr = m.date ? m.date.replace(/-/g, '.') : '';
    const coverHtml = m.cover_image
      ? `<div class="media-detail-cover"><img src="${escHtml(m.cover_image)}" alt="${escHtml(m.title)}" loading="lazy"></div>`
      : '';

    const videosHtml = renderSection('影音', m.videos || [], renderVideoCard);
    const printHtml = renderSection('平面', m.print || [], renderPrintCard);

    container.innerHTML = `
      <a class="event-detail-back" href="media.html">← 返回媒體</a>
      <article>
        <header class="event-detail-header">
          <div class="event-meta">${dateStr ? `<span class="event-date">${dateStr}</span>` : ''}</div>
          <h1 class="event-title">${escHtml(m.title || '')}</h1>
        </header>
        ${coverHtml}
        <div class="media-detail-sections">
          ${videosHtml}
          ${printHtml}
        </div>
      </article>`;
  } catch (e) {
    showError(container, '載入失敗，請稍後再試。');
  }
});

function renderSection(label, items, cardFn) {
  if (!items.length) return '';
  return `
    <div class="media-section">
      <div class="media-section-label">${label}</div>
      <div class="media-section-list">${items.map(cardFn).join('')}</div>
    </div>`;
}

function renderVideoCard(item) {
  const url = item.url || '';
  const vid = youtubeId(url);
  if (vid) {
    const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
    return `
      <a href="${escHtml(url)}" target="_blank" rel="noopener" class="media-link-card media-link-card--video">
        <div class="media-link-card-thumb">
          <img src="${thumb}" alt="${escHtml(item.title || '')}" loading="lazy">
          <div class="media-link-play"></div>
        </div>
        <div class="media-link-card-body">
          <div class="media-link-card-source">${escHtml(item.source || 'YouTube')}</div>
          <div class="media-link-card-title">${escHtml(item.title || url)}</div>
          <span class="media-link-card-arrow">前往觀看 ↗</span>
        </div>
      </a>`;
  }
  return renderPrintCard(item);
}

function renderPrintCard(item) {
  const url = item.url || '';
  const thumbHtml = item.thumb
    ? `<div class="media-link-card-thumb media-link-card-thumb--print">
        <img src="${escHtml(item.thumb)}" alt="${escHtml(item.title || '')}" loading="lazy">
       </div>`
    : '';
  return `
    <a href="${escHtml(url)}" target="_blank" rel="noopener" class="media-link-card">
      <div class="media-link-card-body">
        <div class="media-link-card-source">${escHtml(item.source || '')}</div>
        <div class="media-link-card-title">${escHtml(item.title || url)}</div>
        <span class="media-link-card-arrow">閱讀全文 ↗</span>
      </div>
      ${thumbHtml}
    </a>`;
}

function showError(container, msg) {
  container.innerHTML = `
    <a class="event-detail-back" href="media.html">← 返回媒體</a>
    <div class="empty-state"><div class="emoji">⚠️</div>${msg}</div>`;
}

function youtubeId(input) {
  if (!input) return '';
  const m = input.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
