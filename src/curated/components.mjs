import {approach,stages,reviews,services} from '../studio/content.mjs';
import {escape,icon,photo,renderSymbols,privacyDialog} from '../studio/components.mjs';
export {escape,icon,photo,renderSymbols,privacyDialog};

export const title=()=>'<h1>Найду няню, с которой <em>спокойно</em> вам и хорошо ребёнку.</h1>';
export const intro='Я беру на себя поиск, собеседования и проверки — а вам помогаю познакомиться и выбрать человека, с которым хочется быть одной командой.';
export const action=(label='Обсудить подбор',href='#request',extra='')=>`<a class="action" href="${href}" ${extra}>${label}${icon('arrow')}</a>`;
export const telegram=(label='Telegram')=>`<a class="telegram" href="https://t.me/anastasiadoroninaa" target="_blank" rel="noopener noreferrer">${icon('plane')}${label}<span aria-hidden="true">↗</span></a>`;
export const heroActions=()=>`<div class="hero-actions">${action()}${telegram()}</div>`;
export const heading=(eyebrow,title,description='')=>`<div class="section-heading"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>${description?`<p>${description}</p>`:''}</div>`;
export const note=(text='Не просто закрыть вакансию, а найти своего человека.')=>`<blockquote class="paper-note"><i aria-hidden="true"></i><p>${text}</p></blockquote>`;
export const signature=()=>`<div class="signature">${photo('nastya-child',{alt:'Анастасия с малышом',eager:true})}<span>Анастасия Доронина<small>Личный подбор няни</small></span></div>`;

const serviceItems=()=>approach.map(item=>`<article>${icon(item.icon)}<div><h3>${item.title}</h3><p>${item.description}</p></div></article>`).join('');

function familyExample(){
  const topics=[['Малыш','Как вы поможете малышу привыкнуть к новому взрослому, если мама рядом?'],['Дошкольник','Ребёнок расстроился и не хочет собираться на прогулку. Как вы поступите?'],['Школьники','Один ребёнок делает уроки, другой мешает и ссорится. Как поможете обоим?']];
  return `<div class="family-question-picker"><span class="eyebrow">ПРИМЕР ТЕМЫ ИНТЕРВЬЮ</span><div class="family-topic-buttons" role="group" aria-label="Возраст ребёнка в примере">${topics.map(([label,q],i)=>`<button type="button" data-family-topic data-question="${escape(q)}" aria-pressed="${i===0}" aria-controls="family-question">${label}</button>`).join('')}</div><blockquote id="family-question" data-family-question aria-live="polite">${topics[0][1]}</blockquote><p>Я задаю вопросы в контексте вашей семьи. Обсуждаем ход мысли кандидата, ценности и то, как вам будет вместе.</p><a class="text-link" href="#request" data-use-family-question>Обсудить такую задачу ${icon('arrow')}</a></div>`;
}

export function renderService(c){
  let body;
  if(c.service==='paired')body=`<div class="needs-pairs"><div class="pair-labels"><span>Что важно семье</span><span>Что я делаю</span></div>${approach.map(a=>`<article><h3>${a.need}</h3><div>${icon(a.icon)}<h4>${a.action}</h4><p>${a.description}</p></div></article>`).join('')}</div>`;
  else if(c.service==='profile')body=`<div class="profile-explanation"><div class="service-items">${serviceItems()}</div><article class="profile-document"><span class="eyebrow">ПРИМЕР СТРУКТУРЫ ПРОФИЛЯ</span><h3>За анкетой —<br>живой человек.</h3><p>Вы сможете понять, что стоит за строчками об опыте. Здесь показана структура, а не вымышленный кандидат.</p><dl><div><dt>Опыт и задачи</dt><dd>С какими детьми работала няня и за что отвечала.</dd></div><div><dt>Ответы на ваши ситуации</dt><dd>Как рассуждает о привычках, эмоциях или школьных делах.</dd></div><div><dt>Мой комментарий</dt><dd>Почему рассматриваем этого человека и что стоит обсудить.</dd></div></dl></article></div>`;
  else if(c.service==='dialogue')body=`<div class="dialogue-service"><div class="service-items">${serviceItems()}</div>${familyExample()}</div>`;
  else if(c.service==='manifesto')body=`<div class="service-manifesto"><p class="large-statement">Сначала узнаю вас.<br>Потом ищу <em>вашего человека.</em></p><div class="service-items">${serviceItems()}</div></div>`;
  else if(c.service==='formats')body=`<div class="service-items">${serviceItems()}</div><div class="service-formats"><article><span class="eyebrow">ПЕРЕДАТЬ ПОИСК</span><h3>Личный подбор</h3><p>Я ищу и собеседую кандидатов. Вы знакомитесь с подходящими людьми и обсуждаете со мной выбор.</p>${action('Что входит в подбор','#pricing')}</article><article><span class="eyebrow">ИСКАТЬ САМОСТОЯТЕЛЬНО</span><h3>Личная консультация</h3><p>Помогаю сформулировать запрос, подготовить вакансию и вопросы для интервью.</p>${action('О консультации','#pricing')}</article></div>`;
  else body=`<div class="service-items">${serviceItems()}</div>`;
  return `<section class="section section-service" id="service" data-section="service"><div class="container">${heading('ПОДРОБНЕЕ ОБ УСЛУГЕ','Подбор под вашу семью.','Я собеседую няню под конкретную вакансию: подробно рассказываю о семье, разбираю ваши ситуации и лично обсуждаю с вами кандидатов.')}<div class="service-layout service-layout--${c.service}">${body}</div></div></section>`;
}

