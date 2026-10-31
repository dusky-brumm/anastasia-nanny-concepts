import {designs} from './catalog.mjs';
import {reviews} from '../studio/content.mjs';
export {reviews};

export const headline = 'Найду няню, с которой спокойно вам и хорошо ребёнку';
export const intro = 'Беру на себя поиск, собеседования и проверку рекомендаций. По каждому кандидату готовлю подробный профиль и личные комментарии.';
export const biography = '<p>С 2022 года подбираю нянь для семей. Работала в двух агентствах, сейчас веду подбор самостоятельно.</p><p>До этого пять лет работала с детьми: няней, тренером и педагогом. Этот опыт помогает учитывать запрос родителей и повседневные задачи няни.</p>';
export const approach = [
  {title:'Обсуждаем запрос',text:'Уточняем график, обязанности, возраст ребёнка и правила вашей семьи.'},
  {title:'Провожу интервью',text:'Задаю вопросы под вашу вакансию: об уходе за малышом, уроках или конфликтах между детьми.'},
  {title:'Представляю кандидатов',text:'Готовлю подробные профили с личными комментариями. Обсуждаем опыт, подход к детям и вопросы для встречи.'},
];
export const stages = [
  {title:'Запрос семьи',action:'Обсуждаем возраст ребёнка, график, обязанности и ваши ожидания.',result:'Согласованные требования к няне.'},
  {title:'Поиск и интервью',action:'Отбираю кандидатов и собеседую под вашу вакансию. Уточняю опыт и рекомендации.',result:'Кандидатуры, подходящие по опыту, условиям и подходу к детям.'},
  {title:'Профили кандидатов',action:'Готовлю подробные профили. Обсуждаем мои комментарии и ваши вопросы.',result:'Информация для выбора кандидатов, с которыми вы хотите встретиться.'},
  {title:'Знакомство и пробы',action:'Помогаю организовать встречи и обсудить первые дни работы.',result:'Возможность оценить няню в повседневных задачах вашей семьи.'},
  {title:'Сопровождение',action:'Остаюсь на связи после выхода няни и помогаю с возникающими вопросами.',result:'Поддержка и бесплатная замена в течение 6 месяцев.'},
];
export const services = [
  {key:'selection',title:'Личный подбор няни',price:'от 25 000 ₽',intro:'Поиск и сопровождение от обсуждения запроса до начала работы няни.',features:['Собеседования под задачи семьи','Подробные профили и личные комментарии','Неограниченное количество кандидатов','Бесплатная замена в течение 6 месяцев'],terms:'Полная оплата после 1–2 пробных недель. Ориентир поиска — 1–1,5 месяца.',action:'Обсудить подбор'},
  {key:'consultation',title:'Личная консультация',price:'5 500 ₽',intro:'Подготовка к самостоятельному поиску и собеседованиям.',features:['Уточнение запроса и требований','Текст вакансии','Вопросы и чек-листы для интервью','Ответы на вопросы в течение двух недель'],terms:'Продолжительность консультации — 1,5–2 часа.',action:'Обсудить консультацию'},
];
export const telegram = 'https://t.me/inyfid';
export const tg = (label='Написать в Telegram') => `<a class="telegram-link" href="${telegram}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span></a>`;
export const button = (label='Оставить заявку',service='Личный подбор няни',className='') => `<a class="button ${className}" href="#request" data-service="${service}">${label}<span aria-hidden="true">↗</span></a>`;
export const actions = () => `<div class="actions">${button()}${tg('Telegram')}</div>`;
export const heading = (label,title,text='') => `<div class="section-heading"><span class="eyebrow">${label}</span><h2>${title}</h2>${text?`<p>${text}</p>`:''}</div>`;
export const section = (id,content,className='') => `<section class="section ${className}" id="${id}" data-section="${id}"><div class="container">${content}${id==='pricing'?'<p class="pricing-note">Стоимость и сроки уточняются перед началом работы.</p>':''}</div></section>`;

