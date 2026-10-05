// Форма зворотного зв'язку (сторінка «Контакти»). Реальної відправки
// листів на сайті немає, тож по сабміту показуємо анімований тост-
// підтвердження і очищаємо форму. Скрипт нічого не робить на сторінках
// без #contactForm — безпечно підключати лише тут.
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const toast = document.getElementById('contactToast');
  const message = document.getElementById('cfMessage');
  const fromCart = new URLSearchParams(location.search).has('order');
  if (message && fromCart && window.ChadaoCart && !message.value.trim()) {
    message.value = window.ChadaoCart.summary();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (toast) {
      toast.textContent = 'Дякуємо! Повідомлення надіслано — відповімо найближчим часом.';
      toast.classList.add('show');
      clearTimeout(toast._hideTimer);
      toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3400);
    }

    if (fromCart && window.ChadaoCart) window.ChadaoCart.clear();
    form.reset();
  });
})();
