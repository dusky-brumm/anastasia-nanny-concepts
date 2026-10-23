const concepts = { air: 'Воздух', editorial: 'Суть', warm: 'Тепло' };
const buttons = [...document.querySelectorAll('[data-theme]')];
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyConcept(concept, updateUrl = false) {
  if (!Object.hasOwn(concepts, concept)) concept = 'air';
  document.body.dataset.concept = concept;
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === concept)));
  themeColor.content = { air: '#eaf3f8', editorial: '#f3f0e8', warm: '#f9f0e5' }[concept];
  document.querySelector('.theme-announcement').textContent = `Выбрана концепция «${concepts[concept]}»`;
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('concept', concept);
    history.replaceState(null, '', url);
  }
}

applyConcept(new URLSearchParams(window.location.search).get('concept'));
buttons.forEach(button => button.addEventListener('click', () => applyConcept(button.dataset.theme, true)));

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
  const dialog = document.getElementById(button.dataset.open);
  if (dialog && !dialog.open) dialog.showModal();
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }});
});

document.querySelector('#request-form').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.querySelector('#form-status');
  status.textContent = 'Так будет выглядеть подтверждение заявки. Сейчас это макет: сообщение не отправлено. Для связи перейдите в Telegram.';
  status.hidden = false;
});
