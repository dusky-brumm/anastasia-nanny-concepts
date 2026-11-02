import {blocks,normalizeState,designUrl} from './model.js?v=a16bc04c38';
import {renderJourney} from '../journeys.js?v=a16bc04c38';

const telegram='https://t.me/inyfid';
const media='studio/media/';
const headline='Найду няню,<br>с которой <em>спокойно</em><br><span class="s-hero-tail">вам и хорошо ребёнку</span>';
const introduction='Я беру на себя поиск, собеседования и проверки. Вы знакомитесь с кандидатами, которые подходят именно вашей семье.';
const services=[
  ['Изучаю запрос семьи','Обсуждаем ваш график, правила, привычки ребёнка и ожидания от няни.'],
  ['Собеседую под вашу вакансию','Задаю ситуативные вопросы о задачах, с которыми няня встретится в вашей семье.'],
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
const brand='<span class="s-brand">НАСТЯ <i>·</i> ПОДБОР НЯНЬ</span>';
function linkTo(id,ctx) {return ctx.library?designUrl('preview.html',ctx.state,id):'#'+id;}
function action(ctx,label='Оставить заявку',secondary=false) {return `<a class="s-button${secondary?' s-button--light':''}" href="${linkTo('apply',ctx)}">${label}<span aria-hidden="true">↗</span></a>`;}
function tg(label='Написать в Telegram') {return `<a class="s-text-link" href="${telegram}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;}
function photo(type='cafe',cls='') {return type==='cafe'?`<figure class="s-photo s-cafe ${cls}"><img src="${media}cafe.webp" width="720" height="1280" alt="Анастасия в кафе" loading="lazy"></figure>`:`<figure class="s-photo ${cls}"><img src="${media}${type}.webp" alt="Анастасия с детьми" loading="lazy"></figure>`;}
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
  if(v===1)return `${copy}<div class="s-hero-art"><img src="assets/hero-collage.webp" width="273" height="386" alt="Фотография Анастасии в бумажной рамке с запиской" fetchpriority="high"></div>`;
  if(v===2)return `${copy}<div class="s-hero-strip">${photo('child')}${photo('cafe')}${photo('family')}</div>`;
  if(v===3)return `${photo('cafe','s-taped')}<div class="s-hero-letter">${copy}<blockquote class="s-quote-note">«Поиск с заботой<br>и вниманием к вашей семье»</blockquote></div>${sun}`;
  if(v===4)return `<div class="s-hero-panel">${copy}${scribble}</div>${photo('cafe','s-frame')}`;
  return `<p class="s-eyebrow">Анастасия Доронина · индивидуальный подбор</p><h1>${headline}</h1><div class="s-hero-bottom">${photo('family')}<div><p class="s-intro">${introduction}</p><div class="s-actions">${action(c)}${tg('Telegram')}</div>${scribble}</div></div>`;
}
function service(v) {
  const heading=title('Подробнее об услуге','Подбор под задачи<br>вашей семьи');
  if(v===5)return `${heading}<div class="s-service-panels"><article><span class="s-eyebrow">Ваш запрос</span><h3>График, привычки<br>и правила семьи</h3><p>${services[0][1]}</p><p>${services[1][1]}</p></article><article><span class="s-eyebrow">Результат подбора</span><h3>Подробные профили<br>и личные рекомендации</h3><p>${services[2][1]}</p><p>Обсуждаем каждого кандидата и готовимся к знакомству.</p></article></div>`;
  return `${heading}${v===3?scribble:''}${items(services)}`;
}
function about(v) {
  const text=`${title('Об Анастасии','Я знаю поиск<br><em>с обеих сторон</em>')}<p>${biography}</p><p>${background}</p><p class="s-signature">Анастасия Доронина</p>`;
  if(v===1)return `<div class="s-about-copy">${text}</div><img class="s-about-collage" src="assets/about-collage.webp" width="284" height="310" alt="Фотографии Анастасии в горах и с детьми" loading="lazy">`;
  if(v===2)return `${photo('cafe','s-frame')}<div class="s-about-copy">${text}<div class="s-tags"><span>Личное интервью</span><span>Поддержка семьи</span></div></div>`;
  if(v===3)return `<div class="s-letter"><span class="s-eyebrow">Об Анастасии</span><h2>Я знаю поиск<br><em>с обеих сторон</em></h2><p>${biography}</p><p>${background}</p><p class="s-signature">Анастасия Доронина</p>${scribble}</div>${photo('child','s-frame')}`;
  if(v===4)return `${title('Об Анастасии','Лично веду вашу семью<br>на каждом этапе')}<div class="s-album">${photo('family','s-taped')}<div><p>${biography}</p><p>${background}</p><p class="s-signature">Анастасия Доронина</p></div>${photo('child','s-frame')}</div>`;
  return `<div class="s-about-pair">${photo('cafe')}${photo('child')}</div><div class="s-about-copy">${text}</div>`;
}
function process(v) {
  return `${title('Как проходит подбор','Маршрут подбора')}${v<5?renderJourney(String(v)):`<ol class="s-outcomes">${outcomes.map(([a,b],i)=>`<li><span class="s-index">${i+1}</span><h3>${a}</h3><p>${b}</p></li>`).join('')}</ol>`}`;
}
function pricing(v,c) {
  const price=`<div class="s-price"><span class="s-eyebrow">Стоимость подбора</span><h3>1 оклад няни</h3><p>Предоплата — 25 000 ₽.<br>Остаток — после одной-двух пробных недель.</p>${action(c,'Обсудить подбор')}</div>`;
  const terms=items(conditions,'s-conditions');
  return `${title('Стоимость и условия','Понятные условия работы')}<div class="s-pricing-layout">${v===3?'<p class="s-document-label">Индивидуальный подбор · условия сотрудничества</p>':''}${price}${terms}</div><a class="s-terms-link" href="https://t.me/anastasiadoroninaa/123" target="_blank" rel="noopener noreferrer">Подробнее об условиях в Telegram ↗</a>`;
}
function reviewCard(row,i) {return `<article class="s-review"><span class="s-review-pin" aria-hidden="true"></span><span class="s-quote-mark" aria-hidden="true">“</span><blockquote>${row[2]}</blockquote><footer><img src="assets/${row[3]}.webp" width="40" height="40" alt=""><div><h3>${row[0]}</h3><p>${row[1]}</p></div></footer></article>`;}
function reviews(v) {return `${title('Отзывы','Что говорят семьи')}<div class="s-review-grid">${testimonials.map(reviewCard).join('')}</div><a class="s-text-link" href="https://t.me/anastasiadoroninaa" target="_blank" rel="noopener noreferrer">Больше отзывов в Telegram ↗</a>`;}
function form() {return `<form class="s-consult-form"><label>Ваше имя<input name="name" autocomplete="given-name" maxlength="80" required></label><label>Телефон или Telegram<input name="contact" autocomplete="tel" maxlength="100" required></label><label class="s-form-message">Несколько слов о запросе<textarea name="message" rows="3" maxlength="2000" placeholder="Возраст ребёнка, график и необходимая помощь"></textarea></label><button class="s-button" type="submit" disabled>Подготовить заявку <span aria-hidden="true">↗</span></button><p class="s-form-note">Вы получите текст сообщения для отправки Анастасии в Telegram. Данные здесь не сохраняются.</p><div class="s-draft" hidden><label>Текст заявки<textarea name="draft" rows="6" readonly></textarea></label><div class="s-actions"><button type="button" class="s-copy">Скопировать</button>${tg('Открыть Telegram')}</div><p role="status"></p></div></form>`;}
function apply(v) {return `<div class="s-apply-intro">${v===5?'<div class="s-apply-avatar">'+photo('cafe')+'</div>':''}${title('Оставьте заявку','Готовы обсудить<br>подбор?')}<p>Расскажите о вашей семье и задачах. Я свяжусь с вами, чтобы обсудить подбор.</p>${v===3?'<p class="s-signature">Анастасия</p>':tg()}${v===4?'<p class="s-contact-caption">Можно сразу написать мне лично.</p>':''}${v===3?scribble:''}</div>${form()}`;}
function footer(v,c) {return `<div class="s-footer-brand">${brand}${v===3||v===5?'<p>Индивидуальный подбор няни<br>для вашей семьи</p>':''}</div>${v!==2?nav(c):''}<div class="s-footer-contact">${tg('Связаться в Telegram')}<button type="button" class="s-privacy">О данных формы</button></div><p class="s-copyright">© 2026 Анастасия Доронина</p>`;}
const renderers={header,hero,service,about,process,pricing,reviews,apply,footer};
export function renderBlock(id,value,context={}) {
  const v=/^[1-5]$/.test(String(value))?Number(value):1;
  const state=normalizeState(context.state),ctx={...context,state};
  const block=blocks.find(b=>b.id===id)??blocks[0];
  return `<${id==='header'?'header':id==='footer'?'footer':'section'} class="s-block s-${block.id} s-${block.id}--${v}" ${context.library?'':`id="${block.id}"`} data-block="${block.id}" data-variant="${v}">${renderers[block.id](v,ctx)}</${id==='header'?'header':id==='footer'?'footer':'section'}>`;
}
export function renderSite(state) {const clean=normalizeState(state);return blocks.map((b,i)=>renderBlock(b.id,clean.layout[i],{state:clean})).join('');}
