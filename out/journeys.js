export const journeyVariants = [
  {id: '1', title: 'Как в образце', description: 'Шахматное расположение и свободные стрелки с петлями.'},
  {id: '2', title: 'На одной линии', description: 'Пять этапов вдоль одной плавной линии на голубом фоне.'},
  {id: '3', title: 'В две строки', description: 'Последовательный маршрут с разворотом на второй ряд.'},
  {id: '4', title: 'Карточки-записки', description: 'Светлые записки, цветные кнопки и тонкие стрелки между этапами.'},
];

const steps = [
  ['Заявка', 'Вы оставляете заявку,<br> в которой рассказываете<br> о вашей семье'],
  ['Портрет няни', 'Я собираю портрет идеальной няни,<br> согласовываю критерии поиска'],
  ['Поиск и интервью', 'Подбираю кандидатов<br> и провожу собеседования'],
  ['Знакомство', 'Вы получаете подробные<br> анкеты и знакомитесь<br> с подходящими кандидатами'],
  ['Сопровождение', 'Нахожусь с вами на связи<br> после выхода няни на работу,<br> 6 месяцев гарантии замены'],
];

const paths = {
  '1': [
    'M79 80C53 177 51 260 124 269C157 272 186 263 207 252',
    'M234 216C242 172 284 139 314 164C343 189 303 194 301 156C295 105 312 83 348 68',
    'M371 86C393 167 495 216 566 242',
    'M591 232C627 194 659 135 659 72',
  ],
  '2': ['M52 95C115 42 175 100 234 124C292 124 356 60 416 95C478 116 541 100 598 124C660 124 725 60 780 95L904 95'],
  '3': [
    'M270 74Q306 51 335 74',
    'M579 74Q614 51 646 74',
    'M917 95C951 95 951 286 919 286',
    'M646 286Q612 309 579 286',
  ],
  '4': [
    'M173 139Q194 101 215 139',
    'M362 166Q385 201 403 166',
    'M550 139Q572 101 593 139',
    'M740 166Q762 201 781 166',
  ],
};

export function normalizeJourney(value) {
  return journeyVariants.some(variant => variant.id === value) ? value : '1';
}

export function renderJourney(value, {wavyArrows=false}={}) {
  const id = normalizeJourney(value);
  const connectors = id==='1'&&wavyArrows ? [
    ...paths[id].slice(0,2),
    'M389 85C395 158 445 175 470 177S532 178 554 225',
    'M608 232C651 211 622 183 652 161S679 126 666 94',
  ] : paths[id];
  const arrow = `journey-arrow-${id}`;
  const heights = {'1': 369, '2': 335, '3': 410, '4': 375};
  return `<div class="journey journey--${id}" data-route="${id}">
    <svg class="journey-lines" viewBox="0 0 956 ${heights[id]}" preserveAspectRatio="none" aria-hidden="true">
      <defs><marker id="${arrow}" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="m2 1 5 3.5L2 8"/></marker></defs>
      ${connectors.map(d => `<path d="${d}" marker-end="url(#${arrow})"/>`).join('')}
    </svg>
    <ol class="journey-list" aria-label="Пять этапов подбора няни">
      ${steps.map(([title, text], index) => `<li class="journey-node"><span class="journey-number" aria-hidden="true">${index + 1}</span><div class="journey-copy"><h3>${title}</h3><p>${text}</p></div></li>`).join('')}
    </ol>
  </div>`;
}

export function renderJourneyOptions() {
  return journeyVariants.map(variant => `<section class="route-option" id="route-${variant.id}" aria-labelledby="option-${variant.id}">
    <header class="option-header"><div><p class="option-number">ВАРИАНТ 0${variant.id}</p><h2 id="option-${variant.id}">${variant.title}</h2><p class="option-description">${variant.description}</p></div><a class="try-route" href="./?route=${variant.id}&amp;v=f215aad846#process">Посмотреть на сайте <span aria-hidden="true">↗</span></a></header>
    <div class="option-preview option-preview--${variant.id}"><p class="preview-heading">Маршрут <span>подбора</span></p>${renderJourney(variant.id)}</div>
  </section>`).join('\n');
}
