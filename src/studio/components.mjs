import { approach, stages, reviews, services, faq } from './content.mjs';

export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icon = (name, className = '') => `<svg class="${className}" aria-hidden="true"><use href="#${name}"/></svg>`;
export const photo = (name, { className = '', alt = '', eager = false } = {}) => {
  const size = { 'nastya-child': [640,640], 'nastya-family': [960,1280], consultation: [736,977], play: [736,1104] }[name];
  return `<img class="${className}" src="../assets/${name}.webp" width="${size[0]}" height="${size[1]}" alt="${escape(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
};
export const cta = (text = 'Обсудить подбор', extra = '') => `<a class="action" href="#request" ${extra}>${text}${icon('arrow')}</a>`;
export const telegram = () => `<a class="telegram" href="https://t.me/anastasiadoroninaa" target="_blank" rel="noopener noreferrer">${icon('plane')}Telegram <span>↗</span></a>`;
export const heading = (label, title, text = '') => `<div class="section-heading"><div><span class="eyebrow">${label}</span><h2>${title}</h2></div>${text ? `<p>${text}</p>` : ''}</div>`;

export function renderAbout(style) {
  const title = '<span class="eyebrow">ПРИВЕТ, Я НАСТЯ</span><h2>Я знаю поиск<br><em>с обеих сторон.</em></h2>';
  const paragraphs = `<p>С 2022 года подбираю нянь для семей. Работала в двух агентствах, а сейчас веду семьи индивидуально — от первого разговора до выхода няни на работу.</p><p>До подбора пять лет работала с детьми: няней, тренером и педагогом. Поэтому понимаю и ожидания родителей, и то, что важно человеку, которого вы приглашаете в семью.</p>`;
  const note = `<blockquote class="hand-note">Мне важно, чтобы вам было спокойно,<br>а няне и ребёнку — хорошо вместе.</blockquote>`;
  const image = photo('nastya-family', { alt: 'Анастасия с детьми на природе' });
  let content;
  if (style === 'interview') content = `${title}<div class="about-interview"><div class="interview-portrait">${image}<span class="hand-note">Давайте знакомиться ♡</span></div><dl><div><dt>Как вы пришли в подбор?</dt><dd>С 2022 года работала в двух агентствах. Сейчас веду семьи лично, от первого разговора до начала работы няни.</dd></div><div><dt>Почему «с обеих сторон»?</dt><dd>До подбора пять лет работала с детьми: няней, тренером и педагогом. Я понимаю, что важно и семье, и няне.</dd></div><div><dt>Что важно вам в работе?</dt><dd>Чтобы люди совпали по ценностям и могли построить спокойное сотрудничество.</dd></div></dl></div>`;
  else if (style === 'columns') content = `${title}<div class="about-columns"><div>${paragraphs}</div><figure>${image}<figcaption>В работе и в жизни — про людей.</figcaption></figure>${note}</div>`;
  else if (style === 'letter') content = `<div class="about-letter"><aside>${photo('nastya-child',{alt:'Анастасия с малышом'})}<span class="hand-note">С вниманием к вашей семье.</span></aside><article>${title}${paragraphs}${note}</article></div>`;
  else content = `<div class="about-split">${style === 'sidebar' ? '' : `<figure>${image}<figcaption class="hand-note">Люблю людей. И своё дело.</figcaption></figure>`}<article>${title}${paragraphs}${note}<a class="text-link" href="https://t.me/anastasiadoroninaa/103" target="_blank" rel="noopener noreferrer">Больше о моём подходе ↗</a></article>${style === 'sidebar' ? `<aside>${image}<span class="hand-note">Ваш человек<br>в поиске няни.</span></aside>` : ''}</div>`;
  return `<section class="section about about-variant-${style}" id="about"><div class="inner">${content}</div></section>`;
}

export function renderApproach(style) {
  let content;
  if (style === 'paired') content = `<div class="approach-paired"><div class="pair-head"><span>Что важно вашей семье</span><span>Как я учитываю это в подборе</span></div>${approach.map(item=>`<article><h3>${item.need}</h3><div>${icon(item.icon)}<h4>${item.action}</h4><p>${item.description}</p></div></article>`).join('')}</div>`;
  else if (style === 'document') content = `<div class="approach-document"><article><span class="eyebrow">ПРИМЕР СТРУКТУРЫ ПРОФИЛЯ</span><h3>За анкетой —<br>живой человек.</h3><p>Такой контекст я помогаю увидеть семье. Это пример структуры, а не анкета вымышленного кандидата.</p><div class="profile-topics"><span>Опыт и реальные задачи</span><span>Ответы на ситуации вашей семьи</span><span>Сильные стороны и нюансы</span><span>Мои личные рекомендации</span></div></article><div>${approach.map(item=>`<section>${icon(item.icon)}<h3>${item.title}</h3><p>${item.description}</p></section>`).join('')}</div></div>`;
  else if (style === 'interview') content = `<div class="approach-interview"><p class="hand-note">У вашей семьи — свои вопросы.</p>${[['Малыш','Как помочь ребёнку привыкнуть к новому взрослому, если мама рядом?'],['Дошкольник','Ребёнок расстроился и не хочет собираться на прогулку. Как вы поступите?'],['Школьники','Один не хочет делать уроки, а второй мешает и ссорится. Что будете делать?']].map(([label,question])=>`<details><summary>${label}<span>+</span></summary><p>«${question}»</p><small>Иллюстративная тема интервью: обсуждаем ход мысли и близость ваших ценностей.</small></details>`).join('')}<div class="approach-bottom">${approach.map(item=>`<article><h3>${item.title}</h3><p>${item.description}</p></article>`).join('')}</div></div>`;
  else content = `<div class="approach-items">${approach.map(item=>`<article>${icon(item.icon)}<div><h3>${item.title}</h3><p>${item.description}</p></div>${style==='notes'?`<span class="hand-note">${item.short}</span>`:''}</article>`).join('')}</div>`;
  return `<section class="section approach approach-variant-${style}" id="approach"><div class="inner">${heading('ВОВЛЕЧЁННЫЙ ПОДБОР','Чтобы совпали<br><em>не только графики.</em>','Знакомлюсь с вашей семьёй и провожу интервью под ваш запрос, чтобы найти близкого вам человека.')}${content}</div></section>`;
}

export function renderRoute(style) {
  let content;
  if (style === 'accordion') content = `<div class="route-accordion">${stages.map((s,i)=>`<details id="stage-${s.key}" ${i===0?'open':''}><summary>${icon(s.icon)}<span>${s.title}</span><b>+</b></summary><div><p>${s.action}</p><p><strong>Для вашей семьи</strong>${s.result}</p></div></details>`).join('')}</div>`;
  else if (style === 'table') content = `<div class="route-table"><div class="route-table-head"><span>Этап</span><span>Что я делаю</span><span>Что получает семья</span></div>${stages.map(s=>`<article id="stage-${s.key}"><h3>${icon(s.icon)}${s.title}</h3><p>${s.action}</p><p class="route-deliverable">${s.result}</p></article>`).join('')}</div>`;
  else content = `<ol class="route-items">${stages.map(s=>`<li id="stage-${s.key}">${icon(s.icon)}<div><h3>${s.title}</h3><p>${s.action}</p>${style!=='rail'?`<span class="route-deliverable">${s.result}</span>`:''}</div></li>`).join('')}</ol>`;
  return `<section class="section route route-variant-${style}" id="route"><div class="inner">${heading('МАРШРУТ ПОДБОРА','От первого «привет»<br><em>до вашей няни.</em>','На каждом этапе рядом со мной. Можно спрашивать, сомневаться и обсуждать.')}${content}</div></section>`;
}

export function renderReviews(style) {
  const quote = (review,index) => `<figure class="review review-${index}"><span class="quote-mark" aria-hidden="true">“</span><blockquote>${review.text}</blockquote><figcaption><span class="initial">${review.initial}</span><div><strong>${review.name}</strong><small>${review.detail}</small></div>${icon('heart')}</figcaption></figure>`;
  return `<section class="section reviews reviews-${style}" id="reviews"><div class="inner">${heading('ОТЗЫВЫ СЕМЕЙ','Когда стало <em>спокойнее.</em>')}<p class="source-note">Отзывы из предоставленных макетов. Тексты и согласия подтвердим перед рабочим запуском.</p><div class="review-items">${reviews.map(quote).join('')}</div></div></section>`;
}

export function renderPricing(style) {
  const card = s=>`<article><span class="eyebrow">${s.label}</span><h3>${s.title}</h3><p>${s.description}</p><ul>${s.features.map(f=>`<li>${f}</li>`).join('')}</ul><div class="price">${s.price}</div><small>${s.footnote}</small>${cta(s.key==='selection'?'Обсудить подбор':'Обсудить консультацию',`data-service="${s.title}"`)}</article>`;
  let content;
  if (style==='ledger') content=`<div class="pricing-ledger">${services.map(s=>`<article><div><span class="eyebrow">${s.label}</span><h3>${s.title}</h3><p>${s.description}</p></div><ul>${s.features.map(f=>`<li>${f}</li>`).join('')}</ul><div><span class="price">${s.price}</span><small>${s.footnote}</small>${cta('Обсудить',`data-service="${s.title}"`)}</div></article>`).join('')}</div>`;
  else if(style==='paper') content=`<div class="pricing-paper"><aside>${photo('consultation',{alt:''})}<span class="hand-note">Спокойнее, когда понятно,<br>с чего начать.</span></aside><div>${services.map(card).join('')}</div></div>`;
  else content=`<div class="pricing-items">${services.map(card).join('')}</div>`;
  return `<section class="section pricing pricing-variant-${style}" id="pricing"><div class="inner">${heading('УСЛОВИЯ И СТОИМОСТЬ','Понятная помощь.<br><em>Прозрачные условия.</em>')}<p class="source-note">Стоимость и условия из предоставленного PDF-макета. До рабочего запуска нужно подтвердить их актуальность.</p>${content}<div class="conditions"><span>${icon('leaf')}Неограниченное количество кандидатов</span><span>${icon('shield')}Гарантия замены 6 месяцев</span><span>${icon('chat')}Личная связь со мной</span></div></div></section>`;
}

export function renderFAQ() {
  return `<section class="section questions" id="questions"><div class="inner question-grid"><div><span class="eyebrow">МОЖНО СПРОСИТЬ</span><h2>Если вы пока<br><em>сомневаетесь.</em></h2><p>Можно начать с разговора, даже если запрос ещё не сложился.</p></div><div>${faq.map(([q,a])=>`<details><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join('')}</div></div></section>`;
}

export function renderRequest() {
  return `<section class="section request" id="request"><div class="inner request-grid"><div class="request-intro"><span class="eyebrow">НАЧНЁМ СО ЗНАКОМСТВА</span><h2>Давайте найдём<br><em>вашего человека.</em></h2><p>Расскажите немного о вашей семье. Я помогу понять, с чего начать.</p>${telegram()}<p class="hand-note">Хорошее начинается<br>с простого «привет» ♡</p></div><form data-request-form class="studio-form"><h3>Расскажите о себе</h3><fieldset><legend>Какая помощь вам нужна?</legend><label><input type="radio" name="service" value="Личный подбор няни" checked>Подбор няни</label><label><input type="radio" name="service" value="Личная консультация">Консультация</label></fieldset><label for="family-name">Ваше имя<input id="family-name" name="name" autocomplete="given-name" required maxlength="80" placeholder="Как к вам обращаться"></label><label for="family-contact">Телефон или Telegram<input id="family-contact" name="contact" required maxlength="100" placeholder="+7 или @username"></label><label for="family-message">Немного о вашей семье<textarea id="family-message" name="message" rows="3" maxlength="2000" placeholder="Возраст ребёнка, график и что для вас важно"></textarea></label><label class="consent"><input type="checkbox" required><span>Согласие на <button type="button" data-dialog="privacy-info">обработку персональных данных</button></span></label><button class="action" type="submit" disabled>Составить заявку${icon('arrow')}</button><p class="form-note">Подготовим текст для Telegram. Автоматической отправки и сохранения данных нет.</p><p role="status" class="form-result" hidden></p><noscript><p class="form-note">Для подготовки сообщения включите JavaScript. Или откройте Telegram по ссылке рядом с формой.</p></noscript></form></div></section>`;
}

export function renderSymbols() {
  const paths = {
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    plane:'<path d="m21 3-5 18-5-7-8-3ZM11 14 21 3M11 14v6l4-3"/>',
    heart:'<path d="M12 21S2 15 3 8c1-5 7-5 9 0 2-5 8-5 9 0 1 7-9 13-9 13Z"/>',
    people:'<circle cx="9" cy="7" r="3.5"/><path d="M2 21v-5a7 7 0 0 1 14 0v5ZM16 3a4 4 0 0 1 0 8m3 10h3v-5a6 6 0 0 0-4-5"/>',
    chat:'<path d="M21 11c0 5-4 8-10 8l-7 3 1-6C-1 10 4 3 12 3c5 0 9 3 9 8ZM7 10h10m-10 4h6"/>',
    file:'<path d="M5 2h11l4 4v16H5ZM15 2v6h5M9 12h7m-7 4h7m-7 3h5"/>',
    leaf:'<path d="M4 21C2 7 12 3 21 3c1 11-3 17-14 14M4 21l12-13"/>',
    shield:'<path d="m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6ZM8 12l3 3 6-7"/>',
    sun:'<circle cx="12" cy="12" r="4.5"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4M4 4l3 3m10 10 3 3M4 20l3-3M17 7l3-3"/>'
  };
  return `<svg class="symbol-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${Object.entries(paths).map(([id,path])=>`<symbol id="${id}" viewBox="0 0 24 24">${path}</symbol>`).join('')}</svg>`;
}

export const privacyDialog = () => `<dialog id="privacy-info" class="info-dialog"><button class="close-dialog" type="button" aria-label="Закрыть">×</button><span class="eyebrow">ПОДГОТОВКА СООБЩЕНИЯ</span><h2>Всё остаётся<br><em>под вашим контролем.</em></h2><p>Форма составляет текст заявки в этом окне. Введённые данные не сохраняются и автоматически никуда не отправляются. Вы сами копируете текст и решаете, отправлять ли его в Telegram.</p><p>Перед подключением настоящей отправки добавим согласованные документы, сведения о специалисте и условия обработки персональных данных.</p></dialog>`;
