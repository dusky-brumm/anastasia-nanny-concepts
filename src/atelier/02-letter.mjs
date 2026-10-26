import {
  frame, headline, intro, biography, approach, stages, services, reviews,
  cafe, heading, section, button, tg, form, requestCopy,
} from './common.mjs';

export function render(version = '1') {
  const body = [
    section('hero', `
      <div class="letter-introduction">
        <figure class="letter-portrait">
          ${cafe(true)}
          <figcaption>Анастасия Доронина<span>Индивидуальный подбор няни</span></figcaption>
        </figure>
        <div class="letter-opening">
          <h1>${headline}</h1>
          <p>${intro}</p>
          <div class="actions">${button()}${tg()}</div>
        </div>
      </div>`, 'letter-hero'),

    section('service', `
      ${heading('ОБ УСЛУГЕ', 'Индивидуальный подбор под задачи семьи')}
      <div class="letter-service-intro"><p>${services[0].intro}</p><span>${services[0].features[1]}</span></div>
      <div class="letter-article">
        ${approach.map((item, index) => `
          <article class="letter-article-part">
            <span class="letter-index" aria-hidden="true">0${index + 1}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </article>`).join('')}
      </div>`, 'letter-service letter-rule'),

    section('about', `
      <div class="letter-biography">
        ${heading('ОБО МНЕ', 'Анастасия Доронина')}
        <div class="letter-biography-text">${biography}</div>
      </div>`, 'letter-about letter-rule'),

    section('process', `
      ${heading('ЭТАПЫ', 'От обсуждения запроса до начала работы няни')}
      <ol class="letter-route">
        ${stages.map((stage, index) => `
          <li class="letter-route-step">
            <span class="letter-route-number" aria-hidden="true">${index + 1}</span>
            <h3>${stage.title}</h3>
            <div><p>${stage.action}</p><p class="letter-outcome"><span>Для вашей семьи</span>${stage.result}</p></div>
          </li>`).join('')}
      </ol>`, 'letter-process letter-rule'),

    section('pricing', `
      ${heading('СТОИМОСТЬ И УСЛОВИЯ', 'Два формата работы')}
      <div class="letter-plans">
        ${services.map(service => `
          <article class="letter-plan">
            <div class="letter-plan-summary">
              <h3>${service.title}</h3>
              <p class="letter-price">${service.price}</p>
              <p>${service.intro}</p>
              ${button(service.action, service.title)}
            </div>
            <div class="letter-plan-details">
              <ul>${service.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
              <p class="letter-plan-terms">${service.terms}</p>
            </div>
          </article>`).join('')}
      </div>`, 'letter-pricing letter-rule'),

    section('reviews', `
      ${heading('ОТЗЫВЫ', 'Отзывы семей')}
      <div class="letter-correspondence">
        ${reviews.map(review => `
          <figure class="letter-review">
            <figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption>
            <blockquote><p>«${review.text}»</p></blockquote>
          </figure>`).join('')}
      </div>`, 'letter-reviews letter-rule'),

    section('request', `
      <div class="letter-request-heading">
        ${heading('ОСТАВИТЬ ЗАЯВКУ', 'Готовы обсудить подбор?')}
        <div>${requestCopy}${tg()}</div>
      </div>
      <div class="letter-request-form">${form('letter')}</div>`, 'letter-request letter-rule'),
  ].join('');

  return frame({id: '02-letter', body, version});
}
