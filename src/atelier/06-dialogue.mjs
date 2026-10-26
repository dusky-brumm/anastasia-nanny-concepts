import {frame,section,heading,headline,intro,biography,approach,stages,services,reviews,cafe,button,tg,actions,form,requestCopy} from './common.mjs';

const questions=['Что мы обсудим до начала поиска?','Как проходит собеседование с няней?','Что я получу перед знакомством?'];
const review = item => `<figure><blockquote><p>«${item.text}»</p></blockquote><figcaption><strong>${item.name}</strong><span>${item.detail}</span></figcaption></figure>`;

export function render(version){
  const body=[
    section('hero',`<div class="d-opening"><span class="eyebrow">Индивидуальный подбор няни</span><h1>${headline}</h1><p>${intro}</p>${actions()}</div>
      <div class="d-hero-panels"><div class="d-family-panel"><span class="eyebrow">Запрос семьи</span><h3>Начнём с того, какая помощь вам нужна</h3><dl><div><dt>График</dt><dd>Когда и на какое время нужна няня</dd></div><div><dt>Обязанности</dt><dd>Какие задачи вы хотите ей поручить</dd></div><div><dt>Подход к воспитанию</dt><dd>Какие правила и привычки важно учитывать</dd></div></dl><a class="d-service-link" href="#service">Подробнее о подборе <span aria-hidden="true">↓</span></a></div>
      <figure class="d-portrait-panel">${cafe(true)}<figcaption><blockquote><p>«Я собеседую няню не в общих чертах, а под конкретную вакансию»</p></blockquote><strong>Анастасия Доронина</strong><span>Веду подбор лично</span></figcaption></figure></div>`,'d-hero'),
    section('service',`<div class="d-service-layout">${heading('Об услуге','Три вопроса о подборе','Каждый этап связан с вашим запросом и помогает принять решение о кандидате.')}<div class="d-questions">${approach.map((item,i)=>`<article><h3>${questions[i]}</h3><p>${item.text}</p></article>`).join('')}</div></div>`,'d-service'),
    section('about',`<div class="d-letter">${heading('Обо мне','Подбор веду лично')}${biography}<p class="d-signature">Анастасия Доронина<span>Индивидуальный подбор няни</span></p></div>`,'d-about'),
    section('process',`${heading('Порядок работы','Пять этапов подбора','От уточнения требований до сопровождения после выхода няни. Подробности каждого этапа можно свернуть.')}
      <div class="d-route">${stages.map((stage,i)=>`<details open><summary><span class="d-stage-number">0${i+1}</span><h3>${stage.title}</h3><span class="d-expand" aria-hidden="true">+</span></summary><div class="d-stage-content"><p>${stage.action}</p><div><span class="eyebrow">Результат для семьи</span><p>${stage.result}</p></div></div></details>`).join('')}</div>`,'d-process'),
    section('pricing',`${heading('Стоимость','Полный подбор или консультация','Выберите формат в зависимости от того, готовы ли заниматься поиском самостоятельно.')}
      <div class="d-plan-list">${services.map(service=>`<article><div class="d-plan-title"><h3>${service.title}</h3><p class="d-price">${service.price}</p></div><div class="d-plan-content"><p>${service.intro}</p><ul>${service.features.map(feature=>`<li>${feature}</li>`).join('')}</ul><p class="d-plan-terms">${service.terms}</p></div><div class="d-plan-action">${button(service.action,service.title)}</div></article>`).join('')}</div>`,'d-pricing'),
    section('reviews',`${heading('Отзывы','После работы вместе')}
      <div class="d-review-columns"><div class="d-review-lead">${review(reviews[0])}</div><div class="d-review-pair">${review(reviews[1])}${review(reviews[2])}</div></div>`,'d-reviews'),
    section('request',`<div class="d-request-inner">${heading('Оставить заявку','Готовы обсудить подбор?')}${requestCopy}<div class="d-request-contact">${tg('Можно написать в Telegram')}</div><div class="d-form">${form('dialogue')}</div></div>`,'d-request')
  ].join('');
  return frame({id:'06-dialogue',body,version,sans:true});
}
