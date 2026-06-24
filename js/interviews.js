document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();
  loadInterviews();
});

let allInterviews = [];
let interviewSearch = '';

async function loadInterviews() {
  const res = await fetch('./data/interviews.json?t=' + Date.now());
  allInterviews = await res.json();
  renderInterviews();
}

function renderInterviews() {
  const q = interviewSearch.toLowerCase();
  let items = [...allInterviews];
  if (q) items = items.filter(i => i.title.toLowerCase().includes(q) || (i.source || '').toLowerCase().includes(q));
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  const textItems  = items.filter(i => i.type === 'text');
  const videoItems = items.filter(i => i.type === 'video');

  const textCount  = document.getElementById('textCount');
  const videoCount = document.getElementById('videoCount');
  if (textCount)  textCount.textContent  = `共 ${allInterviews.filter(i => i.type === 'text').length} 篇`;
  if (videoCount) videoCount.textContent = `共 ${allInterviews.filter(i => i.type === 'video').length} 支`;

  const textGrid  = document.getElementById('interviewTextGrid');
  const videoGrid = document.getElementById('interviewVideoGrid');

  textGrid.innerHTML = textItems.length
    ? textItems.map(i => interviewTextCard(i)).join('')
    : `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">📰</div>${q ? '找不到符合的文章' : '尚無文字訪談'}</div>`;

  videoGrid.innerHTML = videoItems.length
    ? videoItems.map(i => youtubeCard(i)).join('')
    : `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🎥</div>${q ? '找不到符合的影片' : '尚無影音訪談'}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const s = document.getElementById('interviewSearch');
  if (s) s.addEventListener('input', e => { interviewSearch = e.target.value; renderInterviews(); });
});
