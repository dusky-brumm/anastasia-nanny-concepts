import {frame, headline, biography, approach, stages, services, reviews, photo, cta, link, form} from './common.mjs';

export function render(version = '1') {
  const body = `
    <section id="hero" class="section inner paper-layout paper-hero" data-section="hero">
      <figure class="paper-portrait">
        ${photo('nastya-child', 'Анастасия с ребёнком', true)}
        <figcaption><span>Анастасия Доронина</span>Я — Настя. Помогаю семьям найти своего человека.</figcaption>
      </figure>
      <div class="paper-hello">
        <span class="eyebrow">Личный подбор няни для вашей семьи</span>
        <h1>${headline}</h1>
        <p class="paper-lead">Я беру на себя поиск, собеседования и проверки. А вам оставляю главное — познакомиться и выбрать человека, с которым хочется быть одной командой.</p>
        <div class="actions">${cta()}${link('Познакомиться в Telegram')}</div>
        <p class="paper-hello-note">От первого разговора до выхода няни — общаетесь со мной лично.</p>
      </div>
    </section>

    <section id="service" class="section inner paper-layout paper-section" data-section="service">
      <div class="paper-section-heading">
        <span class="eyebrow">01 · Мой подход</span>
        <h2>Сначала узнаю<br>вашу семью</h2>
        <p>Хороший подбор начинается с внимательного разговора о том, как вы живёте и какая помощь вам нужна.</p>
      </div>
      <div class="paper-sheet paper-approach">
        ${approach.map((item, index) => `<article class="paper-entry"><span class="paper-small-number" aria-hidden="true">0${index + 1}</span><div><h3>${item.title}</h3><p>${item.description}</p></div></article>`).join('')}
      </div>
    </section>

    <section id="about" class="section inner paper-layout paper-section" data-section="about">
      <div class="paper-section-heading">
        <span class="eyebrow">02 · Немного обо мне</span>
        <h2>Знаю поиск<br>с обеих сторон</h2>
      </div>
      <div class="paper-story">
        ${biography}
        <div class="paper-personal-note"><span class="paper-note-mark" aria-hidden="true">↳</span><p>Мне важно, чтобы вы понимали, кого приглашаете в семью. Поэтому я подробно рассказываю о каждом кандидате и делюсь своими наблюдениями.</p></div>
        <span class="paper-signature">Анастасия Доронина</span>
      </div>
    </section>

    <section id="process" class="section inner paper-layout paper-section" data-section="process">
      <div class="paper-section-heading">
        <span class="eyebrow">03 · Как всё проходит</span>
        <h2>Пять шагов<br>к вашей няне</h2>
        <p>На каждом этапе обсуждаем, что происходит и что вы получаете в результате.</p>
      </div>
      <ol class="paper-steps">
        ${stages.map((stage, index) => `<li class="paper-step"><span class="paper-step-number" aria-hidden="true">0${index + 1}</span><div><h3>${stage.title}</h3><p>${stage.action}</p><p class="paper-step-result"><span>Для вашей семьи</span>${stage.result}</p></div></li>`).join('')}
      </ol>
    </section>

    <section id="pricing" class="section inner paper-layout paper-section" data-section="pricing">
      <div class="paper-section-heading">
        <span class="eyebrow">04 · Форматы и стоимость</span>
        <h2>Выберите,<br>как я могу помочь</h2>
        <p>Можно доверить мне весь поиск или подготовиться к нему вместе на консультации.</p>
      </div>
      <div class="paper-prices">
        ${services.map(service => `<article class="paper-sheet paper-price paper-price-${service.key}"><span class="eyebrow">${service.label}</span><div class="paper-price-heading"><h3>${service.title}</h3><p class="paper-price-value">${service.price}</p></div><p class="paper-price-description">${service.description}</p><ul>${service.features.map(feature => `<li>${feature}</li>`).join('')}</ul><p class="paper-price-note">${service.footnote.replace(/^По макету:\s*/, '')}</p>${cta(service.key === 'selection' ? 'Обсудить подбор' : 'Записаться на консультацию', service.title)}</article>`).join('')}
      </div>
    </section>

    <section id="reviews" class="section inner paper-layout paper-section" data-section="reviews">
      <div class="paper-section-heading">
        <span class="eyebrow">05 · Слова родителей</span>
        <h2>Спасибо<br>за ваше доверие</h2>
        <p>Несколько отзывов семей, с которыми мы уже знакомы.</p>
      </div>
      <div class="paper-reviews">
        ${reviews.map(review => `<figure class="paper-review"><blockquote><p>«${review.text}»</p></blockquote><figcaption><span class="paper-review-initial" aria-hidden="true">${review.initial}</span><span><strong>${review.name}</strong><span class="paper-review-detail">${review.detail}</span></span></figcaption></figure>`).join('')}
      </div>
    </section>

    <section id="request" class="section inner paper-layout paper-section paper-request" data-section="request">
      <div class="paper-section-heading">
        <span class="eyebrow">06 · Начнём со знакомства</span>
        <h2>Готовы<br>обсудить подбор?</h2>
        <p>Расскажите немного о семье и о том, с чем нужна помощь. Вместе поймём, с чего начать.</p>
        <div class="paper-request-link">${link('Написать мне в Telegram')}</div>
      </div>
      <div class="paper-sheet paper-form">${form('paper')}</div>
    </section>`;

  return frame({id: '03-paper', title: 'Личная история', body, themeColor: '#f5f3ec', version});
}
