'use strict';
// Standalone prototype: no network analytics, visitor IDs, or persistent storage.
// Production needs a pharmacy inventory API and consent-aware server analytics.
const medicine = document.getElementById('medicine');
const region = document.getElementById('region');
const stats = { ad: 0, search: 0, map: 0 };
const params = new URLSearchParams(window.location.search);
const source = (params.get('utm_source') || '직접 방문').slice(0, 100);
const campaign = (params.get('utm_campaign') || '지정되지 않음').slice(0, 100);
function refreshMetrics() {
  Object.entries(stats).forEach(([name, count]) => {
    document.getElementById(`${name}-count`).textContent = count;
  });
}
document.getElementById('attribution').textContent = `현재 링크의 유입 출처: ${source} / 캠페인: ${campaign}`;
document.querySelectorAll('[data-medicine]').forEach(button => {
  button.addEventListener('click', () => {
    medicine.value = button.dataset.medicine;
    if (button.closest('.ad-card')) { stats.ad += 1; refreshMetrics(); }
    document.getElementById('results').hidden = true;
    document.getElementById('search').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    region.focus({ preventScroll: true });
  });
});
[medicine, region].forEach(input => input.addEventListener('input', () => {
  input.setCustomValidity('');
  document.getElementById('results').hidden = true;
}));
document.getElementById('search-form').addEventListener('submit', event => {
  event.preventDefault();
  for (const input of [medicine, region]) {
    if (!input.value.trim()) {
      input.setCustomValidity('공백을 제외한 검색어를 입력해 주세요.');
      input.reportValidity();
      return;
    }
  }
  stats.search += 1;
  refreshMetrics();
  document.getElementById('result-title').textContent = `${region.value.trim()}에서 ${medicine.value.trim()} 찾기`;
  // Generic nearby pharmacy search only: this does not assert product availability.
  document.getElementById('map-link').href = `https://map.naver.com/p/search/${encodeURIComponent(region.value.trim() + ' 약국')}`;
  document.getElementById('results').hidden = false;
});
document.getElementById('map-link').addEventListener('click', () => { stats.map += 1; refreshMetrics(); });
document.getElementById('metrics-toggle').addEventListener('click', event => {
  const panel = document.getElementById('metrics');
  panel.hidden = !panel.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
});
// Keep a readable brand card when the manufacturer's external image is unavailable.
document.querySelectorAll('.ad-image img').forEach(img => {
  const fallback = () => img.classList.add('failed');
  img.addEventListener('error', fallback);
  if (img.complete && !img.naturalWidth) fallback();
});
