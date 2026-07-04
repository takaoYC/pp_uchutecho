document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();

  const container = document.getElementById('eventsContainer');

  try {
    const res = await fetch('./data/events.json?t=' + Date.now());
    const events = await res.json();

    if (!events.length) {
      container.innerHTML = `<div class="empty-state"><div class="emoji">📷</div>活動紀錄整理中，敬請期待。</div>`;
      return;
    }

    const sorted = [...events].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    container.innerHTML = `<div class="event-list">${sorted.map(eventCard).join('')}</div>`;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div>載入失敗，請稍後再試。</div>`;
  }
});

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').trim();
}

function previewText(content) {
  for (const block of (content || [])) {
    if (block.type === 'text') {
      const plain = stripHtml(block.value);
      if (plain.length > 0) {
        return plain.length > 120 ? plain.slice(0, 120) + '…' : plain;
      }
    }
  }
  return '';
}

function needsExpand(content) {
  const blocks = content || [];
  if (blocks.length > 1) return true;
  if (blocks.length === 1 && blocks[0].type === 'text') {
    return stripHtml(blocks[0].value).length > 120;
  }
  if (blocks.some(b => b.type === 'image')) return true;
  return false;
}

function eventCard(ev) {
  const dateStr = ev.date ? ev.date.replace(/-/g, '.') : '';
  const venue = ev.venue ? `<span class="event-venue">✦ ${escHtml(ev.venue)}</span>` : '';
  const content = ev.content || [];
  const preview = previewText(content);
  const expandable = needsExpand(content);
  const fullHtml = renderContent(content);
  const cardId = `ev-${ev.id || Math.random().toString(36).slice(2)}`;

  return `
    <article class="event-card" id="${cardId}">
      <div class="event-meta">
        ${dateStr ? `<span class="event-date">${dateStr}</span>` : ''}
        ${venue}
      </div>
      <h2 class="event-title">${escHtml(ev.title || '')}</h2>
      ${preview ? `<p class="event-preview">${escHtml(preview)}</p>` : ''}
      <div class="event-full-content">${fullHtml}</div>
      ${expandable
        ? `<button class="event-read-more" onclick="toggleEvent('${cardId}', this)" aria-expanded="false">
             閱讀全文 ↓
           </button>`
        : `<div class="event-full-content" style="display:flex">${fullHtml}</div>`
      }
    </article>`;
}

function toggleEvent(cardId, btn) {
  const card = document.getElementById(cardId);
  const expanded = card.classList.toggle('expanded');
  btn.textContent = expanded ? '收起 ↑' : '閱讀全文 ↓';
  btn.setAttribute('aria-expanded', expanded);
  if (!expanded) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
