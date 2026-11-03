import {blocks,normalizeState,designUrl,variantNumber} from './model.js?v=3d15d77d01';
import {renderJourney} from '../journeys.js?v=3d15d77d01';
import {contacts,selectionFaq} from './content.js?v=3d15d77d01';

const telegram=contacts.telegram;
const media='studio/media/';
const headline='Найду няню, с\u00a0которой <em class="s-chalk-text">спокойно вам<svg viewBox="0 0 250 15" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M3 10Q62 2 119 7T246 6"/><path d="M8 12Q60 7 113 10T237 9"/></svg></em> и\u00a0хорошо ребёнку';
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
function portraitComposition(priority=false) {
  return `<div class="s-live-portrait"><span class="s-photo-backing" aria-hidden="true"></span>${photo('family','s-live-frame',priority)}<span class="s-paper-tape" aria-hidden="true"></span><img class="s-portrait-flowers" src="assets/flowers.webp" width="70" height="114" alt=""></div>`;
}
function title(text) {return `<div class="s-section-heading"><h2>${text}</h2></div>`;}
function items(list,cls='') {return `<div class="s-items ${cls}">${list.map(([a,b],i)=>`<article><span class="s-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${a}</h3><p>${b}</p></article>`).join('')}</div>`;}
function nav(ctx,cls='') {return `<nav class="s-nav ${cls}" aria-label="Меню сайта">${[['service','О подборе'],['about','Обо мне'],['process','Этапы'],['pricing','Стоимость'],['reviews','Отзывы']].map(([id,name])=>`<a href="${linkTo(id,ctx)}">${name}</a>`).join('')}</nav>`;}
function menu(ctx) {return `<details class="s-menu"><summary aria-label="Открыть меню"><span></span><span></span><span></span></summary>${nav(ctx,'s-menu-links')}</details>`;}
function header(v,c) {
  if(v===2)return `<div class="s-header-top">${tg('Telegram')}${action(c,'Обсудить подбор')}</div>${nav(c)}${menu(c)}`;
  if(v===4)return `<div class="s-header-top">${tg('Telegram')}</div><div class="s-header-bottom">${nav(c)}${action(c,'Оставить заявку')}${menu(c)}</div>`;
  return `${nav(c)}${v===5?tg('Telegram'):action(c,'Оставить заявку')}${menu(c)}`;
}
function hero(v,c) {
  const copy=`<div class="s-hero-copy"><h1>${headline}</h1><p class="s-intro">${introduction}</p><div class="s-actions">${action(c)}${tg('Telegram')}</div></div>`;
  if(v===1)return `${copy}${portraitComposition(!c.library)}`;
  if(v===2)return `${copy}<div class="s-hero-strip">${photo('child')}${photo('family','',!c.library)}${photo('cafe')}</div>`;
  if(v===3)return `${photo('family','s-taped',!c.library)}<div class="s-hero-letter">${copy}</div>${sun}`;
  if(v===4)return `<div class="s-hero-panel">${copy}${scribble}</div>${photo('family','s-frame',!c.library)}`;
  return `<h1>${headline}</h1><div class="s-hero-bottom">${photo('family','',!c.library)}<div><p class="s-intro">${introduction}</p><div class="s-actions">${action(c)}${tg('Telegram')}</div>${scribble}</div></div>`;
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
  ['Я на связи и после знакомства','child','Перед пробными днями подскажу, как подготовить ребёнка к знакомству. После выхода няни со мной можно обсудить адаптацию и изменения, которые вы хотите предложить няне.'],
];
function about(v) {
  const aboutPhotos=`<div class="s-about-photos">${photo('about-portrait','s-frame')}${photo('rainbow','s-frame')}</div>`;
  const text=`${title('Я знаю поиск<br><em>с обеих сторон</em>')}<p>${biography}</p><p>${background}</p><p>${familyStory}</p><p class="s-signature">Анастасия Доронина</p>`;
  if(v===1)return `<div class="s-about-slides" data-about-carousel role="region" aria-roledescription="карусель" aria-label="Знакомство с Анастасией">${title('Давайте познакомимся')}<div class="s-about-viewport" tabindex="0" aria-label="Истории об Анастасии"><ol>${aboutSlides.map(([name,image,copy])=>`<li>${photo(image,'s-frame')}<div><h3>${name}</h3><p>${copy}</p></div></li>`).join('')}</ol></div><div class="s-about-controls" hidden><button type="button" class="s-about-arrow" data-about-prev aria-label="Предыдущий слайд">←</button><div class="s-about-dots" role="group" aria-label="Выбрать слайд">${aboutSlides.map(([name],index)=>`<button type="button" data-about-dot="${index}" aria-label="${name}"></button>`).join('')}</div><button type="button" class="s-about-arrow" data-about-next aria-label="Следующий слайд">→</button><span class="s-about-status" role="status"></span></div></div>`;
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
function process(v) {
  if(v===9)return title('Четыре шага подбора')+`<ol class="s-outcomes">
    <li><span class="s-index">1</span><h3>Обсуждаем запрос</h3><p>На созвоне составляем портрет няни. За один-два дня я оформляю описание вакансии, вы его подтверждаете и вносите предоплату.</p></li>
    <li><span class="s-index">2</span><h3>Получаете первую подборку</h3><p>За две недели после предоплаты я собираю первые две-четыре анкеты с комментариями. При необходимости продолжаю поиск без лимита анкет.</p></li>
    <li><span class="s-index">3</span><h3>Знакомитесь с нянями</h3><p>Назначаем встречи и пробные дни. Я подсказываю, как подготовить ребёнка, и помогаю с адаптацией.</p></li>
    <li><span class="s-index">4</span><h3>Проверяю документы</h3><p>Когда вы определились с няней, я проверяю документы и рекомендации. Если нужен договор, помогу его подготовить.</p></li>
  </ol>`;
  const heading=v===6?'Как всё проходит':v===7?'Маршрут <em>подбора</em>':'Маршрут подбора';
  const steps=v<5?renderJourney(String(v)):v===5?`<ol class="s-outcomes">${outcomes.map(([a,b],i)=>`<li><span class="s-index">${i+1}</span><h3>${a}</h3><p>${b}</p></li>`).join('')}</ol>`:routeComparison(v);
  return title(heading)+steps;
}
function faq() {return `<div class="s-faq"><h3>Вопросы о подборе няни</h3>${selectionFaq.map(item=>`<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join('')}</div>`;}
function pricing(v,c) {
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
  if(v===1) {
    const sparkle='<svg class="s-review-sparkle" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2C16 11 11 16 2 16c9 0 14 5 14 14 0-9 5-14 14-14C21 16 16 11 16 2Z"/></svg>';
    const heart='<svg class="s-review-heart" viewBox="0 0 54 50" aria-hidden="true"><path d="M15 42C12 33 4 10 16 10c6 0 7 7 7 13C30 7 45 3 48 13c3 10-17 22-33 29 10-2 18-3 26-2"/></svg>';
    const [natalia,julia,anastasia]=testimonials;
    return `<div class="s-review-heading"><h2>Отзывы${sparkle}</h2><a class="s-review-more" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Смотреть больше отзывов <span aria-hidden="true">→</span></a></div><div class="s-review-grid">${reviewCard(anastasia)}${reviewCard(natalia)}${reviewCard(julia,heart)}</div>${story}`;
  }
  return `${title('Что говорят семьи')}<div class="s-review-grid">${testimonials.map(row=>reviewCard(row)).join('')}</div><a class="s-text-link" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Больше отзывов в Telegram ↗</a>`;
}
function form() {return `<form class="s-consult-form" method="post"><div hidden><label>Сайт<input name="website" autocomplete="off" tabindex="-1"></label></div><label>Ваше имя<input name="name" autocomplete="given-name" maxlength="80" required></label><label>Телефон или Telegram<input name="contact" autocomplete="tel" maxlength="100" required></label><label class="s-form-message">Несколько слов о запросе<textarea name="message" rows="3" maxlength="2000" placeholder="Возраст ребёнка, график и необходимая помощь"></textarea></label><button class="s-button" type="submit" disabled>Подготовить заявку <span aria-hidden="true">→</span></button><p class="s-form-note">Вы получите текст сообщения для отправки Анастасии в Telegram. Данные здесь не сохраняются.</p><div class="s-draft" hidden><label>Текст заявки<textarea name="draft" rows="6" readonly></textarea></label><div class="s-actions"><button type="button" class="s-copy">Скопировать</button>${tg('Открыть Telegram')}</div></div><p class="s-request-status" role="status"></p></form>`;}
function apply(v) {return `<div class="s-apply-intro">${v===5?'<div class="s-apply-avatar">'+photo('cafe')+'</div>':''}${title('Готовы обсудить подбор?')}<p>Оставьте контакт для связи. Я уточню задачи семьи и расскажу, как проходит подбор.</p>${v===3?'<p class="s-signature">Анастасия</p>':tg()}${v===4?'<p class="s-contact-caption">Можно сразу написать мне лично.</p>':''}${v===3?scribble:''}</div>${form()}`;}
function footer() {return `<div class="s-footer-contact">${tg('Telegram')}<button type="button" class="s-privacy">О данных формы</button></div>`;}
const renderers={header,hero,service,about,process,pricing,reviews,apply,footer};
export function renderBlock(id,value,context={}) {
  const state=normalizeState(context.state),ctx={...context,state};
  const block=blocks.find(b=>b.id===id)??blocks[0];
  const v=variantNumber(block,value)||1;
  const previousReviews=id==='reviews'&&v===1&&ctx.state.version==='previous'?' s-reviews--previous':'';
  return `<${id==='header'?'header':id==='footer'?'footer':'section'} class="s-block s-${block.id} s-${block.id}--${v}${previousReviews}" ${context.library?'':`id="${block.id}"`} data-block="${block.id}" data-variant="${v}">${renderers[block.id](v,ctx)}</${id==='header'?'header':id==='footer'?'footer':'section'}>`;
}
export function renderSite(state) {
  const clean=normalizeState(state);
  const sections=new Map(blocks.map((block,index)=>[block.id,renderBlock(block.id,clean.layout[index],{state:clean})]));
  return ['header','hero','service','about','reviews','process','pricing','apply','footer'].map(id=>sections.get(id)).join('');
}
