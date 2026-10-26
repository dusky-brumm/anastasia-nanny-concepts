import {
  frame, headline, intro, biography, stages, services, reviews,
  cafe, profileSample, heading, section, button, tg, form, requestCopy,
} from './common.mjs';

const serviceFlow = [
  {title: 'Запрос семьи', text: 'График, обязанности, особенности ребёнка и подход к воспитанию.'},
  {title: 'Тема интервью', text: 'Для семьи со школьниками — уроки и конфликты; с маленьким ребёнком — адаптация, уход и детские эмоции.'},
  {title: 'Личный комментарий', text: 'Опыт няни, её подход к детям и соответствие вашему запросу.'},
];

const routeStep = (stage, index) => `
  <li class="profile-route-step">
    <span class="profile-route-number" aria-hidden="true">0${index + 1}</span>
    <h3>${stage.title}</h3>
    <p>${stage.action}</p>
    <div class="profile-route-result"><span>Для вашей семьи</span><p>${stage.result}</p></div>
  </li>`;

export function render(version = '1') {
  const body = [
    section('hero', `
      <div class="profile-hero-grid">
        <div class="profile-hero-copy">
          <span class="eyebrow">ИНДИВИДУАЛЬНЫЙ ПОДБОР НЯНИ</span>
          <h1>${headline}</h1>
          <p>${intro}</p>
          <div class="actions">${button()}${tg()}</div>
          <div class="profile-identity">${cafe(true)}<div><span>Анастасия Доронина</span><p>Занимаюсь подбором нянь с 2022 года.</p></div></div>
        </div>
        <div class="profile-hero-document">${profileSample()}</div>
      </div>`, 'profile-hero'),

    section('service', `
      ${heading('ОБ УСЛУГЕ', 'Подробные профили и личные комментарии')}
      <div class="profile-service-flow">
        ${serviceFlow.map(item => `<article class="profile-service-row"><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}
      </div>`, 'profile-service profile-rule'),

    section('about', `
      <div class="profile-about-grid">
        <figure class="profile-about-photo">${cafe(false, true)}<figcaption>Анастасия Доронина</figcaption></figure>
        <div class="profile-about-copy">${heading('ОБО МНЕ', 'Опыт подбора и работы с детьми')}<div class="profile-biography">${biography}</div></div>
      </div>`, 'profile-about profile-rule'),

    section('process', `
      ${heading('ЭТАПЫ ПОДБОРА', 'От запроса до сопровождения')}
      <div class="profile-route">
        <ol class="profile-route-set profile-route-set-two">${stages.slice(0, 2).map((stage, index) => routeStep(stage, index)).join('')}</ol>
        <ol class="profile-route-set profile-route-set-three" start="3">${stages.slice(2).map((stage, index) => routeStep(stage, index + 2)).join('')}</ol>
      </div>`, 'profile-process profile-rule'),

    section('pricing', `
      ${heading('СТОИМОСТЬ И УСЛОВИЯ', 'Подбор или консультация')}
      <div class="profile-comparison">
        ${services.map(service => `
          <article class="profile-plan">
            <div class="profile-plan-head"><h3>${service.title}</h3><p class="profile-price">${service.price}</p><p>${service.intro}</p></div>
            <ul>${service.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
            <p class="profile-plan-terms">${service.terms}</p>
            <div class="profile-plan-action">${button(service.action, service.title)}</div>
          </article>`).join('')}
      </div>`, 'profile-pricing profile-rule'),

    section('reviews', `
      <div class="profile-review-layout">
        ${heading('ОТЗЫВЫ', 'Отзывы семей')}
        <div class="profile-reviews">
          ${reviews.map(review => `
            <figure class="profile-review">
              <blockquote><p>«${review.text}»</p></blockquote>
              <figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption>
            </figure>`).join('')}
        </div>
      </div>`, 'profile-reviews-section profile-rule'),

    section('request', `
      <div class="profile-request-grid">
        <aside class="profile-request-aside">${heading('ОСТАВИТЬ ЗАЯВКУ', 'Готовы обсудить подбор?')}${requestCopy}${tg()}</aside>
        <div class="profile-request-form">${form('profile')}</div>
      </div>`, 'profile-request profile-rule'),
  ].join('');

  return frame({id: '05-profile', body, version});
}
