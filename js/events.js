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

    const visible = events.filter(e => e.published !== false);
    const sorted = [...visible].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (!sorted.length) {
      container.innerHTML = `<div class="empty-state"><div class="emoji">📷</div>活動紀錄整理中，敬請期待。</div>`;
      return;
    }
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

function eventCard(ev) {
  const dateStr = ev.date ? ev.date.replace(/-/g, '.') : '';
  const venue = ev.venue ? `<span class="event-venue">✦ ${escHtml(ev.venue)}</span>` : '';
  const content = ev.content || [];
  const preview = previewText(content);

  return `
    <a class="event-card-link" href="event.html?id=${escHtml(ev.id)}" aria-label="閱讀：${escHtml(ev.title || '')}">
      <article class="event-card">
        <div class="event-meta">
          ${dateStr ? `<span class="event-date">${dateStr}</span>` : ''}
          ${venue}
        </div>
        <h2 class="event-title">${escHtml(ev.title || '')}</h2>
        ${preview ? `<p class="event-preview">${escHtml(preview)}</p>` : ''}
        <span class="event-read-more">閱讀全文 →</span>
      </article>
    </a>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
