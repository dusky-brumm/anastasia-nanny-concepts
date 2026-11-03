import {blocks,normalizeState,designUrl,variantNumber} from './model.js?v=__VERSION__';
import {renderJourney} from '../journeys.js?v=__VERSION__';
import {contacts,selectionFaq} from './content.js?v=__VERSION__';

const telegram=contacts.telegram;
const media='studio/media/';
const calmWord='<em class="s-chalk-text">спокойно<svg viewBox="0 0 250 15" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M3 10Q62 2 119 7T246 6"/><path d="M8 12Q60 7 113 10T237 9"/></svg></em>';
const headline=`Найду няню, с\u00a0которой ${calmWord} вам и\u00a0хорошо ребёнку`;
const introduction='Я беру на себя поиск, собеседования и проверки, а вам оставляю главное — выбрать человека, с которым спокойно.';
const services=[
  ['Изучаю отклики','Сверяю опыт кандидатки и её пожелания по графику и условиям с вашим запросом.'],
  ['Созваниваюсь на 10–15 минут','Уточняю условия вакансии и рассказываю кандидатке о вашей семье.'],
  ['Провожу личное интервью','Задаю вопросы о ситуациях из жизни вашей семьи. В анкете объясняю, почему предлагаю познакомиться с няней и что стоит обсудить на встрече.'],
];
const biography='Подбираю нянь с 2022 года. Начинала в двух агентствах, а теперь веду каждый подбор лично. За это время провела больше 500 собеседований и помогла найти няню более чем 40 семьям.';
const background='До рекрутинга я пять лет работала няней, тренером и педагогом. Прошла очную переподготовку на няню-гувернантку и рекрутера по подбору домашнего персонала: больше 400 академических часов с практикой.';
const familyStory='Я старшая сестра в многодетной семье. С 13 лет часто оставалась дома за главную и знаю, как можно любить детей и всё равно уставать. Поэтому на первом разговоре мне важно понять, где вам особенно нужна помощь.';
const conditions=[['Неограниченное количество анкет','Продолжаем поиск подходящего кандидата.'],['Гарантия замены — 6 месяцев','Если сотрудничество не сложилось, подберу замену бесплатно.'],['Личное сопровождение','Помогаю с выбором, знакомством и адаптацией няни.']];
const testimonials=[
  ['Наталья','мама двоих детей','Настя помогла найти няню для дочки. Очень внимательная, отвечает быстро, понимает, что нужно семье. Няня уже полгода с нами — всё отлично!','natalia'],
  ['Юлия','мама мальчика, 4 года','Спасибо за подбор чудесной няни! Настя провела собеседования, проверила рекомендации и была рядом до самого выхода на работу. Очень спокойный и надёжный человек.','julia'],
  ['Анастасия','мама девочки, 6 лет','Мы искали няню через агентства, но всё не то. Настя подошла по-человечески и учла все детали, предложила подходящих кандидатов. Рекомендуем!','anastasia'],
];
const outcomes=[['Заявка','Обсуждаем семью, задачи, график и ваши пожелания.'],['Портрет няни','Вы согласовываете критерии поиска и подробное описание вакансии.'],['Поиск и интервью','Получаете подходящие профили с моими личными комментариями.'],['Знакомство','Встречаетесь с кандидатами и выбираете няню для пробных дней.'],['Сопровождение','Получаете поддержку после выхода няни и гарантию замены на шесть месяцев.']];
const scribble='<svg class="s-scribble" viewBox="0 0 130 40" aria-hidden="true"><path d="M3 29C25 3 54 5 62 21s-17 24-16 6S100 3 124 19m-8-3 10 3-7 8"/></svg>';
const sun='<svg class="s-sun" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="11"/><path d="M30 2v10m0 36v10M2 30h10m36 0h10M10 10l7 7m26 26 7 7M10 50l7-7m26-26 7-7"/></svg>';
function linkTo(id,ctx) {return ctx.library?designUrl('preview.html',ctx.state,id):'#'+id;}
function action(ctx,label='Оставить заявку',secondary=false) {return `<a class="s-button${secondary?' s-button--light':''}" href="${linkTo('apply',ctx)}">${label}<span aria-hidden="true">→</span></a>`;}
function tg(label='Написать в Telegram') {return `<a class="s-text-link" href="${telegram}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;}
function photo(type='cafe',cls='',priority=false) {
  const load=`loading="${priority?'eager':'lazy'}"${priority?' fetchpriority="high"':''}`;
  const portraits=['cafe','about-portrait'];
  const verticalPhoto=type==='family'||type==='rainbow';
  const alt=type==='rainbow'?'с детьми на фоне радуги':verticalPhoto?'с детьми':'с ребёнком';
  const image=portraits.includes(type)?`<img src="${media}${type}.webp" width="720" height="1280" alt="Анастасия Доронина за столиком в кафе" ${load}>`:`<img src="${media}${type}.webp" width="${verticalPhoto?960:640}" height="${verticalPhoto?1280:640}" alt="Анастасия ${alt}" ${load}>`;
  return `<figure class="s-photo ${type==='cafe'?'s-cafe ':''}${cls}"><div class="s-photo-mask">${image}</div></figure>`;
}
function pencilFilter(id) {
  return `<filter id="${id}">
    <feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="2" seed="8"/>
    <feColorMatrix type="luminanceToAlpha"/>
    <feComponentTransfer><feFuncA type="linear" slope="1.45" intercept="-.08"/></feComponentTransfer>
    <feComposite in="SourceGraphic" operator="in"/>
  </filter>`;
}
const heroStrokes={
  2:['0 0 1120 155','M-10 93C151 128 234 23 385 48S627 132 787 87S1025 57 1130 81'],
  3:['0 0 400 440','M15 348C16 208 13 105 84 56C142 15 257 5 321 57C369 97 384 166 384 224'],
  4:['0 0 1120 500','M-10 420C116 418 158 452 259 451C457 451 588 430 614 310C632 223 591 115 679 76C742 48 878 62 952 34'],
  5:['0 0 1120 155','M-10 122C180 116 229 55 423 63C572 68 645 127 798 88C918 57 1005 33 1130 59'],
  9:['0 0 1120 155','M-10 64C154 127 268 111 416 70C535 37 589 54 648 79C703 102 730 68 707 53C677 34 660 80 712 104C810 149 959 113 1130 57'],
};
function heroStroke(variant) {
  const [viewBox,path]=heroStrokes[variant], pencil=`hero-stroke-${variant}`;
  return `<svg class="s-hero-stroke" viewBox="${viewBox}" preserveAspectRatio="none" aria-hidden="true">
    <defs>${pencilFilter(pencil)}</defs><path d="${path}" filter="url(#${pencil})"/>
  </svg>`;
}
function squareHeroPortrait(priority) {
  const wave='M0 34C207 38 373 17 572 21C764 25 880 44 1120 27';
  return `<div class="s-square-portrait">
${photo('cafe','s-square-frame',priority)}
    <svg class="s-square-pencil" viewBox="0 0 400 400" aria-hidden="true">
      <defs>${pencilFilter('hero-pencil-6')}</defs>
      <path d="M12 133V30Q12 12 30 12H150M389 273V370Q389 389 370 389H235" filter="url(#hero-pencil-6)"/>
    </svg>
  </div>
  <svg class="s-hero-transition" viewBox="0 0 1120 52" preserveAspectRatio="none" aria-hidden="true">
    <path class="s-hero-transition-fill" d="${wave}V52H0Z"/>
    <path class="s-hero-transition-pencil" d="${wave}" transform="translate(0 -10)" filter="url(#hero-pencil-6)"/>
  </svg>`;
}
function shapedPortrait(variant) {
  const shape=`hero-shape-${variant}`, pencil=`hero-pencil-${variant}`;
  return `<figure class="s-shaped-portrait"><svg viewBox="0 0 400 440" role="img" aria-label="Анастасия Доронина за столиком в кафе">
    <defs>
      <path id="${shape}" pathLength="100" d="M35 217C35 105 89 37 173 28C255 19 345 47 361 133C371 187 370 268 352 322C332 381 278 413 204 413C133 413 64 405 43 347C27 305 35 257 35 217Z"/>
      <clipPath id="${shape}-crop"><use href="#${shape}"/></clipPath>
${pencilFilter(pencil)}
    </defs>
    <image href="${media}cafe.webp" x="30" y="-179" width="340" height="604.45" clip-path="url(#${shape}-crop)"/>
    <use class="s-portrait-contour" href="#${shape}" transform="translate(200 220) scale(1.058) translate(-200 -220)" filter="url(#${pencil})"/>
${variant===8?`<use class="s-portrait-contour s-portrait-contour--echo" href="#${shape}" transform="translate(200 220) scale(1.13) translate(-200 -220)" filter="url(#${pencil})"/>`:''}
  </svg></figure>${variant===7?`<svg class="s-hero-background-line" viewBox="0 0 1120 130" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 91C130 135 237 100 356 77C500 49 584 109 715 101C853 92 967 21 1130 46" filter="url(#${pencil})"/></svg>`:''}`;
}
function title(text) {return `<div class="s-section-heading"><h2>${text}</h2></div>`;}
function items(list,cls='') {return `<div class="s-items ${cls}">${list.map(([a,b],i)=>`<article><span class="s-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${a}</h3><p>${b}</p></article>`).join('')}</div>`;}
function nav(ctx,cls='') {return `<nav class="s-nav ${cls}" aria-label="Меню сайта">${[['service','О подборе'],['about','Обо мне'],['process','Этапы'],['pricing','Стоимость'],['reviews','Отзывы']].map(([id,name])=>`<a href="${linkTo(id,ctx)}">${name}</a>`).join('')}</nav>`;}
function menu(ctx) {return `<details class="s-menu"><summary aria-label="Открыть меню"><span></span><span></span><span></span></summary>${nav(ctx,'s-menu-links')}</details>`;}
function header(v,c) {
  if(v===2)return `<div class="s-header-top">${tg('Telegram')}${action(c,'Обсудить подбор')}</div>${nav(c)}${menu(c)}`;
  if(v===4)return `<div class="s-header-top">${tg('Telegram')}</div><div class="s-header-bottom">${nav(c)}${menu(c)}</div>`;
  const identity=c.comparison?'<a class="pencil-brand" href="#hero">Анастасия Доронина</a>':'';
  return `${identity}${nav(c)}${v===5?tg('Telegram'):''}${menu(c)}`;
}
function hero(v,c) {
  const application=`<div class="s-actions"><a class="s-button" href="${linkTo('apply',c)}">Оставить заявку</a></div>`;
  const copy=`<div class="s-hero-copy"><h1>${headline}</h1><p class="s-intro">${introduction}</p>${application}</div>`;
  if(v===1)return `${copy}${photo('cafe','s-main-portrait',!c.library)}`;
  if(v===2)return `${copy}<div class="s-hero-strip">${heroStroke(v)}${photo('child')}${photo('cafe','',!c.library)}${photo('family')}</div>`;
  if(v===3)return `<div class="s-hero-arch">${photo('cafe','',!c.library)}${heroStroke(v)}</div><div class="s-hero-letter">${copy}</div>`;
  if(v===4)return `<div class="s-hero-panel">${copy}</div>${photo('cafe','s-main-portrait',!c.library)}${heroStroke(v)}`;
  if(v===6)return `${copy}${squareHeroPortrait(!c.library)}`;
  if(v===7)return `${copy}${shapedPortrait(v)}`;
  if(v===8)return `${shapedPortrait(v)}${copy}`;
  if(v===9)return `${copy}${photo('cafe','s-main-portrait',!c.library)}${heroStroke(v)}`;
  return `<h1>${headline}</h1><div class="s-hero-bottom">${photo('family','',!c.library)}<div><p class="s-intro">${introduction}</p>${application}</div></div>${heroStroke(v)}`;
}
const serviceDrawings=`<svg class="s-service-drawing s-service-drawing--sky" viewBox="0 0 238 96" aria-hidden="true" focusable="false">
  <path pathLength="1" d="M8 76c20-14 40-15 55-8 11 5 13 15 4 16-10 1-11-13 1-22 14-10 37-13 61-7"/>
  <path pathLength="1" d="M167 31c-8-7-22 1-18 13 3 10 18 13 24 4 6-8 1-17-6-17z"/>
  <path pathLength="1" d="M160 24l-1-9"/><path pathLength="1" d="M175 26l5-8"/>
  <path pathLength="1" d="M181 37l10-2"/><path pathLength="1" d="M180 50l9 4"/>
  <path pathLength="1" d="M169 58l3 9"/><path pathLength="1" d="M153 57l-5 8"/>
  <path pathLength="1" d="M142 46l-9 2"/><path pathLength="1" d="M145 32l-8-4"/>
  <path pathLength="1" d="M210 32q9 0 11-11 1 10 10 12-9 1-11 10-1-9-10-11z"/>
</svg><svg class="s-service-drawing s-service-drawing--sprig" viewBox="0 0 120 46" aria-hidden="true" focusable="false">
  <path pathLength="1" d="M5 37c24 3 44-4 60-12 12-6 26-12 43-14"/>
  <path pathLength="1" d="M59 28c-11-1-19-10-14-17 8 0 16 8 14 17z"/>
  <path pathLength="1" d="M71 22c4 7 16 9 22 2-5-5-15-5-22-2z"/>
  <path pathLength="1" d="M86 16c-4-6 0-13 9-14 2 7-2 12-9 14z"/>
</svg>`;
function service(v) {
  const heading=serviceDrawings+title('Подбор няни<br>под задачи вашей семьи');
  const interview=`<div class="s-interview"><h3>Я собеседую няню под вашу семью</h3><p>Для семьи с двумя школьниками спрошу, как няня поступит, если один ребёнок просит помочь с уроками, а другой затевает ссору. Для семьи с трёхлеткой обсудим, как она отреагирует, если ребёнок расплачется и откажется уходить с площадки.</p><a class="s-text-link" href="https://telegra.ph/Nyanya-Ispravnikova-Svetlana-10-11" target="_blank" rel="noopener noreferrer">Посмотреть пример анкеты ↗</a></div>`;
  if(v===5)return `${heading}<div class="s-service-panels"><article><h3>График, привычки<br>и правила семьи</h3><p>${services[0][1]}</p><p>${services[1][1]}</p></article><article><h3>Подробные профили<br>и личные рекомендации</h3><p>${services[2][1]}</p><p>Обсуждаем каждого кандидата и готовимся к знакомству.</p></article></div>`;
  return `${heading}${v===3?scribble:''}${items(services)}${interview}`;
}
const aboutSlides=[
  ['Меня зовут Анастасия','about-portrait',biography],
  ['Я старшая сестра','rainbow',familyStory],
  ['От работы с детьми к подбору нянь','family',background],
  ['Я играю в регби-7','child','Я мастер спорта по регби-7. Однажды провела собеседование с няней прямо в перерыве между играми. В итоге она подошла семье и работала с ребёнком до детского сада.'],
];
function about(v) {
  const aboutPhotos=`<div class="s-about-photos">${photo('about-portrait','s-frame')}${photo('rainbow','s-frame')}</div>`;
  const text=`${title('Я знаю поиск<br><em>с обеих сторон</em>')}<p>${biography}</p><p>${background}</p><p>${familyStory}</p><p class="s-signature">Анастасия Доронина</p>`;
  if(v===1)return `<div class="s-about-slides" data-about-carousel role="region" aria-roledescription="карусель" aria-label="Знакомство с Анастасией">
${title('Давайте познакомимся')}
    <div class="s-about-dots" role="group" aria-label="Выбрать слайд" hidden>
${aboutSlides.map(([name],index)=>`<button type="button" data-about-dot="${index}" aria-label="${name}"></button>`).join('')}
    </div>
    <div class="s-about-viewport" tabindex="0" aria-label="Истории об Анастасии">
      <ol>${aboutSlides.map(([name,image,copy])=>`<li>${photo(image,'s-frame')}<div><h3>${name}</h3><p>${copy}</p></div></li>`).join('')}</ol>
    </div>
    <span class="s-about-status" role="status"></span>
  </div>`;
  if(v===2)return `${aboutPhotos}<div class="s-about-copy">${text}<div class="s-tags"><span>Личное интервью</span><span>Поддержка семьи</span></div></div>`;
  if(v===3)return `<div class="s-letter"><h2>Я знаю поиск<br><em>с обеих сторон</em></h2><p>${biography}</p><p>${background}</p><p>${familyStory}</p><p class="s-signature">Анастасия Доронина</p>${scribble}</div>${aboutPhotos}`;
  if(v===4)return `${title('Лично веду подбор<br>на каждом этапе')}<div class="s-album">${photo('about-portrait','s-taped')}<div><p>${biography}</p><p>${background}</p><p>${familyStory}</p><p class="s-signature">Анастасия Доронина</p></div>${photo('rainbow','s-frame')}</div>`;
  return `<div class="s-about-pair">${photo('about-portrait')}${photo('rainbow')}</div><div class="s-about-copy">${text}</div>`;
}
const routeIcons=[
  'M4 5h16v11H9l-5 4z M8 9h8 M8 12h5',
  'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M5 21v-2a7 7 0 0 1 14 0v2',
  'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0z M14.5 14.5 20 20',
  'M9 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0z M21 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0z M2 20v-2a4 4 0 0 1 8 0v2 M14 20v-2a4 4 0 0 1 8 0v2',
  'M12 20 4.5 12.5C-.5 7.5 7 2 12 8c5-6 12.5-.5 7.5 4.5z',
];
function routeComparison(variant) {
  const wave=variant===7;
  const path=wave
    ?'M0 44Q30 56 60 43C100 25 140 12 180 25S260 56 300 43 380 12 420 25 500 56 540 43Q570 35 600 26'
    :'M60 32Q120 55 180 32Q240 55 300 32Q360 55 420 32Q480 55 540 32';
  return `<div class="s-route-study">${variant===8?'':`<svg class="s-study-line" viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden="true"><path d="${path}"/></svg>`}
    <ol class="s-study-steps" aria-label="Пять этапов подбора няни">${outcomes.map(([name,description],index)=>`
      <li><span class="s-study-number" aria-hidden="true">${index+1}</span>
      <div class="s-study-copy">${variant===6?`<svg class="s-study-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${routeIcons[index]}"/></svg>`:''}
      <h3>${name}</h3><p>${description}</p></div></li>`).join('')}</ol></div>`;
}
function process(v,c) {
  if(v===9)return title('Четыре шага подбора')+`<ol class="s-outcomes">
    <li><span class="s-index">1</span><h3>Обсуждаем запрос</h3><p>На созвоне составляем портрет няни. За один-два дня я оформляю описание вакансии, вы его подтверждаете и вносите предоплату.</p></li>
    <li><span class="s-index">2</span><h3>Получаете первую подборку</h3><p>За две недели после предоплаты я собираю первые две-четыре анкеты с комментариями. При необходимости продолжаю поиск без лимита анкет.</p></li>
    <li><span class="s-index">3</span><h3>Знакомитесь с нянями</h3><p>Назначаем встречи и пробные дни. Я подсказываю, как подготовить ребёнка, и помогаю с адаптацией.</p></li>
    <li><span class="s-index">4</span><h3>Проверяю документы</h3><p>Когда вы определились с няней, я проверяю документы и рекомендации. Если нужен договор, помогу его подготовить.</p></li>
  </ol>`;
  const heading=v===6?'Как всё проходит':v===7?'Маршрут <em>подбора</em>':'Маршрут подбора';
  const steps=v<5?renderJourney(String(v),{wavyArrows:c.wavyArrows}):v===5?`<ol class="s-outcomes">${outcomes.map(([a,b],i)=>`<li><span class="s-index">${i+1}</span><h3>${a}</h3><p>${b}</p></li>`).join('')}</ol>`:routeComparison(v);
  return title(heading)+steps;
}
function faq() {return `<div class="s-faq"><h3>Вопросы о подборе няни</h3>${selectionFaq.map(item=>`<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join('')}</div>`;}
function pricing(v,c) {
  if(c.comparison)return `${title('Стоимость и гарантия')}
    <div class="comparison-price-sheet">
      <div class="comparison-price-main">
        <p class="comparison-price-label">Стоимость подбора</p>
        <h3>Один оклад няни</h3>
        <p>За поиск, собеседования и сопровождение семьи.</p>
      </div>
      <dl class="comparison-price-terms">
        <div><dt>Предоплата</dt><dd>25&nbsp;000&nbsp;₽</dd></div>
        <div><dt>Остаток</dt><dd>После одной-двух пробных недель</dd></div>
        <div><dt>Гарантия бесплатной замены</dt><dd>6 месяцев</dd></div>
      </dl>
      <a class="s-text-link comparison-terms-link" href="${contacts.terms}" target="_blank" rel="noopener noreferrer">Подробные условия ↗</a>
    </div>${faq()}`;
  const price=`<div class="s-price"><h3>1 оклад няни</h3><p>Предоплата — 25&nbsp;000&nbsp;₽.<br>Остаток — после одной-двух пробных недель.</p>${action(c,'Обсудить подбор')}</div>`;
  const terms=items(conditions,'s-conditions');
  return `${title('Стоимость подбора няни')}<div class="s-pricing-layout">${price}${terms}</div><a class="s-terms-link" href="${contacts.terms}" target="_blank" rel="noopener noreferrer">Подробнее об условиях в Telegram ↗</a>${faq()}`;
}
function reviewCard([name,role,quote,avatar],heart='') {
  return `<article class="s-review"><span class="s-quote-mark" aria-hidden="true">“</span><blockquote>${quote}</blockquote><footer><img src="assets/${avatar}.webp" width="40" height="40" loading="lazy" alt=""><div><h3>${name}</h3><p>${role}</p></div></footer>${heart}</article>`;
}
function reviews(v,c) {
  const story=`<article class="s-family-story"><h3>Первая кандидатка осталась на полтора года</h3><p>Светлана была первой няней, которую я предложила семье. Она работала с ребёнком до его выхода в детский сад, а затем перешла в другую семью, которой я помогала с подбором.</p><a class="s-text-link" href="https://telegra.ph/Nyanya-Ispravnikova-Svetlana-10-11" target="_blank" rel="noopener noreferrer">Посмотреть анкету Светланы ↗</a></article>`;
  if(v===1&&c.state.version==='previous') {
    const pin='<span class="s-review-pin" aria-hidden="true"></span>';
    return `${title('Что говорят семьи')}<div class="s-review-grid">${testimonials.map(row=>reviewCard(row,pin)).join('')}</div><a class="s-text-link" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Больше отзывов в Telegram ↗</a>${story}`;
  }
  if(v===1||v===2) {
    const sparkle='<svg class="s-review-sparkle" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2C16 11 11 16 2 16c9 0 14 5 14 14 0-9 5-14 14-14C21 16 16 11 16 2Z"/></svg>';
    const heart='<svg class="s-review-heart" viewBox="0 0 54 50" aria-hidden="true"><path d="M15 42C12 33 4 10 16 10c6 0 7 7 7 13C30 7 45 3 48 13c3 10-17 22-33 29 10-2 18-3 26-2"/></svg>';
    const [natalia,julia,anastasia]=testimonials;
    return `<div class="s-review-heading"><h2>Отзывы${sparkle}</h2><a class="s-review-more" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Смотреть больше отзывов <span aria-hidden="true">→</span></a></div><div class="s-review-grid">${reviewCard(anastasia)}${reviewCard(natalia)}${reviewCard(julia,heart)}</div>${story}`;
  }
  return `${title('Что говорят семьи')}<div class="s-review-grid">${testimonials.map(row=>reviewCard(row)).join('')}</div><a class="s-text-link" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Больше отзывов в Telegram ↗</a>`;
}
function form(comparison=false) {return `<form class="s-consult-form" method="post"><div hidden><label>Сайт<input name="website" autocomplete="off" tabindex="-1"></label></div><label>Ваше имя<input name="name" autocomplete="given-name" maxlength="80" required></label><label>Телефон или Telegram<input name="contact" autocomplete="tel" maxlength="100" required></label><label class="s-form-message">Несколько слов о запросе<textarea name="message" rows="${comparison?4:3}" maxlength="2000" placeholder="Возраст ребёнка, график и необходимая помощь"></textarea></label><button class="s-button" type="submit" disabled>Подготовить заявку <span aria-hidden="true">→</span></button><p class="s-form-note">Вы получите текст сообщения для отправки Анастасии в Telegram. Данные здесь не сохраняются.</p><div class="s-draft" hidden><label>Текст заявки<textarea name="draft" rows="6" readonly></textarea></label><div class="s-actions"><button type="button" class="s-copy">Скопировать</button>${tg('Открыть Telegram')}</div></div><p class="s-request-status" role="status"></p></form>`;}
function apply(v,c) {if(c.comparison)return `<div class="s-apply-intro">${title('Обсудить подбор')}<p>Оставьте контакт, чтобы договориться о созвоне.</p></div>${form(true)}`;return `<div class="s-apply-intro">${v===5?'<div class="s-apply-avatar">'+photo('cafe')+'</div>':''}${title('Готовы обсудить подбор?')}<p>Оставьте контакт для связи. Я уточню задачи семьи и расскажу, как проходит подбор.</p>${v===3?'<p class="s-signature">Анастасия</p>':tg()}${v===4?'<p class="s-contact-caption">Можно сразу написать мне лично.</p>':''}${v===3?scribble:''}</div>${form()}`;}
function footer(v,c) {
  if(!c.comparison)return `<div class="s-footer-contact">${tg('Telegram')}<button type="button" class="s-privacy">О данных формы</button></div>`;
  const identity=c.comparison?'<div class="comparison-footer-name"><a href="#hero">Анастасия Доронина</a><p>Личный подбор нянь</p></div>':'';
  return `${identity}${v!==2&&v!==3?nav(c):''}<div class="s-footer-contact">${tg('Связаться в Telegram')}<button type="button" class="s-privacy">О данных формы</button></div><p class="s-copyright">© 2026 Анастасия Доронина</p>`;
}
const renderers={header,hero,service,about,process,pricing,reviews,apply,footer};
export function renderBlock(id,value,context={}) {
  const state=normalizeState(context.state),ctx={...context,state};
  const block=blocks.find(b=>b.id===id)??blocks[0];
  const v=variantNumber(block,value)||1;
  const previousReviews=id==='reviews'&&v===1&&ctx.state.version==='previous'?' s-reviews--previous':'';
  return `<${id==='header'?'header':id==='footer'?'footer':'section'} class="s-block s-${block.id} s-${block.id}--${v}${previousReviews}" ${context.library?'':`id="${block.id}"`} data-block="${block.id}" data-variant="${v}">${renderers[block.id](v,ctx)}</${id==='header'?'header':id==='footer'?'footer':'section'}>`;
}
const siteOrder=['header','hero','service','about','process','pricing','reviews','apply','footer'];
export function renderSite(state, options={}) {
  const clean=normalizeState(state);
  const sections=new Map(blocks.map((block,index)=>[block.id,renderBlock(block.id,clean.layout[index],{...options,state:clean})]));
  return siteOrder.map(id=>sections.get(id)).join('');
}

const pencilDividers = {
  service: 'M0 37C173 67 261 6 428 16S667 67 801 40S992 21 1120 32',
  about: 'M0 43C147 29 243 53 374 48C478 44 498 15 543 18C600 23 562 62 514 59C467 55 513 35 578 37C742 40 915 70 1120 24',
  reviews: 'M0 53C161 10 271 15 411 41S678 64 793 31S994 15 1120 35',
};
const pencilJournalDividers = {
  service: 'M0 36C124 66 258 68 372 34S542 5 649 35C737 60 890 81 1120 25',
  about: 'M0 54C151 55 226 17 366 31C446 39 472 63 526 60C591 57 592 18 555 16C513 14 499 62 574 65C749 73 921 16 1120 36',
  reviews: 'M0 43C175 10 271 53 400 52S598 23 735 21S961 58 1120 40',
};
function pencilDivider(section, path) {
  return `<svg class="pencil-divider pencil-divider--${section}" viewBox="0 0 1120 76" preserveAspectRatio="none" aria-hidden="true">
    <path d="${path}" filter="url(#preview-pencil)"/>
  </svg>`;
}

function pencilJournalHero() {
  return `
    <section class="s-block pencil-journal-hero" id="hero" aria-labelledby="journal-title">
      <div class="pencil-masthead">
        <p class="pencil-name">Анастасия<br><span>Доронина</span></p>
      </div>
      <figure class="pencil-journal-portrait">
        <svg viewBox="0 0 660 680" role="img" aria-label="Анастасия Доронина за столиком в кафе">
          <defs>
            <path id="journal-portrait-edge" pathLength="100" d="M34 59Q34 43 52 41C226 29 430 31 603 40Q620 41 620 58V607Q620 624 602 624C402 633 209 616 52 629Q34 630 34 611Z"/>
            <clipPath id="journal-portrait-crop"><use href="#journal-portrait-edge"/></clipPath>
${pencilFilter('preview-pencil')}
          </defs>
          <image href="${media}cafe.webp" x="16" y="-339" width="614" height="1091.56" clip-path="url(#journal-portrait-crop)"/>
          <use class="comparison-photo-frame" href="#journal-portrait-edge" aria-hidden="true"/>
          <use class="pencil-journal-contour" href="#journal-portrait-edge" transform="translate(330 340) scale(1.035) translate(-330 -340)" filter="url(#preview-pencil)"/>
        </svg>
      </figure>
      <div class="pencil-journal-copy">
        <p class="pencil-specialty">Личный подбор нянь с заботой о вашей семье</p>
        <h1 id="journal-title">${headline}</h1>
        <p>${introduction}</p>
        <a class="s-button" href="#apply">Оставить заявку</a>
        <svg class="pencil-journal-tail" viewBox="0 0 260 100" aria-hidden="true">
          <path d="M14 9C49 1 86 17 91 42C98 72 62 83 56 62C48 33 112 26 144 47S211 86 250 72" filter="url(#preview-pencil)"/>
        </svg>
      </div>
    </section>`;
}

const pencilNewLayouts = {
  'pencil-panorama': {
    height:720,
    edge:'M26 62Q26 45 43 44C227 34 450 50 616 40Q633 39 633 56V655Q633 672 616 673C449 685 211 655 43 674Q26 676 26 659Z',
    dividers:{
      service:'M0 46C223 5 278 77 493 44S800 11 1120 39',
      about:'M0 24C239 20 361 67 546 49S855 16 1120 52',
      reviews:'M0 52C163 56 307 9 498 34S883 68 1120 19',
    },
  },
  'pencil-album': {
    height:660,
    edge:'M59 61Q59 42 78 40C228 28 408 35 560 40Q579 41 579 60V598Q579 618 560 620C405 632 230 618 78 626Q59 627 59 607Z',
    dividers:{
      service:'M0 44C175 59 314 28 421 35C483 40 495 66 456 62C417 56 450 20 517 22C733 27 903 62 1120 29',
      about:'M0 52C152 13 318 12 464 45S830 64 1120 35',
      reviews:'M0 34C202 60 297 16 491 36C570 44 579 69 548 64C516 57 543 28 606 28C812 25 947 58 1120 41',
    },
  },
};

function pencilNewHero({edge,height=480}) {
  return `<section class="s-block pencil-new-hero" id="hero" aria-labelledby="pencil-title">
    <div class="pencil-headline">
      <p class="pencil-label">Анастасия Доронина · личный подбор нянь</p>
      <h1 id="pencil-title">${headline}</h1>
    </div>
    <figure class="pencil-portrait">
      <svg viewBox="0 0 660 ${height}" role="img" aria-label="Анастасия Доронина за столиком в кафе">
        <defs>
          <path id="preview-portrait-edge" pathLength="100" d="${edge}"/>
          <clipPath id="preview-portrait-crop"><use href="#preview-portrait-edge"/></clipPath>
${pencilFilter('preview-pencil')}
        </defs>
        <image href="${media}cafe.webp" x="10" y="-344" width="640" height="1137.78" clip-path="url(#preview-portrait-crop)"/>
        <use class="comparison-photo-frame" href="#preview-portrait-edge" aria-hidden="true"/>
        <use class="pencil-portrait-stroke" href="#preview-portrait-edge" transform="translate(330 ${height/2}) scale(1.035) translate(-330 -${height/2})" filter="url(#preview-pencil)"/>
      </svg>
    </figure>
    <div class="pencil-intro"><p>${introduction}</p><a class="s-button" href="#apply">Оставить заявку</a></div>
  </section>`;
}

export function renderPencilPreview(state, mode='pencil', options={}) {
  const journal=mode==='pencil-journal';
  const layout=pencilNewLayouts[mode];
  const dividers=layout?.dividers??(journal?pencilJournalDividers:pencilDividers);
  const ctx={...options,state};
  const sections=siteOrder.slice(2);
  return `
    <header class="s-block s-header pencil-header" id="header">
      <a class="pencil-brand" href="#hero">${journal?'Личный подбор нянь':'Анастасия Доронина'}</a>
${nav(ctx)}${menu(ctx)}
    </header>
${layout?pencilNewHero(layout):journal?pencilJournalHero():`<section class="s-block pencil-hero" id="hero" aria-labelledby="pencil-title">
      <div class="pencil-headline">
        <p class="pencil-label">Индивидуальный подбор нянь</p>
        <h1 id="pencil-title">${headline}</h1>
      </div>
      <figure class="pencil-portrait">
        <svg viewBox="0 0 520 502" role="img" aria-label="Анастасия Доронина за столиком в кафе">
          <defs>
            <path id="preview-portrait-edge" pathLength="100" d="M33 50Q33 34 50 33C198 25 346 30 475 38Q492 39 492 56V448Q492 464 475 465C337 473 193 455 50 469Q33 471 33 454Z"/>
            <clipPath id="preview-portrait-crop"><use href="#preview-portrait-edge"/></clipPath>
${pencilFilter('preview-pencil')}
          </defs>
          <image href="${media}cafe.webp" x="14" y="-265" width="490" height="871.11" clip-path="url(#preview-portrait-crop)"/>
          <use class="comparison-photo-frame" href="#preview-portrait-edge" aria-hidden="true"/>
          <use class="pencil-portrait-stroke" href="#preview-portrait-edge" transform="translate(260 251) scale(1.045) translate(-260 -251)" filter="url(#preview-pencil)"/>
        </svg>
      </figure>
      <div class="pencil-intro"><p>${introduction}</p><a class="s-button" href="#apply">Оставить заявку</a></div>
    </section>`}
${sections.map(id=>{
      const index=blocks.findIndex(block=>block.id===id);
      const block=renderBlock(id,state.layout[index],ctx);
      if(!dividers[id])return block;
      return `<div class="pencil-section pencil-section--${id}">${block}${pencilDivider(id,dividers[id])}</div>`;
    }).join('')}`;
}

function editorialContour(lines) {
  const rows=lines.map(([text,detail])=>`<span class="e-contour-line${detail?' e-contour-detail':''}">${text}</span>`).join(' ');
  return `<span class="e-contour"><span class="e-contour-shape" aria-hidden="true">${rows}</span><span class="e-contour-text">${rows}</span></span>`;
}

export function renderEditorial(state) {
  const ctx={state};
  const shortcuts=[
    ['about','cafe','Обо мне','Анастасия Доронина'],
    ['process','child','Как проходит подбор','От заявки до пробных дней'],
    ['pricing','family','Стоимость и условия','Оплата и гарантия замены'],
  ];
  return `<svg class="e-contour-defs" width="0" height="0" aria-hidden="true" focusable="false">
    <filter id="editorial-contour" x="-20%" y="-30%" width="140%" height="160%">
      <feGaussianBlur stdDeviation="5"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 18 -8"/>
    </filter>
  </svg>
  <header class="e-section e-header" id="header">
    <a class="e-brand" href="#hero">Анастасия Доронина <small>Личный подбор нянь</small></a>
${nav(ctx)}${menu(ctx)}<a class="s-button" href="#apply">Обсудить подбор</a>
  </header>
  <section class="e-section e-hero" id="hero">
    <div class="e-stage">
      <svg class="e-portrait-line" viewBox="0 0 720 570" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M34 112C18 50 41 25 111 20C268 9 511 20 642 13C689 11 709 39 706 91M705 375C714 460 703 529 652 541C532 567 352 533 183 548C110 555 68 552 48 533"/>
        <path d="M471 554C557 563 654 559 682 529"/>
      </svg>
      <div class="e-hero-title"><span class="e-label">Индивидуальный подбор нянь</span><h1>${editorialContour([['Найду няню,'],['с которой спокойно'],['вам и хорошо ребёнку']])}</h1></div>
      <div class="e-hero-photo">${photo('cafe','',true)}</div>
      <div class="e-hero-note"><p>${introduction}</p><a class="s-button" href="#apply">Оставить заявку</a></div>
      <svg class="e-hero-sprig" viewBox="0 0 152 72" aria-hidden="true" focusable="false">
        <path d="M3 59C44 69 90 53 139 10M52 59C39 53 34 42 36 34C50 35 57 47 52 59ZM78 51C67 45 63 31 66 24C79 28 83 40 78 51ZM101 39C93 30 94 18 99 11C110 19 110 30 101 39ZM81 50C93 46 107 51 114 57C101 63 88 61 81 50ZM110 33C121 26 132 28 142 31C135 40 121 42 110 33Z"/>
      </svg>
    </div>
  </section>
  <section class="e-section e-service" id="service">
    <div class="e-lead"><div><span class="e-label">О подборе</span><h2>Ищу няню под задачи вашей семьи</h2></div>
    <p>На интервью обсуждаю с кандидаткой ситуации, с которыми она встретится у вас дома. К каждой анкете добавляю свой комментарий: почему предлагаю познакомиться и что стоит обсудить на встрече.</p></div>
    <div class="e-shortcuts">${shortcuts.map(([id,type,label,note])=>`<a class="e-shortcut" href="#${id}" aria-labelledby="shortcut-${id}">${photo(type)}<span class="e-tile-text" id="shortcut-${id}">${editorialContour([[label],[note,true]])}</span></a>`).join('')}</div>
  </section>
  <section class="e-section e-about" id="about">
    <div class="e-about-picture">${photo('family')}<div class="e-about-title"><span class="e-label">Обо мне</span><h2>${editorialContour([['Я знаю работу'],['няни изнутри']])}</h2></div></div>
    <div class="e-about-copy"><p>${biography}</p><p>${background}</p>${tg('Познакомиться в Telegram')}</div>
  </section>
${renderBlock('process',5,ctx)}
${renderBlock('pricing',1,ctx)}
${renderBlock('reviews',1,ctx)}
${renderBlock('apply',1,ctx)}
${renderBlock('footer',1,ctx)}`;
}
