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
