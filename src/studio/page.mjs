import { renderAbout, renderApproach, renderRoute, renderReviews, renderPricing, renderFAQ, renderRequest, renderSymbols, privacyDialog, icon, escape } from './components.mjs';
import { heroes, portraitRail, chapterRail } from './heroes.mjs';

const sections = { about: renderAbout, approach: renderApproach, route: renderRoute, reviews: renderReviews, pricing: renderPricing };

export function renderPage(concept, available) {
  const index = available.findIndex(item=>item.id===concept.id);
  const previous = available[(index + available.length - 1) % available.length];
  const next = available[(index + 1) % available.length];
  const toolbar = `<div class="review-toolbar"><a href="../collection.html#card-${concept.id}">← Все направления</a><div class="direction-picker"><a href="${previous.id}.html" aria-label="Предыдущий вариант">←</a><label class="sr-only" for="direction-choice">Выбрать вариант</label><select id="direction-choice" data-direction-select>${available.map(item=>`<option value="${item.id}.html" ${item.id===concept.id?'selected':''}>${String(item.number).padStart(2,'0')} / ${item.name}</option>`).join('')}</select><a href="${next.id}.html" aria-label="Следующий вариант">→</a></div><button type="button" class="favorite-toggle" data-favorite-id="${concept.id}" data-favorite-name="${escape(concept.name)}" aria-pressed="false">♡ В избранное</button></div>`;
  const header = `<header class="site-header inner"><a class="brand" href="#top"><span>Анастасия.</span><small>личный подбор няни</small></a><nav class="desktop-nav" aria-label="Основная навигация"><a href="#about">Обо мне</a><a href="#approach">Подход</a><a href="#route">Этапы</a><a href="#pricing">Условия</a></nav><a class="header-cta" href="#request">Давайте знакомиться ${icon('arrow')}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Открыть меню"><span></span><span></span></button><nav class="mobile-nav" id="mobile-nav" hidden aria-label="Мобильная навигация"><a href="#about">Обо мне</a><a href="#approach">Мой подход</a><a href="#route">Этапы подбора</a><a href="#pricing">Стоимость</a><a href="#request">Составить заявку</a></nav></header>`;
  const content = concept.order.map(key=>sections[key](concept[key])).join('') + renderFAQ() + renderRequest();
  let main;
  if(concept.hero==='nearby')main=`<main id="main-content" class="side-page inner">${portraitRail()}<div class="side-content">${heroes[concept.hero]()}${content}</div></main>`;
  else if(concept.hero==='chapters')main=`<main id="main-content" class="chapter-page inner">${chapterRail()}<div class="chapter-content">${heroes[concept.hero]()}${content}</div></main>`;
  else main=`<main id="main-content">${heroes[concept.hero]()}${content}</main>`;
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#e9f3f7">
<title>${escape(concept.name)} — Анастасия, личный подбор няни</title><meta name="description" content="${escape(concept.summary)} Персональный подбор няни с вниманием к вашей семье.">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500&family=Lora:ital,wght@0,400;0,500;1,400&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="studio.css"><link rel="stylesheet" href="layouts.css"><link rel="stylesheet" href="../shared-ui.css"><script type="module" src="site.js"></script>
</head>
<body class="direction-${concept.hero}" data-concept-id="${concept.id}">
<a class="skip-link" href="#main-content">Перейти к содержанию</a>${renderSymbols()}${toolbar}<div class="site" id="top">${header}${main}
<footer class="site-footer inner"><a class="brand" href="#top"><span>Анастасия.</span><small>с вниманием к вашей семье</small></a><span>Дизайн-направление «${concept.name}»</span><a href="../collection.html">Все варианты ↗</a><a href="#top">Наверх ↑</a></footer></div>${privacyDialog()}<p class="sr-only" id="favorite-status" role="status"></p>
</body></html>`;
}