export function renderAbout(c){
  const text=`<p>С 2022 года подбираю нянь для семей. Работала в двух агентствах, а сейчас веду семьи лично — от первого разговора до выхода няни на работу.</p><p>До подбора пять лет работала с детьми: няней, тренером и педагогом. Понимаю ожидания родителей и то, что важно человеку, которого вы приглашаете в семью.</p>`;
  const image=photo('nastya-family',{alt:'Анастасия с детьми на природе'});
  let body;
  if(c.about==='interview')body=`<figure>${image}<figcaption>Анастасия Доронина</figcaption></figure><article><span class="eyebrow">ОБ АНАСТАСИИ</span><h2>Знаю поиск<br><em>с обеих сторон.</em></h2><dl><div><dt>Опыт подбора</dt><dd>С 2022 года работала в двух агентствах. Сейчас веду семьи индивидуально.</dd></div><div><dt>Опыт с детьми</dt><dd>До подбора пять лет была няней, тренером и педагогом.</dd></div><div><dt>Что важно мне</dt><dd>Чтобы совпали ценности и людям было хорошо работать вместе.</dd></div></dl></article>`;
  else body=`<figure>${image}<figcaption>Ваш человек в поиске няни.</figcaption></figure><article><span class="eyebrow">ОБ АНАСТАСИИ</span><h2>Привет, я Настя.<br>Знаю поиск <em>с обеих сторон.</em></h2><div class="bio-text">${text}</div><a class="text-link" href="https://t.me/anastasiadoroninaa/103" target="_blank" rel="noopener noreferrer">Больше о моём подходе ↗</a></article>`;
  return `<section class="section section-about" id="about" data-section="about"><div class="container"><div class="about-layout about-layout--${c.about}">${body}</div></div></section>`;
}

const deliveries=[
  'Понимание задачи и удобного формата работы.',
  'Согласованные задачи, график и портрет вашей няни.',
  'Подробные профили с моими комментариями.',
  'Личные впечатления и возможность понять, как вам вместе.',
  'Поддержка после выхода няни и помощь с адаптацией.'
];
export function renderProcess(c){
  const items=stages.map((s,i)=>`<article id="stage-${s.key}"><div class="stage-title">${icon(s.icon)}<h3>${s.title}</h3></div><div class="stage-result"><span>Для вашей семьи</span><p>${deliveries[i]}</p></div><p class="stage-action">${s.action.replace('Если понадобится замена, действует гарантийный срок.','')}</p></article>`).join('');
  return `<section class="section section-process" id="process" data-section="process"><div class="container">${heading('КАК ПРОХОДИТ ПОДБОР','Что вы получаете<br>на каждом этапе.','От первого разговора до начала работы няни. Каждый этап помогает вам понять, подходит ли человек вашей семье.')}<div class="process-layout process-layout--${c.process}">${c.process==='table'?'<div class="process-table-head"><span>Этап</span><span>Что получает семья</span><span>Моя работа</span></div>':''}${items}</div></div></section>`;
}

