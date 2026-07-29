let currentStep = 2;

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
let calYear = new Date().getFullYear(), calMonth = new Date().getMonth();

function renderCal() {
  const grid = document.getElementById('cal-grid');
  document.getElementById('cal-month-label').textContent = months[calMonth] + ' ' + calYear;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = days.map(d => `<div class="cal-day-name">${d}</div>`).join('');
  const first = new Date(calYear, calMonth, 1).getDay();
  const total = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < first; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= total; d++) {
    const date = new Date(calYear, calMonth, d);
    const isSun = date.getDay() === 0;
    const isPast = date < today;
    let cls = 'cal-day';
    if (isSun) cls += ' sunday';
    else if (isPast) cls += ' past';
    else { cls += ' available'; }
    if (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) cls += ' today';
    const click = (!isSun && !isPast) ? `onclick="selectDay(this, ${d})"` : '';
    html += `<div class="${cls}" ${click}>${d}</div>`;
  }
  grid.innerHTML = html;
}

function selectDay(el, d) {
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  const months_short = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days_full = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const date = new Date(calYear, calMonth, d);
  const dateStr = `${days_full[date.getDay()]}, ${months_short[calMonth]} ${d}`;
  document.getElementById('sum-date').textContent = dateStr;
  document.getElementById('sum-date').classList.remove('empty');
  const instEl = document.querySelector('.instructor-option.selected');
  const instName = instEl ? instEl.dataset.name : 'your instructor';
  document.getElementById('slot-subtitle').textContent = `Available slots for ${instName} on ${dateStr}.`;
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCal();
}

function goStep(n) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
  currentStep = n;
  updateProgress(n);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(n) {
  for (let i = 1; i <= 5; i++) {
    const si = document.getElementById('si-' + i);
    si.className = 'step-item';
    if (i < n) { si.className += ' done'; si.querySelector('.step-circle').textContent = '✓'; }
    else if (i === n) { si.className += ' active'; si.querySelector('.step-circle').textContent = i; }
    else { si.className += ' pending'; si.querySelector('.step-circle').textContent = i; }
    if (i < 5) {
      const sc = document.getElementById('sc-' + i);
      sc.className = 'step-connector ' + (i < n ? 'done' : 'pending');
    }
  }
}

function selectOption(el, group) {
  el.closest('[class$="-options"], .pkg-options, .instructor-options, .payment-options').querySelectorAll('[class$="-option"]').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  if (group === 'pkg') {
    document.getElementById('sum-pkg').textContent = el.dataset.name;
    document.getElementById('sum-total').textContent = el.dataset.price;
  } else if (group === 'inst') {
    document.getElementById('sum-inst').textContent = el.dataset.name;
    const dateEl = document.getElementById('sum-date');
    const dateText = dateEl ? dateEl.textContent : '';
    if (dateText && dateText !== '') {
      document.getElementById('slot-subtitle').textContent = `Available slots for ${el.dataset.name} on ${dateText}.`;
    } else {
      document.getElementById('slot-subtitle').textContent = `Available slots for ${el.dataset.name}.`;
    }
  } else if (group === 'pay') {
    document.getElementById('sum-pay').textContent = el.dataset.name;
  }
}

function selectSlot(btn) {
  document.querySelectorAll('.time-slot.selected').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('sum-time').textContent = btn.textContent;
}

renderCal();