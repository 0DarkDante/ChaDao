const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('active');
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    toggle.classList.remove('active');
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Випадне меню категорій чаю: на десктопі відкривається по :hover (CSS),
// на мобільному — по кліку на стрілку (акордеон).
document.querySelectorAll('.dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const parent = btn.closest('.nav-item');
    const willOpen = !parent.classList.contains('dropdown-open');
    parent.classList.toggle('dropdown-open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('.nav-item.dropdown-open').forEach(el => {
    if (!el.contains(event.target)) {
      el.classList.remove('dropdown-open');
      const btn = el.querySelector('.dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
});

// Слайдер категорій чаю.
document.querySelectorAll('.category-slider').forEach(slider => {
  const track = slider.querySelector('.category-track');
  const prevBtn = slider.querySelector('.slider-arrow--prev');
  const nextBtn = slider.querySelector('.slider-arrow--next');
  if (!track || !prevBtn || !nextBtn) return;

  const step = () => {
    const card = track.querySelector('.category-card');
    if (!card) return track.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 18);
    return card.getBoundingClientRect().width + gap;
  };

  prevBtn.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  function updateArrows() {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    prevBtn.classList.toggle('is-disabled', track.scrollLeft <= 2);
    nextBtn.classList.toggle('is-disabled', maxScroll <= 2 || track.scrollLeft >= maxScroll);
  }

  let scrollTicking = false;
  track.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => { updateArrows(); scrollTicking = false; });
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateArrows);
  updateArrows();
});

// Поки сторінки каталогу не підключені, не перезавантажуємо головну по href="#".
document.querySelectorAll('a[href="#"]').forEach(link => {
  link.addEventListener('click', event => event.preventDefault());
});


// Хедер плавно ховається при скролі вниз і з'являється при скролі вгору.
const siteHeader = document.querySelector('.site-header');
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeaderOnScroll() {
  if (!siteHeader) return;

  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;
  const menuIsOpen = nav && nav.classList.contains('open');

  if (currentScrollY <= 12 || menuIsOpen) {
    siteHeader.classList.remove('header-hidden');
    siteHeader.classList.toggle('header-visible', currentScrollY > 12);
  } else if (delta > 6) {
    siteHeader.classList.add('header-hidden');
    siteHeader.classList.remove('header-visible');
  } else if (delta < -6) {
    siteHeader.classList.remove('header-hidden');
    siteHeader.classList.add('header-visible');
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateHeaderOnScroll);
    ticking = true;
  }
}, { passive: true });
