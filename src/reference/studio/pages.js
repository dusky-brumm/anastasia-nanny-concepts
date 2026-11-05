import {blocks,fontSets,defaults,presets,approvedTheme,approvedThemeStyle,designUrl,selectVariant} from './model.js?v=__VERSION__';
import {renderSite,renderBlock,renderEditorial,renderPencilPreview} from './render.js?v=__VERSION__';
import {seoHead} from './seo.js?v=__VERSION__';
import {additionalDesigns,additionalStyles,renderAdditionalDesign} from './additional-designs.js?v=__VERSION__';
import {referenceDesigns,referencePage,referenceBlockFile} from './reference-designs.js?v=__VERSION__';

export const comparisonDesigns=[
  {mode:'comparison-current',file:'comparison-current.html',name:'Текущий',reviews:'cards',form:1,footer:3,refinement:'quiet'},
  {mode:'pencil',file:'pencil-preview.html',name:'Вариант 1',reviews:'open',form:2,footer:2,refinement:'letter'},
  {mode:'comparison-route',file:'comparison-route.html',name:'Вариант 7',reviews:'cards',form:3,footer:3,process:7,refinement:'route'},
  {mode:'comparison-reference',file:'comparison-reference.html',name:'Вариант 9',reviews:'open',form:2,footer:5,layout:'112111113',wavyArrows:true,refinement:'reference'},
  {mode:'comparison-thread',file:'comparison-thread.html',name:'Линия-письмо',reviews:'open',form:2,footer:5,hero:11,contour:'letter',single:true},
  ...additionalDesigns,
  ...referenceDesigns,
];
export const retiredDesignFiles = [
  'pencil-panorama','pencil-album','comparison-gradients',
  'comparison-contour','comparison-journal','comparison-chalk-arc',
].flatMap(name=>[`${name}.html`,`${name}-refined.html`]);
const preferredDesignFile=design=>design.single?design.file:design.file.replace('.html','-refined.html');

const compositionCount=blocks.reduce((total,block)=>total+block.variants.length,0);
export const comparisonBlockChoices = {
  hero: ['Первый блок', [
    ['quiet','Основной вариант',6],
  ]],
  pricing: ['Стоимость и гарантия', [
    ['quiet','Один оклад · три условия',1],
  ]],
  reviews: ['Отзывы', [
    ['quiet','Две открытые цитаты',1,'cards'], ['letter','Цитаты с тонкими линиями',1,'open'], ['album','Одна большая цитата',1,'ribbon'],
  ]],
  apply: ['Форма', [
    ['quiet','Светлая карточка',1], ['letter','Тонкие линии',2], ['album','Два поля рядом · из варианта 4',1], ['air','Поля друг под другом · из варианта 6',2], ['route','Рисованная рамка',3], ['reference','Поля с подчёркиванием',1],
  ]],
  service: ['Об услуге', [
    ['quiet','Личное интервью и фото',1], ['letter','Фото и открытые строки',2], ['panorama','Запрос и результат',5],
  ]],
  about: ['Об Анастасии', [
    ['quiet','Знакомство в четырёх кадрах',1], ['reference','Портрет и текст',2], ['letter','Личное письмо',3], ['album','Семейный альбом',4],
  ]],
  process: ['Маршрут', [
    ['reference','Рисованные стрелки',1], ['air','Голубая волна',7], ['route','Изогнутая линия',7],
  ]],
  footer: ['Футер', [
    ['quiet','Лаконичный с рисунками',3],
  ]],
};
for (const [, choices] of Object.values(comparisonBlockChoices)) {
  choices.push(...referenceDesigns.map(design => [design.mode,design.name,null]));
}

function comparisonBlockMarkup(id,style,variant,context) {
  const design = referenceDesigns.find(item => item.mode === style);
  if (!design) return renderBlock(id,variant,context);
  return `<div class="reference-block-preview" id="${context.blockId ?? id}"><iframe data-reference-frame src="${referenceBlockFile(design,id)}?v=__VERSION__" title="${comparisonBlockChoices[id][0]} — ${design.name}" loading="lazy" height="320"></iframe></div>`;
}

