import {termsMarkup,frame,section,heading,headline,biography,stages,services,reviews,cafe,photo,button,tg,form,requestCopy,profileSample} from './common.mjs';

const interviewCases=[
  {
    key:'baby',label:'Малыш',title:'Уход и адаптация',
    questions:[
      'Как вы поможете ребёнку привыкнуть к новому взрослому?',
      'Что будете делать, если ребёнок плачет и не успокаивается?',
      'Как согласуете с родителями сон, прогулки и повседневный уход?'
    ]
  },
  {
    key:'school',label:'Школьник',title:'Учёба и повседневные ситуации',
    questions:[
      'Как поступите, если ребёнок отказывается делать уроки?',
      'Что будете делать, если между детьми возник конфликт?',
      'Как организуете день, если занятия закончились раньше обычного?'
    ]
  }
];

const comparison=[
  {key:'search',label:'Кто ведёт поиск',values:['Поиск и интервью провожу я. Количество кандидатов не ограничено.','Няню ищете вы. Запрос уточняем вместе.']},
  {key:'result',label:'Что вы получите',values:['Подробные профили и личные комментарии.','Текст вакансии, вопросы и чек-листы для интервью.']},
  {key:'support',label:'Поддержка',values:['Бесплатная замена в течение 6 месяцев. Помощь после выхода няни.','Ответы на вопросы в течение двух недель.']},
];

function serviceComparison() {
  const quickLinks=`<nav class="pr-format-quicklinks" aria-label="Кратко о форматах">${services.map(service=>`<a href="#practice-mobile-${service.key}"><span>${service.key==='selection'?'Подбор няни':'Консультация'}</span><strong>${service.price}</strong><span aria-hidden="true">↓</span></a>`).join('')}</nav>`;
  const mobilePlans=`<div class="pr-mobile-plans">${services.map((service,index)=>`<div class="pr-mobile-plan" id="practice-mobile-${service.key}" data-service-plan="${service.key}"><h3>${index===0?'Подбор няни':'Консультация'}</h3><p class="pr-mobile-price">${service.price}</p><dl>${comparison.map(row=>`<div><dt>${row.label}</dt><dd>${row.values[index]}</dd></div>`).join('')}</dl><p class="pr-mobile-terms">${termsMarkup(service.terms)}</p>${button(service.action,service.title)}</div>`).join('')}</div>`;
  return `<table class="pr-comparison"><caption class="sr-only">Сравнение личного подбора и консультации</caption>
    <thead><tr>${services.map((service,index)=>`<th id="practice-${service.key}" data-service-plan="${service.key}" scope="col"><h3>${index===0?'Подбор няни':'Консультация'}</h3><p class="pr-price">${service.price.replace('от ','<span class="pr-price-prefix">от </span>')}</p></th>`).join('')}</tr></thead>
    ${comparison.map(row=>`<tbody><tr><th id="practice-${row.key}" colspan="2" scope="rowgroup">${row.label}</th></tr><tr>${row.values.map((value,index)=>`<td headers="practice-${services[index].key} practice-${row.key}">${value}</td>`).join('')}</tr></tbody>`).join('')}
    </table>${quickLinks}${mobilePlans}<div class="pr-plan-terms">${services.map((service,index)=>`<article><h3>${index===0?'Подбор няни':'Консультация'}</h3><p>${termsMarkup(service.terms)}</p>${button(service.action,service.title)}</article>`).join('')}</div>`;
}

function interviewExample(){
  return `<div class="pr-interview" data-tabs>
    <span class="eyebrow">Пример интервью под вакансию</span>
    <h2>Какие вопросы я задам няне</h2>
    <div class="pr-case-tabs" role="tablist" aria-label="Возраст ребёнка в примере интервью">
      ${interviewCases.map((item,i)=>`<button type="button" role="tab" id="practice-tab-${item.key}" aria-controls="practice-panel-${item.key}" aria-selected="${i===0}">${item.label}</button>`).join('')}
    </div>
    <div class="pr-cases">${interviewCases.map(item=>`<div class="pr-case" role="tabpanel" id="practice-panel-${item.key}" aria-labelledby="practice-tab-${item.key}" tabindex="0"><h3>${item.title}</h3><ol>${item.questions.map(question=>`<li>${question}</li>`).join('')}</ol></div>`).join('')}</div>
    <p class="pr-example-note">По ответам оцениваю, как няня действует в ситуациях вашей семьи и насколько совпадает подход к ребёнку.</p>
  </div>`;
}

export function render(version){
  const body=[
    section('hero',`<div class="pr-hero-layout"><div class="pr-hero-copy"><span class="eyebrow">Индивидуальный подбор няни</span><h1>${headline}</h1><p>Собеседую нянь под задачи и правила вашей семьи. Представляю подходящих кандидатов с подробными профилями и моими комментариями.</p><div class="actions">${button()}<a class="pr-cost-link" href="#pricing">Стоимость<span aria-hidden="true">↓</span></a></div><figure class="pr-author">${cafe(true,'pr-author-photo')}<figcaption><strong>Анастасия Доронина</strong><span>Провожу собеседования и веду подбор лично</span></figcaption></figure></div>${interviewExample()}</div>`,'pr-hero'),
    section('service',`<div class="pr-output-layout"><div class="pr-output-copy">${heading('Результат подбора','Подробный профиль и личное обсуждение')}<p>Вместе разбираем опыт кандидата и ответы на вопросы. Перед встречей отмечаем, что вам стоит уточнить лично.</p></div>${profileSample()}</div>`,'pr-output'),
    section('about',`<div class="pr-about-layout"><div class="pr-about-copy">${heading('Обо мне','Подбором занимаюсь лично')}<div class="pr-biography">${biography}</div></div><figure class="pr-about-photo">${photo('nastya-family','Анастасия с детьми на природе')}</figure></div>`,'pr-about'),
    section('process',`${heading('Порядок работы','Пять этапов подбора','На каждом этапе обсуждаем результаты и следующие действия.')}<ol class="pr-route">${stages.map((stage,i)=>`<li><span class="pr-stage-number">0${i+1}</span><div class="pr-stage-action"><h3>${stage.title}</h3><p>${stage.action}</p></div><p class="pr-stage-result"><strong>Для семьи:</strong> ${stage.result}</p></li>`).join('')}</ol>`,'pr-process'),
    section('pricing',`${heading('Форматы и стоимость','Сравните два варианта работы','Полный подбор — если хотите передать поиск мне. Консультация — если будете искать няню самостоятельно.')}${serviceComparison()}`,'pr-pricing'),
    section('reviews',`${heading('Отзывы','Что говорят семьи')}<div class="pr-reviews">${reviews.map(item=>`<figure><blockquote><p>«${item.text}»</p></blockquote><figcaption><strong>${item.name}</strong><span>${item.detail}</span></figcaption></figure>`).join('')}</div>`,'pr-feedback'),
    section('request',`<div class="pr-request-layout"><div class="pr-request-copy">${heading('Оставить заявку','Готовы обсудить подбор?')}${requestCopy}${tg('Написать Анастасии в Telegram')}</div><div class="pr-form">${form('practice')}</div></div>`,'pr-request')
  ].join('');
  return frame({id:'03-practice',body,version});
}
