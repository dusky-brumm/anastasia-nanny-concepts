import {termsMarkup,
  frame, headline, intro, biography, stages, services, reviews,
  cafe, photo, heading, section, actions, button, tg, form, requestCopy,
} from './common.mjs';

export function render(version = '1') {
  const body = [
    section('hero', `
      <div class="album-strip" aria-label="Фотографии Анастасии">
        <figure class="album-picture album-picture-family">${photo('nastya-family', 'Анастасия с детьми', true)}</figure>
        <figure class="album-picture album-picture-cafe">${cafe(true, 'album-strip-cafe')}</figure>
        <figure class="album-picture album-picture-child">${photo('nastya-child', 'Анастасия с ребёнком', true)}</figure>
      </div>
      <div class="album-cover-copy">
        <span class="eyebrow">АНАСТАСИЯ ДОРОНИНА / ПОДБОР НЯНИ</span>
        <h1>${headline}</h1>
        <div class="album-cover-bottom"><p>${intro}</p>${actions()}</div>
      </div>`, 'album-hero'),

    section('service', `
      ${heading('О ПОДБОРЕ', 'Поиск под задачи вашей семьи')}
      <div class="album-service-copy">
        <p class="album-service-lead">Сначала мы обсуждаем график, обязанности и правила семьи. С этими задачами я знакомлю няню до собеседования.</p>
        <p>На интервью задаю вопросы о конкретных ситуациях. С няней для малыша обсуждаю уход и адаптацию, для школьника — уроки и отношения между детьми.</p>
        <p class="album-service-outcome">Вы получаете подробный профиль и мои комментарии по каждому кандидату. Вместе обсуждаем, кого пригласить на знакомство.</p>
      </div>`, 'album-service album-rule'),

    section('about', `
      ${heading('ОБО МНЕ', 'Опыт подбора и работы с детьми')}
      <div class="album-biography">${biography}</div>`, 'album-about album-rule'),

    section('process', `
      ${heading('ЭТАПЫ РАБОТЫ', 'Пять этапов и результат каждого')}
      <div class="album-route">
        ${stages.map((stage, index) => `
          <details class="album-stage">
            <summary><span class="album-stage-number" aria-hidden="true">0${index + 1}</span><span class="album-stage-copy"><span class="album-stage-title">${stage.title}</span><span class="album-stage-result">${stage.result}</span></span><span class="album-stage-toggle" aria-hidden="true">+</span></summary>
            <div class="album-stage-action"><span>Мои действия на этом этапе</span><p>${stage.action}</p></div>
          </details>`).join('')}
      </div>`, 'album-process album-rule'),

    section('pricing', `
      ${heading('СТОИМОСТЬ И УСЛОВИЯ', 'Подбор или консультация')}
      <div class="album-formats" data-tabs="album-formats">
        <div class="album-format-tabs" role="tablist" aria-label="Форматы работы">
          ${services.map((service, index) => `<button type="button" role="tab" id="album-tab-${service.key}" data-format-service="${service.title}" aria-controls="album-panel-${service.key}" aria-selected="${index === 0 ? 'true' : 'false'}" tabindex="${index === 0 ? '0' : '-1'}"><span>${service.title}</span><strong>${service.price}</strong></button>`).join('')}
        </div>
        ${services.map(service => `
          <article data-service-plan="${service.key}" class="album-format-panel" role="tabpanel" id="album-panel-${service.key}" aria-labelledby="album-tab-${service.key}" tabindex="0">
            <div class="album-plan-heading"><h3>${service.title}</h3><p class="album-price">${service.price}</p></div>
            <p class="album-plan-intro">${service.intro}</p>
            <ul>${service.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
            <p class="album-plan-terms">${termsMarkup(service.terms)}</p>
            ${button(service.action, service.title)}
          </article>`).join('')}
      </div>`, 'album-pricing album-rule'),

    section('reviews', `
      ${heading('ОТЗЫВЫ', 'Отзывы родителей')}
      <div class="album-reviews">
        ${reviews.map(review => `
          <figure class="album-review"><blockquote><p>«${review.text}»</p></blockquote><figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption></figure>`).join('')}
      </div>`, 'album-reviews-section album-rule'),

    section('request', `
      <div class="album-request-content">
        ${heading('ОСТАВИТЬ ЗАЯВКУ', 'Готовы обсудить подбор?')}
        <div class="album-request-copy">${requestCopy}${tg()}</div>
        <div class="album-request-form">${form('album')}</div>
      </div>`, 'album-request album-rule'),
  ].join('');

  return frame({id: '05-album', body, version});
}
