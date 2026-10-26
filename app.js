import { initCommonUI } from './shared-ui.js';

// Saved concept links remain accessible; the root opens the current three layouts.
if (!new URLSearchParams(location.search).has('concept')) location.replace('restart.html');

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

initCommonUI({ menuButton: '.menu-toggle', menu: '#mobile-nav', opener: 'data-open', closeButton: '.dialog-close' });
