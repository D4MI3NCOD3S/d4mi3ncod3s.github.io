(function () {
  var root = document.documentElement;

  // 다크/라이트 전환 (선택 기억) — 모든 페이지
  try { var saved = localStorage.getItem('theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  // 인쇄 시 상세 펼치기
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('details').forEach(function (d) { d.open = true; });
  });

  // 경험 카드 · 필터 — 카드가 있는 페이지에서만
  var grid = document.getElementById('cards');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  var chips = document.querySelectorAll('.chip');
  var moreBtn = document.getElementById('moreBtn');
  var INITIAL = grid.dataset.initial === 'all' ? Infinity : 6;
  var filter = 'all';
  var expanded = false;

  function has(card, f) { return card.dataset.tags.split(' ').indexOf(f) > -1; }

  function render() {
    cards.forEach(function (c, i) {
      var match = filter === 'all' || has(c, filter);
      c.hidden = !match || (filter === 'all' && !expanded && i >= INITIAL);
    });
    if (moreBtn) {
      moreBtn.parentNode.hidden = filter !== 'all';
      moreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      moreBtn.textContent = expanded ? '접기' : '전체 경험 ' + cards.length + '건 보기';
    }
  }

  chips.forEach(function (chip) {
    var f = chip.dataset.filter;
    var n = f === 'all' ? cards.length : cards.filter(function (c) { return has(c, f); }).length;
    chip.insertAdjacentHTML('beforeend', '<span class="n">' + n + '</span>');
    chip.addEventListener('click', function () {
      filter = f;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      render();
    });
  });

  if (moreBtn) moreBtn.addEventListener('click', function () {
    expanded = !expanded;
    render();
  });

  // #exp-… 로 들어오거나 같은 페이지 링크를 누르면 해당 카드를 펼치고 강조
  function revealCard(id) {
    var card = document.getElementById(id);
    if (!card || !card.classList.contains('card')) return;
    if (card.hidden) {
      filter = 'all'; expanded = true;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.filter === 'all' ? 'true' : 'false'); });
      render();
    }
    var d = card.querySelector('details'); if (d) d.open = true;
    card.scrollIntoView({ block: 'center' });
    card.classList.add('flash');
    setTimeout(function () { card.classList.remove('flash'); }, 1600);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#exp-"]');
    if (!a) return;
    e.preventDefault();
    revealCard(a.getAttribute('href').slice(1));
    history.replaceState(null, '', a.getAttribute('href'));
  });

  render();
  if (location.hash.indexOf('#exp-') === 0) revealCard(location.hash.slice(1));
  window.addEventListener('hashchange', function () {
    if (location.hash.indexOf('#exp-') === 0) revealCard(location.hash.slice(1));
  });
})();
