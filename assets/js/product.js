// Сторінка товару (chai-*.html): слайдер фото з мініатюрами, свайпом і
// стрілками + повноекранний перегляд через GLightbox (assets/vendor),
// лічильник кількості та кнопка «Поділитися».
(function () {
  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const track = gallery.querySelector('.pd-track');
    const slides = Array.from(gallery.querySelectorAll('.pd-slide'));
    const thumbs = Array.from(gallery.querySelectorAll('.pd-thumb'));
    const counter = gallery.querySelector('.pd-counter b');
    const stage = gallery.querySelector('.pd-stage');
    let index = 0;

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      thumbs.forEach((t, k) => {
        t.classList.toggle('is-active', k === index);
        if (k === index) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      });
      if (counter) counter.textContent = String(index + 1);
      slides.forEach((s, k) => s.tabIndex = k === index ? 0 : -1);
    }

    gallery.querySelector('.pd-arrow--prev').addEventListener('click', () => go(index - 1));
    gallery.querySelector('.pd-arrow--next').addEventListener('click', () => go(index + 1));
    thumbs.forEach((t, k) => t.addEventListener('click', () => go(k)));
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    // Свайп на сенсорних екранах (без конфлікту з кліком для лайтбоксу)
    let startX = 0, startY = 0, dragging = false, moved = false;
    stage.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      dragging = true; moved = false; startX = e.clientX; startY = e.clientY;
    });
    stage.addEventListener('pointerup', e => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { moved = true; go(index + (dx < 0 ? 1 : -1)); }
    });
    stage.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; } }, true);

    // Лайтбокс: відкривається на поточному фото, гортається як слайдер,
    // а при закритті основне фото синхронізується з переглянутим.
    if (window.GLightbox) {
      const lb = GLightbox({
        selector: '.pd-slide',
        loop: true,
        touchNavigation: true,
        keyboardNavigation: true,
        zoomable: true,
        draggable: true,
        openEffect: 'fade',
        closeEffect: 'fade',
        slideEffect: 'slide',
        descPosition: 'bottom'
      });
      lb.on('slide_changed', ({ current }) => { if (current && typeof current.index === 'number') go(current.index); });
    }
    go(0);
  }

  // Кількість
  const qty = document.querySelector('.pd-qty-input');
  if (qty) {
    const clamp = v => Math.min(99, Math.max(1, parseInt(v, 10) || 1));
    document.querySelectorAll('.pd-qty-btn').forEach(btn => btn.addEventListener('click', () => {
      qty.value = clamp(Number(qty.value) + Number(btn.dataset.step));
    }));
    qty.addEventListener('change', () => { qty.value = clamp(qty.value); });
  }

  // Поділитися
  document.querySelectorAll('.js-share').forEach(btn => btn.addEventListener('click', async () => {
    const data = { title: btn.dataset.title || document.title, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(location.href);
      if (window.ChadaoToast) window.ChadaoToast('Посилання скопійовано — можна ділитися!');
    } catch (e) { /* користувач скасував */ }
  }));
})();