export function renderPricing(c){
  const plans=services.map(s=>`<article class="price-plan"><span class="eyebrow">${s.key==='selection'?'ПЕРЕДАТЬ ПОИСК':'ИСКАТЬ САМОСТОЯТЕЛЬНО'}</span><h3>${s.title}</h3><p>${s.description}</p><ul>${s.features.filter(f=>!f.startsWith('Неограниченное')&&!f.startsWith('Гарантия')).map(f=>`<li>${f}</li>`).join('')}</ul><div class="plan-cost"><strong>${s.price}</strong><span>${s.key==='selection'?'полный подбор':'за консультацию'}</span></div><p class="plan-note">${s.footnote.replace('По макету: ','')}</p>${action(s.key==='selection'?'Обсудить подбор':'Обсудить консультацию','#request',`data-service="${s.title}"`)}</article>`).join('');
  return `<section class="section section-pricing" id="pricing" data-section="pricing"><div class="container">${heading('СТОИМОСТЬ И УСЛОВИЯ','Два формата помощи.')}<p class="draft-note">Цены и условия — из предоставленного макета. Уточним их актуальность перед рабочим запуском.</p><div class="pricing-layout pricing-layout--${c.pricing}">${c.pricing==='paper'?`<aside class="pricing-aside">${photo('consultation',{alt:'Заметки в блокноте'})}<p>Выбираем формат,<br>с которым вам удобнее.</p></aside>`:''}<div class="price-plans">${plans}</div></div><div class="working-conditions"><article>${icon('people')}<h3>Поиск до результата</h3><p>Количество кандидатов не ограничено.</p></article><article>${icon('shield')}<h3>Замена 6 месяцев</h3><p>Бесплатно подберу замену в течение гарантийного срока.</p></article><article>${icon('chat')}<h3>Личная связь</h3><p>Обсуждаем кандидатов и вопросы после начала работы.</p></article></div></div></section>`;
}

export function renderReviews(c){
  return `<section class="section section-reviews" id="reviews" data-section="reviews"><div class="container">${heading('ОТЗЫВЫ','Что говорят семьи.')}<p class="draft-note">Отзывы из присланных материалов. Перед рабочим запуском подтвердим тексты и согласия на публикацию.</p><div class="review-layout review-layout--${c.reviews}">${reviews.map((r,i)=>`<figure class="review-card review-card--${i}"><span class="quote-mark" aria-hidden="true">“</span><blockquote>${r.text}</blockquote><figcaption><strong>${r.name}</strong><span>${r.detail}</span></figcaption></figure>`).join('')}</div></div></section>`;
}

export function renderRequest(){
  return `<section class="section section-request" id="request" data-section="request"><div class="container request-layout"><div><span class="eyebrow">НАЧНЁМ СО ЗНАКОМСТВА</span><h2>Готовы обсудить подбор?</h2><p>Расскажите немного о семье и помощи, которая вам нужна. Вместе поймём, с чего начать.</p>${telegram('Telegram Анастасии')}<p class="request-hint">Можно прийти с ещё не до конца сформулированным запросом.</p></div><form data-request-form class="studio-form"><h3>Несколько слов о вас</h3><fieldset><legend>Какая помощь вам нужна?</legend><label><input type="radio" name="service" value="Личный подбор няни" checked>Подбор няни</label><label><input type="radio" name="service" value="Личная консультация">Консультация</label></fieldset><label for="family-name">Ваше имя<input id="family-name" name="name" required autocomplete="given-name" maxlength="80" placeholder="Как к вам обращаться"></label><label for="family-contact">Телефон или Telegram<input id="family-contact" name="contact" required maxlength="100" placeholder="+7 или @username"></label><label for="family-message">О вашей семье<textarea id="family-message" name="message" rows="3" maxlength="2000" placeholder="Возраст ребёнка, график, ваши пожелания"></textarea></label><label class="consent"><input type="checkbox" required><span>Ознакомлен(а) с <button type="button" data-dialog="privacy-info">порядком работы с данными</button></span></label><button class="action" type="submit" disabled>Подготовить заявку${icon('arrow')}</button><p class="form-note">Форма подготовит текст для Telegram. Автоматической отправки и сохранения контактов нет.</p><p class="form-result" role="status" hidden></p><noscript><p class="form-note">Для подготовки сообщения включите JavaScript или откройте Telegram по ссылке рядом.</p></noscript></form></div></section>`;
}
