import { initCommonUI } from './shared-ui.js';

const designs = {
  close: { name: 'Близко', color: '#e8f2f6' },
  letter: { name: 'Письмо', color: '#fcfbf6' },
  mosaic: { name: 'Мозаика', color: '#eef3f5' }
};
const designButtons = [...document.querySelectorAll('[data-choice]')];

function setDesign(choice, updateUrl = false) {
  if (!Object.hasOwn(designs, choice)) choice = 'close';
  document.body.dataset.design = choice;
  designButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === choice)));
  document.querySelector('meta[name="theme-color"]').content = designs[choice].color;
  document.querySelector('#design-announcement').textContent = `Выбран вариант «${designs[choice].name}»`;
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('concept', choice);
    history.replaceState(null, '', url);
  }
}
setDesign(new URLSearchParams(location.search).get('concept'));
designButtons.forEach(button => button.addEventListener('click', () => setDesign(button.dataset.choice, true)));

const scenarios = {
  baby: {
    question: '«Как вы поможете малышу привыкнуть к новому взрослому, если мама рядом?»',
    reason: 'Обсуждаем бережную адаптацию, режим и то, как няня замечает потребности ребёнка.'
  },
  preschool: {
    question: '«Ребёнок расстроился и отказывается собираться на прогулку. Что вы будете делать?»',
    reason: 'Разбираем отношение к детским эмоциям, границам и освоению новых навыков — например, приучению к горшку.'
  },
  school: {
    question: '«Один ребёнок не хочет делать уроки, а второй мешает и ссорится. Как поступите?»',
    reason: 'Говорим о самостоятельности, помощи с учёбой и конфликтах между детьми — в контексте взглядов вашей семьи.'
  }
};
const scenarioTabs = [...document.querySelectorAll('[data-scenario]')];
function setScenario(tab, focus = false) {
  const scenario = scenarios[tab.dataset.scenario];
  scenarioTabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  document.querySelector('#scenario-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('.scenario-question').textContent = scenario.question;
  document.querySelector('.scenario-reason').textContent = scenario.reason;
  if (focus) tab.focus();
}
scenarioTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setScenario(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % scenarioTabs.length;
    if (event.key === 'ArrowLeft') next = (index + scenarioTabs.length - 1) % scenarioTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = scenarioTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); setScenario(scenarioTabs[next], true); }
  });
});

initCommonUI({ menuButton: '.menu-button', menu: '#mobile-menu' });