const dimensions = {'nastya-family':[960,1280],'nastya-child':[640,640]};
export function photo(name,alt,eager=false) {
  const [width,height] = dimensions[name];
  return `<img src="../assets/${name}.webp" width="${width}" height="${height}" alt="${alt}" ${eager?'fetchpriority="high"':'loading="lazy" decoding="async"'}>`;
}
export const cafe = (eager=false,className='') => `<div class="cafe-crop ${className}"><img src="media/cafe-story.webp" width="720" height="1280" alt="Анастасия за столиком в кафе" ${eager?'fetchpriority="high"':'loading="lazy" decoding="async"'}></div>`;
export const requestCopy = '<p>Укажите возраст ребёнка, график и то, какая помощь нужна вашей семье.</p>';
export const termsMarkup = text => text.replace(/(\d+(?:,\d+)?–\d+(?:,\d+)?)(\s+(?:пробных недель|месяца|часа))/g,'<span class="term-range">$1$2</span>');
export function profileSample() {
  const fields = [['Опыт','Возраст детей и обязанности на предыдущих местах работы.'],['Интервью','Как няня действует в ситуациях, важных вашей семье.'],['Рекомендации','Что удалось уточнить у предыдущих работодателей.'],['Мои комментарии','Сильные стороны и вопросы для личной встречи.']];
  return `<div class="profile-sample"><span class="eyebrow">Профиль кандидата</span><h3>Что вы узнаете о няне</h3><dl>${fields.map(([title,text])=>`<div><dt>${title}</dt><dd>${text}</dd></div>`).join('')}</dl><p class="small-note">Пример содержания профиля, без данных конкретного кандидата.</p></div>`;
}
export function form(id) {
  return `<form data-request-form>
    <label class="service-field" for="${id}-service">Какая помощь вам нужна?<select id="${id}-service" name="service" aria-describedby="${id}-price">${services.map(service=>`<option value="${service.title}" data-service-key="${service.key}" data-price="${service.price}">${service.key==='selection'?'Подбор няни':'Консультация'}</option>`).join('')}</select></label>
    <p class="request-price-summary" id="${id}-price" data-request-price-summary aria-live="polite" hidden><span><span class="price-caption">Стоимость</span><strong data-request-price></strong></span><a href="#pricing" data-view-conditions>Условия ↑</a></p>
    <div class="field-pair"><label for="${id}-name">Ваше имя<input id="${id}-name" name="name" required autocomplete="given-name" maxlength="80" placeholder="Имя"></label><label for="${id}-contact">Телефон или Telegram<input id="${id}-contact" name="contact" required autocomplete="tel" maxlength="100" placeholder="Номер / @username"></label></div>
    <label for="${id}-message">Кратко о запросе<textarea id="${id}-message" name="message" rows="3" maxlength="2000" placeholder="Возраст ребёнка, график и обязанности няни"></textarea></label>
    <p class="form-note">Форма готовит сообщение для Telegram. Вы отправляете его самостоятельно; здесь данные не сохраняются.</p>
    <button class="button" type="submit" disabled>Подготовить заявку<span aria-hidden="true">↗</span></button><p class="form-result" role="status" hidden></p><button class="privacy-link" type="button" data-dialog="privacy-info">О данных формы</button><noscript>Для подготовки сообщения включите JavaScript или напишите Анастасии в Telegram.</noscript>
  </form>`;
}

const menu = '<a href="#service">О подборе</a><a href="#about">Обо мне</a><a href="#process">Этапы</a><a href="#pricing">Стоимость</a><a href="#reviews">Отзывы</a>';
function header() {
  return `<header class="site-header" data-section="header"><div class="container"><a class="brand" href="#top">Анастасия Доронина<span>Индивидуальный подбор няни</span></a><nav class="desktop-menu" aria-label="Основное меню">${menu}</nav><a class="header-action" href="#request">Оставить заявку</a><button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button><nav id="mobile-menu" aria-label="Мобильное меню" hidden>${menu}<a href="#request">Оставить заявку</a></nav></div></header>`;
}
function footer() {
  return `<footer class="site-footer" data-section="footer"><div class="container footer-grid"><a class="brand" href="#top">Анастасия Доронина<span>Индивидуальный подбор няни</span></a><nav aria-label="Контакты и информация">${tg('Telegram Анастасии')}<button type="button" class="privacy-link" data-dialog="privacy-info">О данных формы</button><a href="#top">Наверх ↑</a></nav><span class="copyright">© 2026 Анастасия Доронина</span></div></footer>`;
}
function privacy() {
  return '<dialog id="privacy-info"><button type="button" class="close-dialog" aria-label="Закрыть окно">×</button><h2>О данных формы</h2><p>Текст заявки составляется в вашем браузере. Данные здесь не сохраняются и автоматически не отправляются. Вы можете скопировать сообщение и отправить его Анастасии в Telegram.</p><p>Перед подключением отправки заявок будут согласованы документы об обработке персональных данных.</p></dialog>';
}
export function frame({id,body,version='1'}) {
  const index = designs.findIndex(design=>design.id===id);
  if(index<0) throw new Error(`Unknown next design: ${id}`);
  const design = designs[index], previous = designs[(index+designs.length-1)%designs.length], next = designs[(index+1)%designs.length];
  const content = body.replace(/<br\s*\/?>/gi,'<br> ');
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#edf2ef"><title>${design.name} — Анастасия Доронина</title><meta name="description" content="Индивидуальный подбор няни: собеседования под задачи семьи, подробные профили и личное сопровождение."><link rel="icon" href="../assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="fonts.css?v=${version}"><link rel="stylesheet" href="base.css?v=${version}"><link rel="stylesheet" href="${id}.css?v=${version}"><script type="module" src="site.js?v=${version}"></script><script type="module" src="motion.js?v=${version}"></script></head><body class="next-${id} ${design.mode==='sans'?'sans-headings':''}"><a class="skip-link" href="#main">Перейти к содержанию</a><div class="review-bar" data-review-ui><div class="review-start"><a href="../next.html?v=${version}#${id}">← Пять новых дизайнов</a><button type="button" class="motion-toggle" data-motion-toggle aria-pressed="false" hidden>Анимация: выкл</button></div><nav class="review-switch" aria-label="Переключение дизайнов"><a href="${previous.id}.html?v=${version}" aria-label="Предыдущий вариант: ${previous.name}">←</a><span>0${index+1} / 05 <span class="review-name">· ${design.name}</span></span><a href="${next.id}.html?v=${version}" aria-label="Следующий вариант: ${next.name}">→</a></nav></div><div class="site-shell" id="top">${header()}<main id="main">${content}</main>${footer()}</div>${privacy()}</body></html>`;
}
