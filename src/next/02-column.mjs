import {termsMarkup,
  frame, headline, intro, biography, approach, stages, services, reviews,
  cafe, heading, section, actions, button, tg, form, requestCopy,
} from './common.mjs';

export function render(version = '1') {
  const body = [
    section('hero', `
      <div class="column-cover">
        <span class="eyebrow">ИНДИВИДУАЛЬНЫЙ ПОДБОР НЯНИ</span>
        <h1>${headline}</h1>
        <p class="column-intro">${intro}</p>
        ${actions()}
        <figure class="column-author">
          ${cafe(true, 'column-author-photo')}
          <figcaption><span>Анастасия Доронина</span>Индивидуальный подбор няни</figcaption>
        </figure>
      </div>`, 'column-hero'),

    section('service', `
      ${heading('01 / О ПОДБОРЕ', 'От запроса семьи к выбору няни')}
      <div class="column-articles">
        ${approach.map(item => `<article class="column-article"><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}
      </div>`, 'column-service column-rule'),

    section('about', `
      ${heading('02 / ОБО МНЕ', 'Опыт подбора и работы с детьми')}
      <div class="column-biography">${biography}</div>`, 'column-about column-rule'),

    section('process', `
      ${heading('03 / ЭТАПЫ', 'Этапы подбора')}
      <ol class="column-route">
        ${stages.map((stage, index) => `
          <li class="column-stage">
            <span class="column-stage-number" aria-hidden="true">${index + 1}</span>
            <h3>${stage.title}</h3>
            <p>${stage.action}</p>
            <p class="column-stage-result"><strong>Для семьи:</strong> ${stage.result}</p>
          </li>`).join('')}
      </ol>`, 'column-process column-rule'),

    section('pricing', `
      ${heading('04 / СТОИМОСТЬ И УСЛОВИЯ', 'Два формата работы')}
      <div class="column-plans">
        ${services.map(service => `
          <article id="plan-${service.key}" data-service-plan="${service.key}" class="column-plan">
            <div class="column-plan-heading"><h3>${service.title}</h3><p class="column-price">${service.price}</p></div>
            <p class="column-plan-intro">${service.intro}</p>
            <ul>${service.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
            <p class="column-plan-terms">${termsMarkup(service.terms)}</p>
            ${button(service.action, service.title, service.key === 'consultation' ? 'button-secondary' : '')}
          </article>`).join('')}
      </div>`, 'column-pricing column-rule'),

    section('reviews', `
      ${heading('05 / ОТЗЫВЫ', 'Отзывы родителей')}
      <div class="column-reviews">
        ${reviews.map(review => `
          <figure class="column-review">
            <blockquote><p>«${review.text}»</p></blockquote>
            <figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption>
          </figure>`).join('')}
      </div>`, 'column-reviews-section column-rule'),

    section('request', `
      ${heading('06 / ОСТАВИТЬ ЗАЯВКУ', 'Готовы обсудить подбор?')}
      <div class="column-request-copy">${requestCopy}${tg()}</div>
      <div class="column-form">${form('column')}</div>`, 'column-request column-rule'),
  ].join('');

  return frame({id: '02-column', body, version});
}
