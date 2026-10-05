// Обране (замінює кошик): вибір товарів зберігається в localStorage і працює
// однаково на всіх сторінках сайту. Коли є хоч один обраний товар — з'являється
// плаваюча кнопка справа знизу з лічильником; клік по ній відкриває модальне
// вікно зі списком усіх вибраних товарів (з будь-якої сторінки каталогу).
(function () {
  const STORAGE_KEY = 'chadao:favorites';

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* Сховище недоступне (приватний режим тощо) — просто ігноруємо. */
    }
  }

  let favorites = loadFavorites();

  const fab = document.getElementById('favFab');
  const fabCount = document.getElementById('favFabCount');
  const overlay = document.getElementById('favModalOverlay');
  const modalBody = document.getElementById('favModalBody');
  const modalClose = document.getElementById('favModalClose');

  function currentPage() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function updateFab() {
    if (!fab) return;
    const count = favorites.length;
    if (fabCount) fabCount.textContent = String(count);
    fab.classList.toggle('visible', count > 0);
    fab.setAttribute('aria-label', count > 0 ? `Обране (${count})` : 'Обране');
  }

  // Синхронізує вигляд сердечок на картках поточної сторінки зі збереженим
  // списком — якщо товар уже в обраному, сердечко показується заповненим
  // одразу після завантаження сторінки.
  function syncCardButtons() {
    const ids = new Set(favorites.map(f => f.id));
    document.querySelectorAll('.js-fav-toggle').forEach(btn => {
      const active = ids.has(btn.dataset.favId);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
      const label = btn.querySelector('[data-label-on]');
      if (label) label.textContent = active ? label.dataset.labelOn : label.dataset.labelOff;
    });
    document.querySelectorAll('.product-card').forEach(card => {
      const btn = card.querySelector('.product-wishlist');
      if (!btn || !card.id) return;
      const active = ids.has(card.id);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function renderModal() {
    if (!modalBody) return;
    modalBody.innerHTML = '';

    if (favorites.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'fav-empty';
      empty.innerHTML = '<p>Ваш список обраного поки порожній.</p><p>Натисніть ♡ на товарі, щоб додати його сюди.</p>';
      modalBody.appendChild(empty);
      return;
    }

    favorites.forEach(item => {
      const row = document.createElement('div');
      row.className = 'fav-item';
      row.dataset.id = item.id;

      const link = document.createElement('a');
      link.className = 'fav-item-link';
      link.href = `${item.page}#${item.id}`;

      const img = document.createElement('img');
      img.className = 'fav-item-img';
      img.src = item.image;
      img.alt = '';
      link.appendChild(img);

      const info = document.createElement('span');
      info.className = 'fav-item-info';

      const name = document.createElement('span');
      name.className = 'fav-item-name';
      name.textContent = item.name;

      const price = document.createElement('span');
      price.className = 'fav-item-price';
      price.textContent = item.price;

      info.appendChild(name);
      info.appendChild(price);
      link.appendChild(info);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'fav-item-remove';
      removeBtn.setAttribute('aria-label', 'Прибрати з обраного');
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => removeFavorite(item.id));

      row.appendChild(link);
      row.appendChild(removeBtn);
      modalBody.appendChild(row);
    });
  }

  function persistAndRefresh() {
    saveFavorites(favorites);
    updateFab();
    syncCardButtons();
    if (overlay && overlay.classList.contains('open')) renderModal();
  }

  function removeFavorite(id) {
    favorites = favorites.filter(f => f.id !== id);
    persistAndRefresh();
  }

  function addFavorite(card) {
    const img = card.querySelector('.product-media img');
    const priceEl = card.querySelector('.product-price');
    const titleEl = card.querySelector('.product-title');
    favorites.push({
      id: card.id,
      name: card.dataset.name || (titleEl ? titleEl.textContent.trim() : ''),
      price: priceEl ? priceEl.textContent.trim() : '',
      image: img ? img.getAttribute('src') : '',
      page: currentPage(),
    });
  }

  function toggleFavorite(card) {
    if (!card.id) return;
    const exists = favorites.some(f => f.id === card.id);
    if (exists) {
      favorites = favorites.filter(f => f.id !== card.id);
    } else {
      addFavorite(card);
    }
    persistAndRefresh();
  }

  document.addEventListener('click', event => {
    const generic = event.target.closest('.js-fav-toggle');
    if (generic) {
      const d = generic.dataset;
      if (favorites.some(f => f.id === d.favId)) {
        favorites = favorites.filter(f => f.id !== d.favId);
      } else {
        favorites.push({ id: d.favId, name: d.favName, price: d.favPrice, image: d.favImage, page: d.favPage });
      }
      persistAndRefresh();
      return;
    }
    const btn = event.target.closest('.product-wishlist');
    if (!btn) return;
    const card = btn.closest('.product-card');
    if (!card) return;
    toggleFavorite(card);
  });

  function openModal() {
    if (!overlay) return;
    renderModal();
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  if (fab) fab.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay && overlay.classList.contains('open')) closeModal();
  });

  syncCardButtons();
  updateFab();
})();
