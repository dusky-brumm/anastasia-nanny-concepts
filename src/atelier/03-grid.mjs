import {frame,section,heading,headline,intro,biography,approach,stages,services,reviews,cafe,button,tg,actions,form,requestCopy} from './common.mjs';

const examples=[
  {context:'Если в семье школьник',question:'«Как вы поступите, если ребёнок не хочет делать уроки?»',explanation:'Обсуждаем последовательность действий, общение с ребёнком и участие родителей.'},
  {context:'Если ребёнок ещё маленький',question:'«Что вы будете делать, если ребёнок расстроен?»',explanation:'Уточняем подход к детским эмоциям, адаптации и повседневному уходу.'}
];

function process(){
  return `<div class="g-stepper" data-tabs>
    <div class="g-tabs" role="tablist" aria-label="Пять этапов подбора">
      ${stages.map((stage,i)=>`<button type="button" role="tab" id="grid-tab-${i+1}" aria-controls="grid-panel-${i+1}" aria-selected="${i===0}" aria-label="Этап ${i+1} из ${stages.length}: ${stage.title}"><span class="g-tab-number" aria-hidden="true">0${i+1}</span><span class="g-tab-label">${stage.title}</span></button>`).join('')}
    </div>
    <p class="g-tab-progress" data-tab-progress aria-live="polite" aria-atomic="true">Этап 1 из ${stages.length}</p>
    <div class="g-panels">${stages.map((stage,i)=>`<div class="g-panel" role="tabpanel" id="grid-panel-${i+1}" aria-labelledby="grid-tab-${i+1}" tabindex="0"><div><span class="eyebrow">Этап 0${i+1}</span><h3>${stage.title}</h3><p>${stage.action}</p></div><div class="g-stage-result"><span class="eyebrow">Результат для семьи</span><p>${stage.result}</p></div></div>`).join('')}</div>
  </div>`;
}

export function render(version){
  const body=[
    section('hero',`<div class="g-hero-grid">
      <div class="g-hero-main"><span class="eyebrow">Индивидуальный подбор няни</span><h1>${headline}</h1><p>${intro}</p>${actions()}</div>
      <div class="g-hero-side"><figure class="g-portrait">${cafe(true)}<figcaption><strong>Анастасия Доронина</strong><span>Веду подбор лично</span></figcaption></figure><div class="g-hero-note"><span class="eyebrow">Основа подбора</span><p>Ваши задачи. Собеседования по вакансии. Подробные профили.</p></div></div>
    </div>`,'g-hero'),
    section('service',`${heading('Услуга','Интервью в контексте вашей семьи','Вопросы на собеседовании зависят от возраста ребёнка, обязанностей няни и ваших требований.')}
      <div class="g-service-grid"><div class="g-service-copy">${approach.slice(0,2).map((item,i)=>`<article><span class="eyebrow">0${i+1}</span><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</div><div class="g-examples">${examples.map(example=>`<article class="g-question"><span class="eyebrow">${example.context}</span><h3>${example.question}</h3><p>${example.explanation}</p></article>`).join('')}<p class="small-note">Примеры вопросов для интервью, не ответы конкретного кандидата.</p></div></div>
      <div class="g-deliverable"><div><span class="eyebrow">03 · Результат собеседования</span><h3>${approach[2].title}</h3></div><p>${approach[2].text}</p></div>`,'g-service'),
    section('about',`<div class="g-about-grid">${heading('Обо мне','Опыт подбора и работы с детьми')}<div class="g-biography">${biography}</div></div>`,'g-about'),
    section('process',`${heading('Этапы','Пять этапов подбора','Выберите этап, чтобы узнать, что я делаю и какой результат получает ваша семья.')}${process()}`,'g-process'),
    section('pricing',`${heading('Стоимость и условия','Два формата работы','Полный подбор или консультация для самостоятельного поиска.')}
      <div class="g-plans">${services.map((service,i)=>`<article class="g-plan ${i===0?'g-plan-main':'g-plan-consult'}"><span class="eyebrow">${i===0?'Поиск и сопровождение':'Самостоятельный поиск'}</span><h3>${service.title}</h3><p class="g-price">${service.price}</p><p class="g-plan-intro">${service.intro}</p><ul>${service.features.map(feature=>`<li>${feature}</li>`).join('')}</ul><p class="g-plan-terms">${service.terms}</p>${button(service.action,service.title)}</article>`).join('')}</div>`,'g-pricing'),
    section('reviews',`${heading('Отзывы','Обратная связь от семей')}
      <div class="g-review-rows">${reviews.map(review=>`<figure><figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption><blockquote><p>«${review.text}»</p></blockquote></figure>`).join('')}</div>`,'g-reviews'),
    section('request',`<div class="g-request-grid"><div class="g-request-copy">${heading('Оставить заявку','Готовы обсудить подбор?')}${requestCopy}${tg()}</div><div class="g-form">${form('grid')}</div></div>`,'g-request')
  ].join('');
  return frame({id:'03-grid',body,version,sans:true});
}
