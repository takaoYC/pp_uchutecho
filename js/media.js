document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();

  const container = document.getElementById('mediaContainer');

  try {
    const res = await fetch('./data/media.json?t=' + Date.now());
    const items = await res.json();

    const visible = items.filter(m => m.published !== false);
    const sorted = [...visible].sort((a, b) => (a.order || 999) - (b.order || 999));

    if (!sorted.length) {
      container.innerHTML = `<div class="empty-state"><div class="emoji">📰</div>媒體報導整理中，敬請期待。</div>`;
      return;
    }

    container.innerHTML = `<div class="media-list">${sorted.map(mediaCard).join('')}</div>`;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div>載入失敗，請稍後再試。</div>`;
  }
});

function mediaCard(m) {
  const dateStr = m.date ? m.date.replace(/-/g, '.') : '';
  const videoCount = (m.videos || []).length;
  const printCount = (m.print || []).length;
  const tags = [];
  if (videoCount) tags.push(`影音 ${videoCount}`);
  if (printCount) tags.push(`平面 ${printCount}`);
  const tagsHtml = tags.map(t => `<span class="media-count-tag">${t}</span>`).join('');

  return `
    <a class="media-card-link" href="media-detail.html?id=${escHtml(m.id)}" aria-label="閱讀：${escHtml(m.title || '')}">
      <article class="media-card">
        <div class="media-card-body">
          ${dateStr ? `<div class="media-card-date">${dateStr}</div>` : ''}
          <h2 class="media-card-title">${escHtml(m.title || '')}</h2>
          ${tagsHtml ? `<div class="media-card-tags">${tagsHtml}</div>` : ''}
        </div>
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
