document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initBackTop();
  initLastUpdated();
  initLiveCount();

  const calEl = document.getElementById('calendar');
  const listEl = document.getElementById('scheduleList');
  let items = [];
  try {
    const res = await fetch('./data/schedule.json?t=' + Date.now());
    items = (await res.json()).filter(s => s.date);
  } catch {
    calEl.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div>載入失敗，請稍後再試。</div>';
    return;
  }

  const today = localDateStr();
  document.getElementById('scheduleCount').textContent = `共 ${items.length} 筆`;

  /* ── Calendar ── */
  const now = new Date();
  let viewY = now.getFullYear();
  let viewM = now.getMonth(); // 0-based
  let selected = null;

  // date string → items on that day (multi-day items appear on every day they span)
  const byDay = {};
  items.forEach(s => {
    const [y, m, d] = s.date.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    const end = scheduleEnd(s);
    for (let i = 0; i < 400 && localDateStr(cur) <= end; i++) {
      (byDay[localDateStr(cur)] ||= []).push(s);
      cur.setDate(cur.getDate() + 1);
    }
  });

  function renderCalendar() {
    const first = new Date(viewY, viewM, 1);
    const start = new Date(viewY, viewM, 1 - first.getDay());
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      if (i === 35 && day.getMonth() !== viewM) break; // drop an empty 6th row
      const key = localDateStr(day);
      const list = byDay[key] || [];
      const cls = ['cal-day',
        day.getMonth() !== viewM && 'out',
        list.length && 'has',
        key === today && 'today',
        key === selected && 'sel'].filter(Boolean).join(' ');
      const dots = list.slice(0, 3).map(s => `<i class="sc-cat-${s.category in SCHEDULE_CAT ? s.category : 'other'}"></i>`).join('')
        + (list.length > 3 ? '<i class="more">+</i>' : '');
      const label = `${day.getMonth() + 1}月${day.getDate()}日${list.length ? `，${list.length} 個行程` : ''}`;
      cells += list.length
        ? `<button type="button" class="${cls}" data-day="${key}" aria-label="${label}"><span class="cal-num">${day.getDate()}</span><span class="cal-dots">${dots}</span></button>`
        : `<div class="${cls}" aria-label="${label}"><span class="cal-num">${day.getDate()}</span></div>`;
    }

    const used = [...new Set(items.map(s => s.category in SCHEDULE_CAT ? s.category : 'other'))];
    const legend = used.length
      ? `<div class="cal-legend">${used.map(c => `<span><i class="sc-cat-${c}"></i>${SCHEDULE_CAT[c]}</span>`).join('')}</div>`
      : '';

    const sel = selected && byDay[selected];
    const panel = sel
      ? `<div class="cal-panel">
           <div class="cal-panel-title">${Number(selected.slice(5, 7))}月${Number(selected.slice(8))}日的行程 <button type="button" data-close>關閉</button></div>
           <div class="sc-list">${sel.map(scheduleRow).join('')}</div>
         </div>`
      : '';

    calEl.innerHTML = `
      <div class="cal-head">
        <div class="cal-title"><small>${viewY}</small>${viewM + 1} 月</div>
        <div class="cal-nav">
          <button type="button" class="cal-btn" data-nav="-1" aria-label="上個月">‹</button>
          <button type="button" class="cal-btn" data-nav="0">今天</button>
          <button type="button" class="cal-btn" data-nav="1" aria-label="下個月">›</button>
        </div>
      </div>
      <div class="cal-grid">
        ${WEEKDAYS.map(w => `<div class="cal-wd">${w}</div>`).join('')}
        ${cells}
      </div>
      ${legend}
      ${panel}`;
  }

  calEl.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      const n = Number(nav.dataset.nav);
      if (n === 0) { viewY = now.getFullYear(); viewM = now.getMonth(); }
      else {
        viewM += n;
        if (viewM < 0) { viewM = 11; viewY--; }
        if (viewM > 11) { viewM = 0; viewY++; }
      }
      selected = null;
      renderCalendar();
      return;
    }
    if (e.target.closest('[data-close]')) { selected = null; renderCalendar(); return; }
    const day = e.target.closest('[data-day]');
    if (day) {
      selected = selected === day.dataset.day ? null : day.dataset.day;
      renderCalendar();
    }
  });

  renderCalendar();

  /* ── List ── */
  const upcoming = items.filter(s => scheduleEnd(s) >= today)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));
  const past = items.filter(s => scheduleEnd(s) < today)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));

  function groupByMonth(list) {
    let html = '', lastKey = '', open = false;
    list.forEach(s => {
      const key = s.date.slice(0, 7);
      if (key !== lastKey) {
        if (open) html += '</div>';
        html += `<div class="sc-month-head">${key.slice(0, 4)} 年 ${Number(key.slice(5))} 月</div><div class="sc-list">`;
        lastKey = key; open = true;
      }
      html += scheduleRow(s);
    });
    return html + (open ? '</div>' : '');
  }

  function renderList(filter) {
    document.querySelectorAll('.sc-filters .filter-btn').forEach(b => {
      const on = b.dataset.filter === filter;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
    const list = filter === 'upcoming' ? upcoming
      : filter === 'past' ? past
      : [...items].sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));
    listEl.innerHTML = list.length
      ? groupByMonth(list)
      : `<div class="empty-state"><div class="emoji">🗓️</div>${filter === 'upcoming' ? '目前沒有即將到來的行程' : '尚無行程'}</div>`;
  }

  document.querySelector('.sc-filters').addEventListener('click', e => {
    const b = e.target.closest('[data-filter]');
    if (b) renderList(b.dataset.filter);
  });

  renderList('all');
});