const comparisonBaseTheme = approvedTheme.id;
const comparisonState={layout:'161272113',palette:'sky',font:'golos'};
const comparisonBaseStyle = approvedThemeStyle;
const fixedThemeAttributes = `data-comparison-theme="${comparisonBaseTheme}" style="${comparisonBaseStyle}"`;

const assemblyPresets = [
  {
    name:'Свет и воздух',
    description:'Личное интервью, портрет, голубая волна и прозрачная форма.',
    choices:{service:'quiet',about:'reference',process:'air',pricing:'quiet',reviews:'letter',apply:'letter',footer:'quiet'},
  },
  {
    name:'Как личное письмо',
    description:'Открытые строки, семейный альбом и отдельный акцент на гарантии.',
    choices:{service:'letter',about:'album',process:'reference',pricing:'quiet',reviews:'album',apply:'album',footer:'quiet'},
  },
  {
    name:'Чёткий маршрут',
    description:'Услуга в двух панелях, условия в ряд и форма с тонкими подчёркиваниями.',
    choices:{service:'panorama',about:'reference',process:'route',pricing:'quiet',reviews:'quiet',apply:'reference',footer:'quiet'},
  },
];

function comparisonBlockGallery(blockId) {
  const [title, choices] = comparisonBlockChoices[blockId];
  const previews = choices.map(([style,label,variant,reviews='cards'], index) => {
    const design = comparisonDesigns.find(item => item.refinement === style || item.mode === style);
    const previewFile = design ? preferredDesignFile(design) + '?v=__VERSION__'
      : `compare-assembly.html?v=__VERSION__&amp;${blockId}=${style}`;
    const state = {...defaults, layout:design?.layout ?? defaults.layout};
    const context = {state, comparison:true, blockStyle:style, wavyArrows:design?.wavyArrows, previewFile, previewId:`quotes-choice-${index + 1}`};
    return `<article id="choice-${index + 1}" class="block-compare-choice" data-gallery-choice="${style}">
      <header><h2>${label}</h2><div class="block-compare-actions">
        <a href="${previewFile}#${blockId}">Макет в этом стиле ↗</a>
        <a data-try-assembly="${blockId}" href="compare-assembly.html?v=__VERSION__&amp;${blockId}=${style}#${blockId}">Примерить в сборке</a>
      </div></header>
      <div class="site-preview comparison-design" data-block-style="${style}" data-review-layout="${reviews}" data-refinement="${style}" data-comparison-theme="${comparisonBaseTheme}" style="${comparisonBaseStyle}">
        ${comparisonBlockMarkup(blockId,style,variant,{...context,blockId:`${blockId}-choice-${index+1}`})}
      </div>
    </article>`;
  });
  return `<header class="block-compare-heading">
    <div class="block-compare-actions"><a href="comparison-current-refined.html?v=__VERSION__#${blockId}">← К целым макетам</a><a data-keep-assembly href="compare-assembly.html?v=__VERSION__">Собрать свой вариант ↗</a></div>
    <h1>${title}</h1>
    <nav aria-label="Блоки для сравнения">${Object.entries(comparisonBlockChoices).map(([key,[label]]) =>
      `<a data-keep-assembly data-gallery-block="${key}" href="compare-block-${key}.html?v=__VERSION__"${key === blockId ? ' aria-current="page"' : ''}>${label}</a>`
    ).join('')}</nav>
    <nav aria-label="Варианты блока" data-gallery-jumps>${choices.map(([,label], index) => `<a href="#choice-${index + 1}">${label}</a>`).join('')}</nav>
    <div class="block-pair-tools" data-block-pair-tools hidden>
      <button class="block-pair-toggle" type="button" data-block-pair-toggle aria-expanded="false" aria-controls="block-pair-settings">Сравнить два варианта</button>
      <div class="block-pair-settings" id="block-pair-settings" hidden>
        ${['Первый вариант','Второй вариант'].map((label, side) => `<label>${label}
          <select data-pair-choice>${choices.map(([style, name], index) => `<option value="${style}"${index===side?' selected':''}>${name}</option>`).join('')}</select>
        </label>`).join('')}
        <label>Расположение<select data-pair-layout>
          <option value="side">Рядом на широком экране</option>
          <option value="stack">На всю ширину</option>
        </select></label>
      </div>
    </div>
  </header>
  <main class="block-compare-list" data-gallery-list>${previews.join('')}</main>`;
}

