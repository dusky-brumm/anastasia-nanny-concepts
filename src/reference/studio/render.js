import {blocks,normalizeState,designUrl,variantNumber} from './model.js?v=__VERSION__';
import {renderJourney} from '../journeys.js?v=__VERSION__';
import {contacts,selectionFaq} from './content.js?v=__VERSION__';

const telegram=contacts.telegram;
const media='studio/media/';
const headline='Найду няню, с\u00a0которой <em>спокойно вам</em> и\u00a0хорошо ребёнку';
const introduction='Я беру на себя поиск, собеседования и проверки. Вы знакомитесь с кандидатами, которые подходят именно вашей семье.';
const services=[
  ['Изучаю запрос семьи','Обсуждаем ваш график, правила, привычки ребёнка и ожидания от няни.'],
  ['Провожу личные интервью','Обсуждаю с кандидатами именно вашу вакансию: от режима малыша до уроков и отношений между детьми.'],
  ['Даю личные рекомендации','Вы получаете подробные профили кандидатов, мои комментарии и помощь с выбором.'],
];
const biography='С 2022 года подбираю нянь в семьи. Работала в двух агентствах, сейчас веду подбор лично.';
const background='До рекрутинга пять лет работала с детьми — няней, тренером, педагогом. Изучала детскую психологию и прошла профессиональную переподготовку по подбору домашнего персонала.';
const conditions=[['Неограниченное количество анкет','Продолжаем поиск подходящего кандидата.'],['Гарантия замены — 6 месяцев','Если сотрудничество не сложилось, подберу замену бесплатно.'],['Личное сопровождение','Помогаю с выбором, знакомством и адаптацией няни.']];
const testimonials=[
  ['Наталья','мама двоих детей','Настя помогла найти няню для дочки. Очень внимательная, отвечает быстро, понимает, что нужно семье. Няня уже полгода с нами — всё отлично!','natalia'],
  ['Юлия','мама мальчика, 4 года','Спасибо за подбор чудесной няни! Настя провела собеседования, проверила рекомендации и была рядом до самого выхода на работу. Очень спокойный и надёжный человек.','julia'],
  ['Анастасия','мама девочки, 6 лет','Мы искали няню через агентства, но всё не то. Настя подошла по-человечески и учла все детали, предложила подходящих кандидатов. Рекомендуем!','anastasia'],
];
const outcomes=[['Заявка','Обсуждаем семью, задачи, график и ваши пожелания.'],['Портрет няни','Вы согласовываете критерии поиска и подробное описание вакансии.'],['Поиск и интервью','Получаете подходящие профили с моими личными комментариями.'],['Знакомство','Встречаетесь с кандидатами и выбираете няню для пробных дней.'],['Сопровождение','Получаете поддержку после выхода няни и гарантию замены на шесть месяцев.']];
const scribble='<svg class="s-scribble" viewBox="0 0 130 40" aria-hidden="true"><path d="M3 29C25 3 54 5 62 21s-17 24-16 6S100 3 124 19m-8-3 10 3-7 8"/></svg>';
const sun='<svg class="s-sun" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="11"/><path d="M30 2v10m0 36v10M2 30h10m36 0h10M10 10l7 7m26 26 7 7M10 50l7-7m26-26 7-7"/></svg>';
const brand='<span class="s-brand"><strong>Настя</strong><span>подбор нянь</span></span>';
function linkTo(id,ctx) {return ctx.library?designUrl('preview.html',ctx.state,id):'#'+id;}
function action(ctx,label='Оставить заявку',secondary=false) {return `<a class="s-button${secondary?' s-button--light':''}" href="${linkTo('apply',ctx)}">${label}<span aria-hidden="true">→</span></a>`;}
function tg(label='Написать в Telegram') {return `<a class="s-text-link" href="${telegram}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;}
function photo(type='cafe',cls='',priority=false) {
  const load=`loading="${priority?'eager':'lazy'}"${priority?' fetchpriority="high"':''}`;
  const image=type==='cafe'?`<img src="${media}cafe.webp" width="720" height="1280" alt="Анастасия Доронина — специалист по подбору нянь" ${load}>`:`<img src="${media}${type}.webp" width="${type==='family'?960:640}" height="${type==='family'?1280:640}" alt="Анастасия ${type==='family'?'с детьми':'с ребёнком'}" ${load}>`;
  return `<figure class="s-photo ${type==='cafe'?'s-cafe ':''}${cls}"><div class="s-photo-mask">${image}</div></figure>`;
}
function portraitComposition(priority=false) {
  return `<div class="s-live-portrait"><span class="s-photo-backing" aria-hidden="true"></span>${photo('cafe','s-live-frame',priority)}<span class="s-paper-tape" aria-hidden="true"></span><img class="s-portrait-flowers" src="assets/flowers.webp" width="70" height="114" alt=""><div class="s-handwritten-note"><p>Поиск с заботой<br>и вниманием<br>к вашей семье</p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27 5 15C-2 7 9 1 16 9 23 0 35 8 27 16Z"/></svg></div></div>`;
}
function photoAlbum() {return `<div class="s-live-album">${photo('family','s-album-main s-frame')}${photo('child','s-album-small s-frame')}${photo('cafe','s-album-mini s-frame')}${sun}</div>`;}
function title(eyebrow,text) {return `<div class="s-section-heading"><p class="s-eyebrow">${eyebrow}</p><h2>${text}</h2></div>`;}
function items(list,cls='') {return `<div class="s-items ${cls}">${list.map(([a,b],i)=>`<article><span class="s-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${a}</h3><p>${b}</p></article>`).join('')}</div>`;}
function nav(ctx,cls='') {return `<nav class="s-nav ${cls}" aria-label="Меню сайта">${[['service','О подборе'],['about','Обо мне'],['process','Этапы'],['pricing','Стоимость'],['reviews','Отзывы']].map(([id,name])=>`<a href="${linkTo(id,ctx)}">${name}</a>`).join('')}</nav>`;}
function menu(ctx) {return `<details class="s-menu"><summary aria-label="Открыть меню"><span></span><span></span><span></span></summary>${nav(ctx,'s-menu-links')}</details>`;}
function header(v,c) {
  const logo=`<a href="${linkTo('hero',c)}" class="s-brand-link">${brand}</a>`;
  if(v===2)return `<div class="s-header-top">${tg('Telegram')}${logo}${action(c,'Обсудить подбор')}</div>${nav(c)}${menu(c)}`;
  if(v===4)return `<div class="s-header-top">${logo}<p>Индивидуальный подбор няни</p>${tg('Telegram')}</div><div class="s-header-bottom">${nav(c)}${action(c,'Оставить заявку')}${menu(c)}</div>`;
  return `${logo}${v===5?'<p class="s-header-caption">Личный подбор для вашей семьи</p>':nav(c)}${v===5?tg('Telegram'):action(c,'Оставить заявку')}${menu(c)}`;
}
function hero(v,c) {
  const copy=`<div class="s-hero-copy"><p class="s-eyebrow">Персональный подбор няни</p><h1>${headline}</h1><p class="s-intro">${introduction}</p><div class="s-actions">${action(c)}${tg('Telegram')}</div></div>`;
  if(v===1)return `${copy}${portraitComposition(!c.library)}`;
  if(v===2)return `${copy}<div class="s-hero-strip">${photo('child')}${photo('cafe','',!c.library)}${photo('family')}</div>`;
  if(v===3)return `${photo('cafe','s-taped',!c.library)}<div class="s-hero-letter">${copy}<blockquote class="s-quote-note">«Поиск с заботой<br>и вниманием к вашей семье»</blockquote></div>${sun}`;
  if(v===4)return `<div class="s-hero-panel">${copy}${scribble}</div>${photo('cafe','s-frame',!c.library)}`;
  return `<p class="s-eyebrow">Анастасия Доронина · индивидуальный подбор</p><h1>${headline}</h1><div class="s-hero-bottom">${photo('family','',!c.library)}<div><p class="s-intro">${introduction}</p><div class="s-actions">${action(c)}${tg('Telegram')}</div>${scribble}</div></div>`;
}
function service(v) {
  const heading=title('Подробнее об услуге','Подбор няни<br>под задачи вашей семьи');
  if(v===5)return `${heading}<div class="s-service-panels"><article><span class="s-eyebrow">Ваш запрос</span><h3>График, привычки<br>и правила семьи</h3><p>${services[0][1]}</p><p>${services[1][1]}</p></article><article><span class="s-eyebrow">Результат подбора</span><h3>Подробные профили<br>и личные рекомендации</h3><p>${services[2][1]}</p><p>Обсуждаем каждого кандидата и готовимся к знакомству.</p></article></div>`;
  return `${heading}${v===3?scribble:''}${items(services)}`;
}
function about(v) {
  const text=`${title('Об Анастасии','Я знаю поиск<br><em>с обеих сторон</em>')}<p>${biography}</p><p>${background}</p><p class="s-signature">Анастасия Доронина</p>`;
  if(v===1)return `<div class="s-about-copy">${text}</div>${photoAlbum()}`;
  if(v===2)return `${photo('cafe','s-frame')}<div class="s-about-copy">${text}<div class="s-tags"><span>Личное интервью</span><span>Поддержка семьи</span></div></div>`;
  if(v===3)return `<div class="s-letter"><span class="s-eyebrow">Об Анастасии</span><h2>Я знаю поиск<br><em>с обеих сторон</em></h2><p>${biography}</p><p>${background}</p><p class="s-signature">Анастасия Доронина</p>${scribble}</div>${photo('child','s-frame')}`;
  if(v===4)return `${title('Об Анастасии','Лично веду подбор<br>на каждом этапе')}<div class="s-album">${photo('family','s-taped')}<div><p>${biography}</p><p>${background}</p><p class="s-signature">Анастасия Доронина</p></div>${photo('child','s-frame')}</div>`;
  return `<div class="s-about-pair">${photo('cafe')}${photo('child')}</div><div class="s-about-copy">${text}</div>`;
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
  const heading=v===6?'Как всё проходит':v===7?'Маршрут <em>подбора</em>':'Маршрут подбора';
  const steps=v<5?renderJourney(String(v)):v===5?`<ol class="s-outcomes">${outcomes.map(([a,b],i)=>`<li><span class="s-index">${i+1}</span><h3>${a}</h3><p>${b}</p></li>`).join('')}</ol>`:routeComparison(v);
  return title('Как проходит подбор няни',heading)+steps;
}
function faq() {return `<div class="s-faq"><h3>Вопросы о подборе няни</h3>${selectionFaq.map(item=>`<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join('')}</div>`;}
function pricing(v,c) {
  const price=`<div class="s-price"><span class="s-eyebrow">Разовая оплата</span><h3>1 оклад няни</h3><p>Предоплата — 25&nbsp;000&nbsp;₽.<br>Остаток — после одной-двух пробных недель.</p>${action(c,'Обсудить подбор')}</div>`;
  const terms=items(conditions,'s-conditions');
  return `${title('Условия работы','Стоимость подбора няни')}<div class="s-pricing-layout">${v===3?'<p class="s-document-label">Индивидуальный подбор · условия сотрудничества</p>':''}${price}${terms}</div><a class="s-terms-link" href="${contacts.terms}" target="_blank" rel="noopener noreferrer">Подробнее об условиях в Telegram ↗</a>${faq()}`;
}
function reviewCard([name,role,quote,avatar],heart='') {
  return `<article class="s-review"><span class="s-quote-mark" aria-hidden="true">“</span><blockquote>${quote}</blockquote><footer><img src="assets/${avatar}.webp" width="40" height="40" loading="lazy" alt=""><div><h3>${name}</h3><p>${role}</p></div></footer>${heart}</article>`;
}
function reviews(v,c) {
  if(v===1&&c.state.palette==='sky-previous') {
    const pin='<span class="s-review-pin" aria-hidden="true"></span>';
    return `${title('Отзывы','Что говорят семьи')}<div class="s-review-grid">${testimonials.map(row=>reviewCard(row,pin)).join('')}</div><a class="s-text-link" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Больше отзывов в Telegram ↗</a>`;
  }
  if(v===1) {
    const sparkle='<svg class="s-review-sparkle" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2C16 11 11 16 2 16c9 0 14 5 14 14 0-9 5-14 14-14C21 16 16 11 16 2Z"/></svg>';
    const heart='<svg class="s-review-heart" viewBox="0 0 54 50" aria-hidden="true"><path d="M15 42C12 33 4 10 16 10c6 0 7 7 7 13C30 7 45 3 48 13c3 10-17 22-33 29 10-2 18-3 26-2"/></svg>';
    const [natalia,julia,anastasia]=testimonials;
    return `<div class="s-review-heading"><h2>Отзывы${sparkle}</h2><a class="s-review-more" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Смотреть больше отзывов <span aria-hidden="true">→</span></a></div><div class="s-review-grid">${reviewCard(anastasia)}${reviewCard(natalia)}${reviewCard(julia,heart)}</div>`;
  }
  return `${title('Отзывы','Что говорят семьи')}<div class="s-review-grid">${testimonials.map(row=>reviewCard(row)).join('')}</div><a class="s-text-link" href="${contacts.channel}" target="_blank" rel="noopener noreferrer">Больше отзывов в Telegram ↗</a>`;
}
function form() {return `<form class="s-consult-form"><label>Ваше имя<input name="name" autocomplete="given-name" maxlength="80" required></label><label>Телефон или Telegram<input name="contact" autocomplete="tel" maxlength="100" required></label><label class="s-form-message">Несколько слов о запросе<textarea name="message" rows="3" maxlength="2000" placeholder="Возраст ребёнка, график и необходимая помощь"></textarea></label><button class="s-button" type="submit" disabled>Подготовить заявку <span aria-hidden="true">→</span></button><p class="s-form-note">Вы получите текст сообщения для отправки Анастасии в Telegram. Данные здесь не сохраняются.</p><div class="s-draft" hidden><label>Текст заявки<textarea name="draft" rows="6" readonly></textarea></label><div class="s-actions"><button type="button" class="s-copy">Скопировать</button>${tg('Открыть Telegram')}</div><p role="status"></p></div></form>`;}
function apply(v) {return `<div class="s-apply-intro">${v===5?'<div class="s-apply-avatar">'+photo('cafe')+'</div>':''}${title('Оставьте заявку','Готовы обсудить подбор?')}<p>Оставьте контакт для связи. Я уточню задачи семьи и расскажу, как проходит подбор.</p>${v===3?'<p class="s-signature">Анастасия</p>':tg()}${v===4?'<p class="s-contact-caption">Можно сразу написать мне лично.</p>':''}${v===3?scribble:''}</div>${form()}`;}
function footer(v,c) {return `<div class="s-footer-brand">${brand}${v===3||v===5?'<p>Индивидуальный подбор няни<br>для вашей семьи</p>':''}</div>${v!==2?nav(c):''}<div class="s-footer-contact">${tg('Связаться в Telegram')}<button type="button" class="s-privacy">О данных формы</button></div><p class="s-copyright">© 2026 Анастасия Доронина</p>`;}
const renderers={header,hero,service,about,process,pricing,reviews,apply,footer};
export function renderBlock(id,value,context={}) {
  const state=normalizeState(context.state),ctx={...context,state};
  const block=blocks.find(b=>b.id===id)??blocks[0];
  const v=variantNumber(block,value)||1;
  const previousReviews=id==='reviews'&&v===1&&ctx.state.palette==='sky-previous'?' s-reviews--previous':'';
  return `<${id==='header'?'header':id==='footer'?'footer':'section'} class="s-block s-${block.id} s-${block.id}--${v}${previousReviews}" ${context.library?'':`id="${block.id}"`} data-block="${block.id}" data-variant="${v}">${renderers[block.id](v,ctx)}</${id==='header'?'header':id==='footer'?'footer':'section'}>`;
}
export function renderSite(state) {const clean=normalizeState(state);return blocks.map((b,i)=>renderBlock(b.id,clean.layout[i],{state:clean})).join('');}
