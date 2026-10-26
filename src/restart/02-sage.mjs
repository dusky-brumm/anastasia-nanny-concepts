import {frame,photo,cta,link,form,biography,stages,reviews,services} from './common.mjs';

const interview = [
  {
    title: 'Сначала узнаю вашу семью',
    text: 'Обсудим ритм жизни, привычки ребёнка и ваши взгляды на воспитание. Вместе определим задачи, график и качества человека, которого вы хотите видеть рядом.'
  },
  {
    title: 'Поговорю с кандидатами о важном',
    text: 'Проведу интервью под ваш запрос. Разберём ситуации из жизни вашей семьи: детские эмоции, занятия, отношения между детьми. Так становится понятнее, насколько близки ваши подходы.'
  },
  {
    title: 'Подготовлю подробный профиль',
    text: 'Вы получите информацию об опыте, сильных сторонах и важных нюансах каждого кандидата — вместе с моими комментариями. Обсудим, почему этот человек может подойти вашей семье.'
  }
];

const title = (label,heading,text='') => `<div class="section-title"><span class="eyebrow">${label}</span><h2>${heading}</h2>${text?`<p>${text}</p>`:''}</div>`;

export function render(version){
  const body = `
    <section class="section sage-hero" id="hero" data-section="hero">
      <div class="inner">
        <div class="sage-introduction">
          <span class="eyebrow">Личный подбор няни · Анастасия Доронина</span>
          <h1>Найду няню, с которой спокойно вам и хорошо ребёнку</h1>
          <p>Я беру на себя поиск, собеседования и проверки. А вам оставляю главное — познакомиться и выбрать человека, с которым хочется быть одной командой.</p>
          <div class="actions">${cta()}${link()}</div>
        </div>
        <figure class="sage-family">
          ${photo('nastya-family','Анастасия с детьми на природе',true)}
          <figcaption>Хочется, чтобы рядом с ребёнком был свой человек. С этого и начнём.</figcaption>
        </figure>
      </div>
    </section>

    <section class="section sage-tint" id="service" data-section="service">
      <div class="inner">
        ${title('О подборе','Важна не только анкета','У каждой семьи свой ритм и своё представление о заботе. Я помогаю найти человека, которому это близко.')}
        <ol class="sage-interview">
          ${interview.map((item,i)=>`<li><span class="step-number">0${i+1}</span><h3>${item.title}</h3><p>${item.text}</p></li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="section" id="about" data-section="about">
      <div class="inner">
        ${title('Обо мне','Будем знакомы, я Настя')}
        <div class="sage-biography">${biography}</div>
      </div>
    </section>

    <section class="section" id="process" data-section="process">
      <div class="inner">
        ${title('Как всё проходит','От первого разговора до работы няни','Двигаемся последовательно. На каждом этапе вы понимаете, что происходит и что будет дальше.')}
        <ol class="sage-journey">
          ${stages.map((stage,i)=>`<li><span class="step-number">0${i+1}</span><div class="journey-action"><h3>${stage.title}</h3><p>${stage.action}</p></div><p class="journey-result"><span class="row-label">Что получает семья</span>${stage.result}</p></li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="section sage-tint" id="pricing" data-section="pricing">
      <div class="inner">
        ${title('Стоимость','Выберите нужную помощь','Можно передать мне весь поиск или подготовиться к нему на личной консультации.')}
        <div class="sage-prices">
          ${services.map((service,i)=>`<article class="sage-plan"><span class="eyebrow">${service.label}</span><h3>${service.title}</h3><p class="plan-price">${service.price}</p><p class="plan-description">${service.description}</p><ul>${service.features.map(feature=>`<li>${feature}</li>`).join('')}</ul><p class="plan-terms">${i===0?'Полная оплата — после 1–2 пробных недель. Ориентир поиска — 1–1,5 месяца.':'Консультация длится 1,5–2 часа. После неё ещё две недели отвечаю на ваши вопросы.'}</p>${cta(i===0?'Обсудить подбор':'Записаться на консультацию',service.title)}</article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" id="reviews" data-section="reviews">
      <div class="inner">
        ${title('Отзывы','Что говорят семьи')}
        <div class="sage-reviews">
          ${reviews.map(review=>`<figure><blockquote><p>«${review.text}»</p></blockquote><figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption></figure>`).join('')}
        </div>
      </div>
    </section>

    <section class="section sage-tint" id="request" data-section="request">
      <div class="inner">
        ${title('Начнём со знакомства','Готовы обсудить подбор?')}
        <div class="sage-request">
          <div class="request-intro"><p>Расскажите немного о ребёнке, вашем графике и о том, с чем нужна помощь. Вместе поймём, какая няня подойдёт вашей семье.</p><p>Оставьте заявку или напишите мне напрямую — как вам удобнее.</p>${link('Написать Насте в Telegram')}</div>
          <div class="sage-form">${form('sage')}</div>
        </div>
      </div>
    </section>`;
  return frame({id:'02-sage',title:'Близкий круг',body,themeColor:'#eef1e8',version});
}