function comparisonAssembly() {
  const order = ['hero','service','about','process','pricing','reviews','apply','footer'];
  const initial = {about:'quiet',apply:'letter'};
  const top = ['header'].map(id => {
    const index = blocks.findIndex(block => block.id === id);
    return renderBlock(id,comparisonState.layout[index],{state:comparisonState,comparison:true});
  }).join('');
  const parts = order.map(id => {
    const [label, choices] = comparisonBlockChoices[id];
    const selected = initial[id] ?? choices[0][0];
    const previews = choices.map(([style,name,variant,reviews='cards']) => ({
      style, name, reviews,
      markup:comparisonBlockMarkup(id,style,variant,{
        state:defaults,comparison:true,blockStyle:style,wavyArrows:style==='reference',
        blockId:style===selected?id:`${id}-${style}`,
        previewId:`assembly-quotes-${style}`,
      }),
    }));
    const current = previews.find(preview => preview.style === selected);
    return `<div class="assembly-part" data-assembly-part="${id}">
      <div class="assembly-control">
        <label>${label}<select data-assembly-choice${previews.length===1?' disabled':''}>${previews.map(({style,name}) =>
          `<option value="${style}"${style===selected?' selected':''}>${name}</option>`).join('')}</select></label>
        <a data-assembly-gallery href="compare-block-${id}.html?v=__VERSION__">${previews.length===1?'Посмотреть блок':'Сравнить варианты'} ↗</a>
      </div>
      <div class="comparison-design" data-assembly-preview data-block-style="${current.style}" data-refinement="${current.style}" data-review-layout="${current.reviews}">${current.markup}</div>
${previews.filter(preview => preview.style !== selected).map(({style,reviews,markup}) =>
        `<template data-style="${style}" data-reviews="${reviews}">${markup}</template>`).join('')}
    </div>`;
  }).join('');
  return `<header class="block-compare-heading assembly-heading">
    <a href="comparison-current-refined.html?v=__VERSION__">← К целым макетам</a>
    <h1>Собрать свой вариант</h1>
    <p>Выбирайте оформление над каждым блоком. В ссылке сохраняется вся комбинация.</p>
    <section class="assembly-presets" aria-labelledby="assembly-presets-heading">
      <h2 id="assembly-presets-heading">Готовые сочетания</h2>
      <div class="assembly-preset-list">${assemblyPresets.map(({name,description,choices}, index) => {
        const query = new URLSearchParams({v:'__VERSION__', ...choices});
        return `<a class="assembly-preset" href="compare-assembly.html?${query.toString().replaceAll('&','&amp;')}">
          <span class="assembly-preset-number" aria-hidden="true">0${index+1}</span>
          <strong>${name}</strong><span>${description}</span>
        </a>`;
      }).join('')}</div>
    </section>
    <nav aria-label="Перейти к блоку">${order.map(id => `<a href="#${id}">${comparisonBlockChoices[id][0]}</a>`).join('')}</nav>
    <div class="assembly-share">
      <button type="button" data-copy-assembly>Скопировать ссылку</button>
      <a href="?view=site" data-assembly-view>Посмотреть как сайт ↗</a>
      <input readonly aria-label="Ссылка на сборку" data-assembly-url hidden>
      <span role="status" data-assembly-status></span>
    </div>
    <a class="assembly-return" href="compare-assembly.html" data-assembly-view hidden>← Редактировать сборку</a>
  </header>
  <main class="site-preview comparison-design assembly-site" data-font="${defaults.font}" data-comparison-theme="${comparisonBaseTheme}" style="${comparisonBaseStyle}">
    ${top}${parts}
  </main>`;
}
const options=(items,selected)=>items.map(p=>`<option value="${p.id}"${selected===p.id?' selected':''}>${p.name}</option>`).join('');
const privacy='<dialog id="studio-privacy" aria-labelledby="privacy-heading"><button type="button" class="tool-close" data-close aria-label="Закрыть окно">×</button><h2 id="privacy-heading">О данных формы</h2><p>Заявка составляется в вашем браузере. Имя, контакт и текст не сохраняются и автоматически не передаются. Вы самостоятельно отправляете подготовленное сообщение Анастасии в Telegram.</p></dialog>';
const designPanel=`<nav class="design-panel" aria-label="Просмотр вариантов">
  <label class="design-version-label">Дизайн<select data-design-navigation aria-label="Выбрать дизайн сайта">${comparisonDesigns.map(item=>`<option value="${preferredDesignFile(item)}?v=__VERSION__">${item.name}</option>`).join('')}</select></label>
  <a class="design-panel-caption" href="compare-block-pricing.html?v=__VERSION__">Сравнение блоков ↗</a>
</nav>`;
function controls() {
  return `<aside class="studio-controls" id="studio-settings" aria-label="Настройки дизайна"><section><h2>Готовые сборки</h2><p class="tool-hint">Сборка 1 — рекомендованная. Любой блок можно заменить.</p><div class="preset-buttons">${presets.map(p=>`<button type="button" data-preset="${p.id}" aria-label="Сборка ${p.id}: ${p.name}" title="${p.name}" aria-pressed="${p.id==='1'}">${p.id}</button>`).join('')}</div></section>
  <section><label class="tool-label">Набор шрифтов<select data-font-select>${options(fontSets,defaults.font)}</select></label><p class="tool-hint" data-font-note>Современный основной набор</p></section>
  <section><h2>Блоки страницы</h2><div class="block-controls">${blocks.map((b,i)=>`<div class="block-control"><label class="tool-label">${i+1}. ${b.name}<select data-block-select="${b.id}">${b.variants.map((name,v)=>`<option value="${v+1}"${Number(defaults.layout[i])===v+1?' selected':''}>${v+1} · ${name}</option>`).join('')}</select></label><a data-library-link="${b.id}" href="${designUrl('blocks-'+b.id+'.html',defaults)}">Сравнить варианты ↗</a></div>`).join('')}</div></section>
  <section><label class="tool-label">Ссылка на выбранный сайт<input class="share-url" readonly data-share-url aria-label="Ссылка на выбранный сайт"></label><button class="tool-button" type="button" data-copy-design>Скопировать ссылку</button><p class="tool-hint">В ссылке сохраняются блоки и шрифты.</p><p class="tool-status" role="status" data-copy-status></p></section></aside>`;
}
const heroDirections=[
  'Базовый вариант для сравнения. Акцент на заголовке и портрете.',
  'Свободный штрих связывает снимки. Такой приём можно повторять в фотоколлажах и отзывах.',
  'Карандашная дуга поддерживает форму фото. Тот же мотив подойдёт для карточек и фотографий ниже.',
  'Линия проходит между текстом и фото. На остальных экранах она может вести взгляд от блока к блоку.',
  'Широкий заголовок и лёгкая линия внизу. Этот приём подойдёт для переходов между крупными разделами.',
  'Квадратный портрет с карандашными уголками. Тонкая линия внизу повторяет плавную волну к следующему блоку.',
  'Контур у фото и более бледный штрих на фоне. Один рисунок работает и в деталях, и в переходах.',
  'Два штриха повторяют одну форму, но второй виден только на части края. Приём подходит для выделения отдельных деталей.',
  'Линия с петлёй проходит под всей композицией. Она может продолжиться в маршруте подбора няни.',
  'Мягкий срез открывает портрет, а тонкий карандашный штрих повторяет его верхний и нижний края.',
  'Узкий портрет, заголовок с засечками и плавный штрих, как на краю листа бумаги.',
];
function library(id) {
  const block=blocks.find(b=>b.id===id)??blocks[1];
  const isHero=block.id==='hero';
  return `<header class="tool-top"><div><a class="tool-brand" data-back-builder href="${designUrl('studio.html',defaults)}">НАСТЯ · ДИЗАЙН САЙТА</a><h1>${block.name} · ${block.variants.length} вариантов</h1></div><a class="tool-button" data-back-builder href="${designUrl('studio.html',defaults)}">← В конструктор</a></header>
  <main class="block-library"${isHero?' data-hero-gallery':''}><div class="library-controls"><label class="tool-label library-block-select">Блок страницы<select data-block-page-select>${blocks.map((b,i)=>`<option value="${b.id}"${b.id===block.id?' selected':''}>${i+1}. ${b.name}</option>`).join('')}</select></label><label class="tool-label">Шрифты<select data-font-select>${options(fontSets,defaults.font)}</select></label></div><nav class="block-tabs" aria-label="Все девять блоков">${blocks.map((b,i)=>`<a href="${designUrl('blocks-'+b.id+'.html',defaults)}" data-library-link="${b.id}"${b.id===block.id?' aria-current="page"':''}>${i+1}. ${b.name}</a>`).join('')}</nav><p class="library-hint">Сравните оформление и выберите вариант. Шрифты можно переключать сверху.</p><nav class="variant-jumps" aria-label="Перейти к варианту">${block.variants.map((_,i)=>`<a href="#variant-${i+1}">Вариант ${i+1}</a>`).join('')}</nav>
${isHero?'<div class="hero-gallery-controls" hidden><button class="tool-button" type="button" data-hero-step="-1" aria-label="Предыдущий вариант">←</button><span data-hero-position aria-live="polite"></span><button class="tool-button" type="button" data-hero-step="1" aria-label="Следующий вариант">→</button></div>':''}
${block.variants.map((name,i)=>`<section class="library-option" id="variant-${i+1}" data-option="${i+1}"><header><div><p class="tool-kicker">ВАРИАНТ ${String(i+1).padStart(2,'0')}</p><h2>${name}</h2>${isHero?`<p class="hero-direction">${heroDirections[i]}</p>`:''}</div><div class="library-actions"><a class="tool-link" data-open-option="${i+1}" href="${designUrl('preview.html',selectVariant(defaults,block.id,i+1),block.id)}" target="_blank" rel="noopener">На странице ↗</a><a class="tool-button" data-pick-block="${block.id}" data-pick-value="${i+1}" href="${designUrl('studio.html',selectVariant(defaults,block.id,i+1),block.id)}">Выбрать этот вариант</a></div></header><div class="site-preview" data-font="${defaults.font}" data-palette="${defaults.palette}" ${fixedThemeAttributes}>${renderBlock(block.id,i+1,{library:true,state:defaults})}</div></section>`).join('')}</main>`;
}
export function studioPage(mode='studio',blockId='hero',pageFile='studio.html') {
  const blockCompare=mode==='comparison-library';
  const assembling=mode==='comparison-assembly';
  const title=assembling?'Собрать свой вариант — Настя':blockCompare?`${comparisonBlockChoices[blockId][0]} — сравнение вариантов`:mode==='studio'?`Конструктор сайта — ${compositionCount} вариантов блоков`:mode==='library'?'Варианты блока — Настя':'Настя — индивидуальный подбор няни';
  const content=mode==='studio'?`<header class="tool-top"><div><a class="tool-brand" data-back-builder href="./">НАСТЯ · ДИЗАЙН САЙТА</a><h1>Конструктор дизайна</h1><p>${compositionCount} композиций для 9 блоков · 4 набора шрифтов</p></div><a class="tool-button tool-button--dark" data-open-preview href="${designUrl('preview.html',defaults)}" target="_blank" rel="noopener">Открыть выбранный сайт ↗</a></header><main class="studio-workspace"><button class="mobile-settings-toggle tool-button" type="button" data-mobile-settings aria-expanded="false" aria-controls="studio-settings">Настроить блоки и шрифты</button>${controls()}<section class="studio-canvas" aria-label="Предпросмотр сайта"><div class="canvas-toolbar"><span data-current-design>Почти белый · Manrope + Golos Text</span><div><button type="button" data-view="desktop" aria-pressed="true">Компьютер</button><button type="button" data-view="mobile" aria-pressed="false">Телефон</button></div></div><div class="site-preview" data-site-root data-font="${defaults.font}" data-palette="${defaults.palette}" ${fixedThemeAttributes}>${renderSite(defaults)}</div></section></main>`:mode==='library'?library(blockId):`<main class="site-preview" data-site-root data-font="${defaults.font}" data-palette="${defaults.palette}" ${fixedThemeAttributes}>${renderSite(defaults)}</main>`;
  const editorial=mode==='editorial';
  const design=comparisonDesigns.find(item=>item.mode===mode.replace(/-refined$/,''));
  // Retired base URLs also render the retained, improved design.
  const refined=Boolean(design&&!design.single);
  const comparing=Boolean(design);
  const pencil=design?.mode.startsWith('pencil');
  const contourDirection=design?.contour==='wave'&&!refined ? '' : design?.contour;
  const pencilSwitcher=comparing?`<nav class="pencil-comparison" aria-label="Сравнить варианты">
    <details class="comparison-disclosure" open>
      <summary>Варианты дизайна <span>${design.name}${refined?' · улучшенный':''}</span></summary>
      <div class="comparison-content">
    <label class="design-version-label">Дизайн<select data-design-navigation aria-label="Выбрать дизайн сайта">${comparisonDesigns.map(item=>`<option value="${preferredDesignFile(item)}?v=__VERSION__"${design.mode===item.mode?' selected':''}>${item.name}</option>`).join('')}</select></label>
    <div class="comparison-pairs">${comparisonDesigns.map(item=>`<div class="comparison-pair">
      <a href="${preferredDesignFile(item)}?v=__VERSION__"${design.mode===item.mode?' aria-current="page"':''}>${item.name}</a>
    </div>`).join('')}</div>
    <div class="block-compare-actions">
      <a class="block-compare-link" href="compare-block-pricing.html?v=__VERSION__">Сравнение блоков ↗</a>
    </div>
      </div>
    </details>
  </nav>`:'';
  if(design?.reference)return referencePage(design,pencilSwitcher);
  const description=mode==='preview'||editorial||comparing?'Личный подбор няни под задачи вашей семьи. Поиск, интервью и сопровождение. Анастасия Доронина.':`${compositionCount} композиций блоков сайта, пастельные палитры и согласованные наборы шрифтов.`;
  let pageContent=assembling?comparisonAssembly():blockCompare?comparisonBlockGallery(blockId):content;
  if(editorial)pageContent=`<main class="site-preview editorial" data-font="${defaults.font}" ${fixedThemeAttributes}>${renderEditorial(defaults)}</main>`;
  if(design&&!design.imported){
    let state={...comparisonState,layout:design.layout??comparisonState.layout};
    if(design.hero)state=selectVariant(state,'hero',design.hero);
    if(design.refinement==='quiet')state=selectVariant(state,'about',1);
    if(design.process)state=selectVariant(state,'process',design.process);
    if (refined) {
      const changes = {
        quiet: {about:1},
        letter: {service:2,about:3},
      }[design.refinement] ?? {};
      for (const [block, variant] of Object.entries(changes)) {
        state = selectVariant(state,block,variant);
      }
    }
    if(contourDirection==='letter') {
      state=selectVariant(state,'service',2);
      state=selectVariant(state,'about',3);
      state=selectVariant(state,'process',1);
    }
    state=selectVariant(state,'apply',refined&&!contourDirection?({1:2,2:1,3:1})[design.form]:design.form);
    state=selectVariant(state,'footer',refined&&!contourDirection?({1:3,2:5,3:2,5:1})[design.footer]:design.footer);
    const reviewLayout=refined?({cards:'ribbon',feature:'open',open:'cards'})[design.reviews]:design.reviews;
    const blockStyle=contourDirection==='wave'?'reference':contourDirection==='letter'?'letter':design.refinement??'quiet';
    const context={comparison:true,blockStyle,contourDirection,formStyle:design.refinement==='quiet'||contourDirection?'letter':undefined,wavyArrows:design.wavyArrows||contourDirection==='letter'};
    const markup=pencil?renderPencilPreview(state,design.mode,context):renderSite(state,context);
    pageContent=`<main class="site-preview comparison-design${pencil?' pencil-preview '+design.mode:''}" ${fixedThemeAttributes} data-palette="${pencil?'':state.palette}" data-review-layout="${reviewLayout}" data-block-style="${blockStyle}"${refined?` data-refinement="${blockStyle}"`:''}${contourDirection?` data-contour-direction="${contourDirection}"`:''}>${markup}</main>`;
  }
  if(design?.imported)pageContent=renderAdditionalDesign(design);
  return `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${seoHead(pageFile,{title,description})}<meta name="theme-color" content="#faf6ec">
${design?.imported?additionalStyles(design):''}
<link rel="preload" href="fonts/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk7PFO_F.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="studio/fonts/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="fonts.css?v=__VERSION__"><link rel="stylesheet" href="studio/fonts.css?v=__VERSION__">
<link rel="stylesheet" href="journeys.css?v=__VERSION__"><link rel="stylesheet" href="studio/site.css?v=__VERSION__"><link rel="stylesheet" href="studio/ui.css?v=__VERSION__">
${editorial?'<link rel="stylesheet" href="studio/editorial.css?v=__VERSION__">':''}
${comparing||blockCompare||assembling?'<link rel="stylesheet" href="studio/pencil-preview.css?v=__VERSION__"><link rel="stylesheet" href="studio/comparison-design.css?v=__VERSION__"><link rel="stylesheet" href="studio/comparison-sections.css?v=__VERSION__">':''}
<link rel="stylesheet" href="studio/clear-sections.css?v=__VERSION__">
<link rel="stylesheet" href="studio/unified-designs.css?v=__VERSION__"><script defer src="studio/unified-designs.js?v=__VERSION__"></script>
<link rel="stylesheet" href="studio/design-chrome.css?v=__VERSION__">
${contourDirection?'<link rel="stylesheet" href="studio/contour-design.css?v=__VERSION__"><script defer src="studio/contour-motion.js?v=__VERSION__"></script>':''}
<link rel="icon" href="favicon.svg"><script type="module" src="studio/app.js?v=__VERSION__"></script>
<script defer src="studio/review-carousel.js?v=__VERSION__"></script>
${mode==='library'&&blockId==='hero'?'<script defer src="studio/hero-gallery.js?v=__VERSION__"></script>':''}
${comparing||blockCompare||assembling?'<script defer src="studio/comparison-palettes.js?v=__VERSION__"></script><script defer src="studio/comparison-request.js?v=__VERSION__"></script>':''}
${assembling||blockCompare?'<script defer src="studio/comparison-assembly.js?v=__VERSION__"></script><script defer src="studio/reference-frames.js?v=__VERSION__"></script>':''}
</head><body data-fixed-theme="${comparisonBaseTheme}" class="design-tool ${mode==='preview'||(comparing&&!pencil)?'preview-only':''}" data-mode="${design?.mode??mode}" data-library-block="${blockId}"${pageFile==='index.html'?' data-live-request':''}>${mode==='preview'?designPanel:pencilSwitcher}${pageContent}${privacy}<noscript><p class="tool-noscript">${mode==='preview'||editorial||comparing?'Для подготовки заявки включите JavaScript или напишите Анастасии в Telegram.':'Для переключения дизайна и подготовки заявки включите JavaScript. Базовая страница доступна для просмотра.'}</p></noscript></body></html>`;
}
