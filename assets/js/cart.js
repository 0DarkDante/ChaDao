// Кошик: товари з кількістю зберігаються в localStorage і доступні на всіх
// сторінках. Кнопки з класом .js-add-cart (data-id, data-name, data-price,
// data-image, data-url) додають товар; плаваюча кнопка відкриває кошик із
// підсумком і переходом до оформлення на сторінці «Контакти» (заявка
// підставляється у форму автоматично — онлайн-оплати на сайті немає).
(function () {
  const KEY = 'chadao:cart';
  const load = () => { try { const l = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
  let cart = load();
  const fmt = n => `${n.toLocaleString('uk-UA')} грн`;

  // Тост
  const toast = document.createElement('div');
  toast.className = 'cart-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  function showToast(text, withAction) {
    toast.innerHTML = '';
    const span = document.createElement('span'); span.textContent = text; toast.appendChild(span);
    if (withAction) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Переглянути';
      b.addEventListener('click', () => { toast.classList.remove('show'); openCart(); });
      toast.appendChild(b);
    }
    toast.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }
  window.ChadaoToast = showToast;

  // Плаваюча кнопка + модальне вікно (стилі — як у «Обраного»)
  const fab = document.createElement('button');
  fab.className = 'fav-fab cart-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Кошик');
  fab.innerHTML = '<svg viewBox="0 0 26 24" width="26" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h3.5l2.7 12.5h12.3l2.5-9H7"/><circle cx="10" cy="20" r="1.6"/><circle cx="19" cy="20" r="1.6"/></g></svg><span class="fav-fab-count">0</span>';
  document.body.appendChild(fab);
  const fabCount = fab.querySelector('.fav-fab-count');

  const overlay = document.createElement('div');
  overlay.className = 'fav-modal-overlay';
  overlay.innerHTML = '<div class="fav-modal" role="dialog" aria-modal="true" aria-labelledby="cartTitle"><div class="fav-modal-header"><h2 id="cartTitle">Кошик</h2><button class="fav-modal-close" type="button" aria-label="Закрити">×</button></div><div class="fav-modal-body cart-body"></div></div>';
  document.body.appendChild(overlay);
  const body = overlay.querySelector('.cart-body');

  const favFab = document.getElementById('favFab');
  function placeFab() {
    const favVisible = favFab && favFab.classList.contains('visible');
    fab.style.bottom = favVisible ? '100px' : '';
  }
  if (favFab) new MutationObserver(placeFab).observe(favFab, { attributes: true, attributeFilter: ['class'] });

  const total = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = () => cart.reduce((s, i) => s + i.qty, 0);

  function render() {
    const c = count();
    fabCount.textContent = String(c);
    fab.classList.toggle('visible', c > 0);
    fab.setAttribute('aria-label', c ? `Кошик (${c})` : 'Кошик');
    placeFab();
    if (!overlay.classList.contains('open')) return;
    body.innerHTML = '';
    if (!cart.length) {
      body.innerHTML = '<div class="fav-empty"><p>Кошик поки порожній.</p><p>Додайте чай зі сторінки товару — і він з\'явиться тут.</p></div>';
      return;
    }
    cart.forEach(item => {
      const row = document.createElement('div'); row.className = 'fav-item cart-item';
      row.innerHTML = `<a class="fav-item-link" href="${item.url}"><img class="fav-item-img" src="${item.image}" alt=""><span class="fav-item-info"><span class="fav-item-name"></span><span class="fav-item-price">${fmt(item.price)} × ${item.qty} = ${fmt(item.price * item.qty)}</span></span></a>
        <div class="cart-qty"><button type="button" data-d="-1" aria-label="Менше">−</button><span>${item.qty}</span><button type="button" data-d="1" aria-label="Більше">+</button></div>
        <button type="button" class="fav-item-remove" aria-label="Прибрати з кошика">×</button>`;
      row.querySelector('.fav-item-name').textContent = item.name;
      row.querySelectorAll('.cart-qty button').forEach(b => b.addEventListener('click', () => setQty(item.id, item.qty + Number(b.dataset.d))));
      row.querySelector('.fav-item-remove').addEventListener('click', () => setQty(item.id, 0));
      body.appendChild(row);
    });
    const foot = document.createElement('div'); foot.className = 'cart-foot';
    foot.innerHTML = `<p class="cart-total"><span>Разом</span><b>${fmt(total())}</b></p>
      <p class="cart-note">${total() >= 1500 ? 'Доставка по Україні — безкоштовна 🌿' : `До безкоштовної доставки залишилось ${fmt(1500 - total())}`}</p>
      <a class="cart-checkout" href="kontakty.html?order=1#contact-section">Оформити замовлення</a>`;
    body.appendChild(foot);
  }

  function persist() { save(cart); render(); }
  function setQty(id, q) {
    cart = q <= 0 ? cart.filter(i => i.id !== id) : cart.map(i => i.id === id ? { ...i, qty: Math.min(99, q) } : i);
    persist();
  }

  function openCart() { overlay.classList.add('open'); document.body.classList.add('no-scroll'); render(); overlay.querySelector('.fav-modal-close').focus(); }
  function closeCart() { overlay.classList.remove('open'); document.body.classList.remove('no-scroll'); }
  fab.addEventListener('click', openCart);
  overlay.querySelector('.fav-modal-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeCart(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeCart(); });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-add-cart');
    if (!btn) return;
    const d = btn.dataset;
    const qtyEl = d.qtyFrom ? document.querySelector(d.qtyFrom) : null;
    const qty = Math.max(1, parseInt(qtyEl ? qtyEl.value : 1, 10) || 1);
    const existing = cart.find(i => i.id === d.id);
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else cart.push({ id: d.id, name: d.name, price: Number(d.price), image: d.image, url: d.url, qty });
    persist();
    showToast(`«${d.name}» додано до кошика`, true);
  });

  // Для форми на сторінці «Контакти»
  window.ChadaoCart = {
    items: () => cart.slice(),
    summary: () => cart.length ? 'Хочу замовити:\n' + cart.map(i => `— ${i.name} × ${i.qty} = ${fmt(i.price * i.qty)}`).join('\n') + `\nРазом: ${fmt(total())}` : '',
    clear: () => { cart = []; persist(); }
  };
  render();
})();
