// Сторінки каталогу («Чай», «Посуд», «Подарункові набори»): фільтр за
// категорією/ціною, сортування та пагінація «показати ще». Кошика на
// сайті немає — обрані товари й контакт для замовлення обробляють
// assets/js/favorites.js та сторінка «Контакти».
// Скрипт нічого не робить на сторінках без #productGrid — безпечно
// підключати поряд зі script.js на будь-якій сторінці.
(function () {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const chips = Array.from(document.querySelectorAll('.shop-cat-chip'));
  const resultsCount = document.getElementById('resultsCount');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const sortSelect = document.getElementById('sortSelect');
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const priceRange = document.getElementById('priceRange');
  const applyPriceBtn = document.getElementById('applyPrice');
  const filterToggle = document.getElementById('filterToggle');
  const sidebar = document.getElementById('shopSidebar');
  const shopSection = document.getElementById('shop');

  const PAGE_SIZE = 8;
  const HARD_MAX_PRICE = priceMax ? Number(priceMax.max) || 9999 : 9999;

  let activeCategory = 'all';
  let minPrice = 0;
  let maxPrice = HARD_MAX_PRICE;
  let visibleLimit = PAGE_SIZE;

  function applyFilters() {
    let matched = 0;

    cards.forEach(card => {
      const cat = card.dataset.category;
      const price = Number(card.dataset.price);
      const inCategory = activeCategory === 'all' || cat === activeCategory;
      const inPrice = price >= minPrice && price <= maxPrice;

      if (!inCategory || !inPrice) {
        card.classList.add('is-hidden');
        card.classList.remove('is-paged');
        return;
      }

      matched += 1;
      card.classList.remove('is-hidden');
      const withinLimit = activeCategory !== 'all' || matched <= visibleLimit;
      card.classList.toggle('is-paged', !withinLimit);
    });

    if (resultsCount) resultsCount.textContent = matched;

    const hasMore = activeCategory === 'all' && matched > visibleLimit;
    if (loadMoreBtn) loadMoreBtn.style.display = hasMore ? '' : 'none';
  }

  function setActiveChip(filter) {
    chips.forEach(c => c.classList.toggle('active', c.dataset.filter === filter));
    activeCategory = filter;
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      setActiveChip(chip.dataset.filter);
      visibleLimit = PAGE_SIZE;
      applyFilters();
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (filterToggle) filterToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLimit += PAGE_SIZE;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const value = sortSelect.value;
      const sorted = cards.slice().sort((a, b) => {
        if (value === 'price-asc') return Number(a.dataset.price) - Number(b.dataset.price);
        if (value === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
        if (value === 'name-asc') return a.dataset.name.localeCompare(b.dataset.name, 'uk');
        return Number(a.dataset.order) - Number(b.dataset.order);
      });
      sorted.forEach(card => grid.appendChild(card));
      applyFilters();
    });
  }

  if (priceRange && priceMax) {
    priceRange.addEventListener('input', () => {
      priceMax.value = priceRange.value;
    });
  }

  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', () => {
      const min = Number(priceMin && priceMin.value);
      const max = Number(priceMax && priceMax.value);
      minPrice = Number.isFinite(min) && min > 0 ? min : 0;
      maxPrice = Number.isFinite(max) && max > 0 ? max : HARD_MAX_PRICE;
      if (priceRange) priceRange.value = String(maxPrice);
      applyFilters();
    });
  }

  // Клік по сердечку «в обране» обробляє assets/js/favorites.js (спільний
  // для всіх сторінок список обраного зі збереженням у localStorage).

  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      filterToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Посилання з міні-списку «Популярне» — показують товар незалежно
  // від поточного фільтра/пагінації і плавно гортають до нього.
  document.querySelectorAll('.mini-item[href^="#product-"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href').slice(1);
      const card = document.getElementById(id);
      if (!card) return;
      event.preventDefault();
      setActiveChip('all');
      minPrice = 0;
      maxPrice = HARD_MAX_PRICE;
      if (priceMin) priceMin.value = '0';
      if (priceMax) priceMax.value = String(HARD_MAX_PRICE);
      if (priceRange) priceRange.value = String(HARD_MAX_PRICE);
      visibleLimit = cards.length;
      applyFilters();
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Перехід із мегаменю/карток (chai.html#puer тощо) — застосовуємо
  // відповідний фільтр і гортаємо до каталогу. Обробляємо не лише перше
  // завантаження сторінки, а й клік по категорії, коли ви вже на сторінці
  // «Чай»: у цьому разі URL-хеш міняється без перезавантаження, тому
  // додатково стежимо за подією hashchange.
  function applyHashFilter() {
    const hash = window.location.hash.replace('#', '');
    const matchChip = chips.find(c => c.dataset.filter === hash);
    if (!matchChip) return false;
    setActiveChip(hash);
    visibleLimit = PAGE_SIZE;
    return true;
  }

  const matchedOnLoad = applyHashFilter();
  applyFilters();

  if (matchedOnLoad && shopSection) {
    window.addEventListener('load', () => {
      shopSection.scrollIntoView({ block: 'start' });
    });
  }

  window.addEventListener('hashchange', () => {
    if (applyHashFilter()) {
      applyFilters();
      if (shopSection) shopSection.scrollIntoView({ block: 'start' });
    }
  });
})();
