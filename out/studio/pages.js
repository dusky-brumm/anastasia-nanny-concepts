import {blocks,fontSets,defaults,presets,approvedTheme,approvedThemeStyle,designUrl,selectVariant} from './model.js?v=3307846e3a';
import {renderSite,renderBlock,renderEditorial,renderPencilPreview} from './render.js?v=3307846e3a';
import {seoHead,utilityIndexingTags} from './seo.js?v=3307846e3a';
import {additionalDesigns,additionalDesignSources,additionalStyles,renderAdditionalDesign} from './additional-designs.js?v=3307846e3a';
import {referenceDesigns,referenceDesignSources,referencePage,referenceBlockFile,referenceBlockPage} from './reference-designs.js?v=3307846e3a';
import {extractDesignBlock,designBlockFile,designBlockPage,blockIdentity} from './design-blocks.js?v=3307846e3a';
import {illustratedDesigns,illustratedBlockLabel,renderIllustratedDesign,illustratedStyles} from './illustrated-designs.js?v=3307846e3a';
import {earlyDesigns,decorateEarlyDesign,earlyStyles} from './early-designs.js?v=3307846e3a';

export const comparisonDesigns=[
  {mode:'comparison-current',file:'comparison-current.html',name:'Текущий',reviews:'cards',form:1,footer:3,refinement:'quiet'},
  {mode:'pencil',file:'pencil-preview.html',name:'Вариант 1',reviews:'open',form:2,footer:2,refinement:'letter'},
  {mode:'comparison-route',file:'comparison-route.html',name:'Вариант 7',reviews:'cards',form:3,footer:3,process:7,refinement:'route'},
  {mode:'comparison-reference',file:'comparison-reference.html',name:'Вариант 9',reviews:'open',form:2,footer:5,layout:'112111113',wavyArrows:true,refinement:'reference'},
  {mode:'comparison-thread',file:'comparison-thread.html',name:'Линия-письмо',reviews:'open',form:2,footer:5,hero:11,contour:'letter',single:true},
  ...earlyDesigns,
  ...illustratedDesigns,
  ...additionalDesigns,
  ...referenceDesigns,
].map((design,index)=>({...design,number:design.number??String(index+1)}));
// Keep the existing design numbers stable when inserting the combined variant.
comparisonDesigns.splice(5,0,{
  ...earlyDesigns[0],mode:'early-classic-arrows',file:'comparison-early-classic-arrows.html',
  name:'Классика и мелок · рисованные стрелки',number:'5.5',skin:'early-classic',parentMode:'early-classic',processArrows:true,
});
export const retiredDesignFiles = [
  'pencil-panorama','pencil-album','comparison-gradients',
  'comparison-contour','comparison-journal','comparison-chalk-arc',
  'comparison-chalk-story','comparison-editorial','comparison-chalk-album','comparison-chalk-route',
  'comparison-ref-02-elliot','comparison-ref-05-yoga',
].flatMap(name=>[`${name}.html`,`${name}-refined.html`]);
const preferredDesignFile=design=>design.single?design.file:design.file.replace('.html','-refined.html');
const blockTransfers=[
  {source:'editorial-new',destination:'early-personal',block:'hero',file:'retained-editorial-hero-for-personal.html',title:'Первый экран'},
  {source:'reference-02-elliot',destination:'fotoalbum',block:'hero',file:'retained-elliot-hero-for-fotoalbum.html',title:'Первый экран'},
  {source:'chalk-route',destination:'fotoalbum',block:'process',file:'retained-route-process-for-fotoalbum.html',title:'Как проходит подбор'},
];

const compositionCount=blocks.reduce((total,block)=>total+block.variants.length,0);
const savedBlockChoices = {
  header: ['Меню сайта', [['quiet','Общее меню',1]]],
  hero: ['Первый экран', [
    ['quiet','Основной вариант',6],
  ]],
  pricing: ['Стоимость и гарантия', [
    ['quiet','Один оклад · три условия',1],
  ]],
  reviews: ['Отзывы', [
    ['quiet','Две открытые цитаты',1,'cards'], ['letter','Цитаты с тонкими линиями',1,'open'], ['album','Одна большая цитата',1,'ribbon'],
  ]],
  apply: ['Форма', [
    ['letter','Тонкие линии',2], ['album','Рисованная форма · два поля рядом',1], ['air','Рисованная форма · поля друг под другом',2],
  ]],
  service: ['Об услуге', [
    ['quiet','Личное интервью и фото',1], ['letter','Фото и открытые строки',2], ['panorama','Запрос и результат',5],
  ]],
  about: ['Об Анастасии', [
    ['quiet','Знакомство в четырёх кадрах',1], ['reference','Портрет и текст',2], ['letter','Личное письмо',3], ['album','Семейный альбом',4],
  ]],
  process: ['Как проходит подбор', [
    ['reference','Рисованные стрелки',1], ['air','Голубая волна',7], ['route','Изогнутая линия',7],
  ]],
  footer: ['Футер', [
    ['quiet','Лаконичный с рисунками',3],
  ]],
};
export const comparisonBlockChoices=Object.fromEntries(['header','hero','service','about','process','pricing','reviews','apply','footer'].map(id=>[id,savedBlockChoices[id]]));
export const comparisonChoiceDetails = {};
export const designBlockCoverage = {};
export const isolatedDesignBlocks = [];
export const comparisonChoiceAliases = {apply:{quiet:'album',route:'air',reference:'album'}};

function comparisonBlockMarkup(id,style,variant,context) {
  const isolated=comparisonChoiceDetails[id]?.[style]?.file;
  if(isolated)return `<div class="reference-block-preview" id="${context.blockId ?? id}"><iframe data-reference-frame src="${isolated}?v=3307846e3a" title="${comparisonBlockChoices[id][0]} — ${comparisonBlockChoices[id][1].find(choice=>choice[0]===style)[1]}" loading="lazy" height="320"></iframe></div>`;
  const design = referenceDesigns.find(item => item.mode === style);
  if (!design) return renderBlock(id,variant,context);
  return `<div class="reference-block-preview" id="${context.blockId ?? id}"><iframe data-reference-frame src="${referenceBlockFile(design,id)}?v=3307846e3a" title="${comparisonBlockChoices[id][0]} — ${design.name}" loading="lazy" height="320"></iframe></div>`;
}

const comparisonBaseTheme = approvedTheme.id;
const comparisonState={layout:'161272113',palette:'sky',font:'golos'};
const comparisonBaseStyle = approvedThemeStyle;
const fixedThemeAttributes = `data-comparison-theme="${comparisonBaseTheme}" style="${comparisonBaseStyle}"`;

function choiceLabel(id,key){
  const label=comparisonBlockChoices[id][1].find(choice=>choice[0]===key)[1];
  const numbers=comparisonChoiceDetails[id][key].sources.map(source=>source.number).sort((a,b)=>Number(a)-Number(b));
  if(/^Дизайн \d/.test(label)||!numbers.length)return label;
  return `${numbers.join(', ')} · ${label}`;
}

export function assemblyPresetChoices(){
  return comparisonDesigns.map(design=>({
    name:/^Вариант \d+$/.test(design.name)?`Дизайн ${design.number}`:`${design.number} · ${design.name}`,
    description:'Все блоки этого дизайна. Любой из них можно заменить.',
    choices:{...designBlockCoverage[design.mode]},
  }));
}

function comparisonBlockGallery(blockId) {
  const [title, choices] = comparisonBlockChoices[blockId];
  const previews = choices.map(([style,label,variant,reviews='cards'], index) => {
    const design = comparisonDesigns.find(item => item.refinement === style || item.mode === style);
    const details=comparisonChoiceDetails[blockId][style];
    const previewFile = details.sources[0]?.file ? details.sources[0].file + '?v=3307846e3a' : design ? preferredDesignFile(design) + '?v=3307846e3a'
      : `compare-assembly.html?v=3307846e3a&amp;${blockId}=${style}`;
    const state = {...defaults, layout:design?.layout ?? defaults.layout};
    const context = {state, comparison:true, blockStyle:style, wavyArrows:design?.wavyArrows, previewFile, previewId:`quotes-choice-${index + 1}`};
    return `<article id="choice-${index + 1}" class="block-compare-choice" data-gallery-choice="${style}">
      <header><div><h2>${choiceLabel(blockId,style)}</h2><p class="block-choice-sources">${details.sources.length?'Из вариантов '+details.sources.map(source=>source.number).sort((a,b)=>Number(a)-Number(b)).join(', '):'Сохранённый вариант блока'}</p></div><div class="block-compare-actions">
        <button type="button" data-pick-gallery="${style}" aria-pressed="false">Выбрать блок</button>
        <a href="${previewFile}#${blockId}">Макет в этом стиле ↗</a>
        <a data-try-assembly="${blockId}" href="compare-assembly.html?v=3307846e3a&amp;${blockId}=${style}#${blockId}">Примерить в сборке</a>
      </div></header>
      <div class="site-preview comparison-design" data-block-style="${style}" data-review-layout="${reviews}" data-refinement="${style}" data-comparison-theme="${comparisonBaseTheme}" style="${comparisonBaseStyle}">
        ${comparisonBlockMarkup(blockId,style,variant,{...context,blockId:`${blockId}-choice-${index+1}`})}
      </div>
    </article>`;
  });
  return `<header class="block-compare-heading">
    <div class="block-compare-actions"><a href="comparison-current-refined.html?v=3307846e3a#${blockId}">← К целым макетам</a><a data-keep-assembly href="compare-assembly.html?v=3307846e3a">Собрать свой вариант ↗</a></div>
    <h1>${title}</h1>
    <p class="block-gallery-intro">${choices.length} уникальных вариантов. Выберите понравившийся блок, переходите к следующему разделу и собирайте свой дизайн.</p>
    <nav aria-label="Блоки для сравнения">${Object.entries(comparisonBlockChoices).map(([key,[label]]) =>
      `<a data-keep-assembly data-gallery-block="${key}" href="compare-block-${key}.html?v=3307846e3a"${key === blockId ? ' aria-current="page"' : ''}>${label}</a>`
    ).join('')}</nav>
    <nav aria-label="Варианты блока" data-gallery-jumps>${choices.map(([style], index) => `<a href="#choice-${index + 1}">${choiceLabel(blockId,style)}</a>`).join('')}</nav>
  </header>
  <aside class="block-gallery-selection" aria-label="Ваша сборка"><label>Блок<select data-gallery-category>${Object.entries(comparisonBlockChoices).map(([key,[label]])=>`<option value="${key}"${key===blockId?' selected':''}>${label}</option>`).join('')}</select></label><span role="status" data-gallery-status>Выбрано 0 из 9</span><button type="button" data-clear-gallery>Сбросить</button><a data-keep-assembly href="compare-assembly.html?v=3307846e3a">Моя сборка ↗</a></aside>
  <main class="block-compare-list" data-gallery-list data-gallery-current="${blockId}" data-gallery-options="${encodeURIComponent(JSON.stringify(Object.fromEntries(Object.entries(comparisonBlockChoices).map(([id,[,options]])=>[id,options.map(choice=>choice[0])]))))}" data-gallery-aliases="${encodeURIComponent(JSON.stringify(comparisonChoiceAliases))}">${previews.join('')}</main>`;
}

function comparisonAssembly() {
  const order = ['header','hero','service','about','process','pricing','reviews','apply','footer'];
  const initial = {about:'quiet',apply:'letter'};
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
    return `<div class="assembly-part" data-assembly-part="${id}" data-choice-aliases="${encodeURIComponent(JSON.stringify(comparisonChoiceAliases[id]??{}))}">
      <div class="assembly-control">
        <label>${label}<select data-assembly-choice${previews.length===1?' disabled':''}>${previews.map(({style,name}) =>
          `<option value="${style}"${style===selected?' selected':''}>${choiceLabel(id,style)}</option>`).join('')}</select></label>
        <a data-assembly-gallery href="compare-block-${id}.html?v=3307846e3a">${previews.length===1?'Посмотреть блок':'Сравнить варианты'} ↗</a>
      </div>
      <div class="comparison-design" data-assembly-preview data-block-style="${current.style}" data-refinement="${current.style}" data-review-layout="${current.reviews}">${current.markup}</div>
${previews.filter(preview => preview.style !== selected).map(({style,reviews,markup}) =>
        `<template data-style="${style}" data-reviews="${reviews}">${markup}</template>`).join('')}
    </div>`;
  }).join('');
  return `<header class="block-compare-heading assembly-heading">
    <a href="comparison-current-refined.html?v=3307846e3a">← К целым макетам</a>
    <h1>Собрать свой вариант</h1>
    <p>Выбирайте оформление над каждым блоком. В ссылке сохраняется вся комбинация.</p>
    <section class="assembly-presets" aria-labelledby="assembly-presets-heading">
      <h2 id="assembly-presets-heading">Начать с готового дизайна</h2>
      <div class="assembly-preset-list">${assemblyPresetChoices().map(({name,description,choices}, index) => {
        const query = new URLSearchParams({v:'3307846e3a', ...choices});
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
    ${parts}
  </main>`;
}
const options=(items,selected)=>items.map(p=>`<option value="${p.id}"${selected===p.id?' selected':''}>${p.name}</option>`).join('');
const privacy='<dialog id="studio-privacy" aria-labelledby="privacy-heading"><button type="button" class="tool-close" data-close aria-label="Закрыть окно">×</button><h2 id="privacy-heading">О данных формы</h2><p>Заявка составляется в вашем браузере. Имя, контакт и текст не сохраняются и автоматически не передаются. Вы самостоятельно отправляете подготовленное сообщение Анастасии в Telegram.</p></dialog>';
function designButtons(activeMode) {
  return `<div class="comparison-pairs" data-design-navigation>${comparisonDesigns.map(item=>`<a href="${preferredDesignFile(item)}?v=3307846e3a" aria-label="Дизайн ${item.number}: ${item.name}" title="${item.name}"${activeMode===item.mode?' aria-current="page"':''}>${item.number}</a>`).join('')}
    <a class="block-compare-link" href="compare-block-hero.html?v=3307846e3a">Сравнение блоков ↗</a>
  </div>`;
}
const designPanel=`<nav class="design-panel" aria-label="Просмотр вариантов">${designButtons()}</nav>`;
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
export function studioPage(mode='studio',blockId='hero',pageFile='studio.html',sourceDesign) {
  const blockCompare=mode==='comparison-library';
  const assembling=mode==='comparison-assembly';
  const title=assembling?'Собрать свой вариант — Настя':blockCompare?`${comparisonBlockChoices[blockId][0]} — сравнение вариантов`:mode==='studio'?`Конструктор сайта — ${compositionCount} вариантов блоков`:mode==='library'?'Варианты блока — Настя':'Настя — индивидуальный подбор няни';
  const content=mode==='studio'?`<header class="tool-top"><div><a class="tool-brand" data-back-builder href="./">НАСТЯ · ДИЗАЙН САЙТА</a><h1>Конструктор дизайна</h1><p>${compositionCount} композиций для 9 блоков · 4 набора шрифтов</p></div><a class="tool-button tool-button--dark" data-open-preview href="${designUrl('preview.html',defaults)}" target="_blank" rel="noopener">Открыть выбранный сайт ↗</a></header><main class="studio-workspace"><button class="mobile-settings-toggle tool-button" type="button" data-mobile-settings aria-expanded="false" aria-controls="studio-settings">Настроить блоки и шрифты</button>${controls()}<section class="studio-canvas" aria-label="Предпросмотр сайта"><div class="canvas-toolbar"><span data-current-design>Почти белый · Manrope + Golos Text</span><div><button type="button" data-view="desktop" aria-pressed="true">Компьютер</button><button type="button" data-view="mobile" aria-pressed="false">Телефон</button></div></div><div class="site-preview" data-site-root data-font="${defaults.font}" data-palette="${defaults.palette}" ${fixedThemeAttributes}>${renderSite(defaults)}</div></section></main>`:mode==='library'?library(blockId):`<main class="site-preview" data-site-root data-font="${defaults.font}" data-palette="${defaults.palette}" ${fixedThemeAttributes}>${renderSite(defaults)}</main>`;
  const editorial=mode==='editorial';
  const design=sourceDesign??comparisonDesigns.find(item=>item.mode===mode.replace(/-refined$/,''));
  const transfers=blockTransfers.filter(transfer=>transfer.destination===design?.mode);
  // Retired base URLs also render the retained, improved design.
  const refined=Boolean(design&&(!design.single||design.early));
  const comparing=Boolean(design);
  const pencil=design?.baseMode==='pencil'||design?.mode.startsWith('pencil');
  const contourDirection=design?.contour==='wave'&&!refined ? '' : design?.contour;
  const pencilSwitcher=comparing?`<nav class="pencil-comparison" aria-label="Сравнить варианты">${designButtons(design.mode)}</nav>`:'';
  if(design?.reference)return referencePage(design,pencilSwitcher);
  const description=mode==='preview'||editorial||comparing?'Личный подбор няни под задачи вашей семьи. Поиск, интервью и сопровождение. Анастасия Доронина.':`${compositionCount} композиций блоков сайта, пастельные палитры и согласованные наборы шрифтов.`;
  let pageContent=assembling?comparisonAssembly():blockCompare?comparisonBlockGallery(blockId):content;
  if(editorial)pageContent=`<main class="site-preview editorial" data-font="${defaults.font}" ${fixedThemeAttributes}>${renderEditorial(defaults)}</main>`;
  if(design&&!design.imported&&!design.illustrated){
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
    state=selectVariant(state,'apply',design.formStyle?design.form:refined&&!contourDirection?({1:2,2:1,3:1})[design.form]:design.form);
    state=selectVariant(state,'footer',refined&&!contourDirection?({1:3,2:5,3:2,5:1})[design.footer]:design.footer);
    const reviewLayout=refined?({cards:'ribbon',feature:'open',open:'cards'})[design.reviews]:design.reviews;
    const blockStyle=contourDirection==='wave'?'reference':contourDirection==='letter'?'letter':design.refinement??'quiet';
    const context={comparison:true,blockStyle,contourDirection,formStyle:design.formStyle??(design.refinement==='quiet'||contourDirection?'letter':undefined),wavyArrows:design.wavyArrows||contourDirection==='letter'};
    const originalMarkup=pencil?renderPencilPreview(state,design.baseMode??design.mode,context):renderSite(state,context);
    const markup=design.early?decorateEarlyDesign(originalMarkup,design):originalMarkup;
    pageContent=`<main class="site-preview comparison-design${pencil?' pencil-preview'+(design.early?'':' '+design.mode):''}${design.early?' early-design '+design.mode+(design.skin?' '+design.skin:''):''}" ${fixedThemeAttributes} data-palette="${pencil?'':state.palette}" data-review-layout="${reviewLayout}" data-block-style="${blockStyle}"${refined?` data-refinement="${blockStyle}"`:''}${contourDirection?` data-contour-direction="${contourDirection}"`:''}>${markup}</main>`;
  }
  if(design?.imported)pageContent=renderAdditionalDesign(design);
  if(design?.illustrated)pageContent=renderIllustratedDesign(design);
  for(const transfer of transfers){
    const original=extractDesignBlock(pageContent,transfer.block).markup;
    pageContent=pageContent.replace(original,`<section class="transplanted-block" id="${transfer.block}" data-block="${transfer.block}" data-transplanted-block><iframe data-reference-frame src="${transfer.file}?v=3307846e3a" title="${transfer.title}" loading="eager" height="${transfer.block==='hero'?620:500}"></iframe></section>`);
  }
  return `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${seoHead(pageFile,{title,description})}<meta name="theme-color" content="#faf6ec">
${design?.imported?additionalStyles(design):''}
<link rel="preload" href="fonts/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk7PFO_F.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="studio/fonts/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="fonts.css?v=3307846e3a"><link rel="stylesheet" href="studio/fonts.css?v=3307846e3a">
<link rel="stylesheet" href="journeys.css?v=3307846e3a"><link rel="stylesheet" href="studio/site.css?v=3307846e3a"><link rel="stylesheet" href="studio/ui.css?v=3307846e3a">
${editorial?'<link rel="stylesheet" href="studio/editorial.css?v=3307846e3a">':''}
${comparing||blockCompare||assembling?'<link rel="stylesheet" href="studio/pencil-preview.css?v=3307846e3a"><link rel="stylesheet" href="studio/comparison-design.css?v=3307846e3a"><link rel="stylesheet" href="studio/comparison-sections.css?v=3307846e3a">':''}
<link rel="stylesheet" href="studio/clear-sections.css?v=3307846e3a">
<link rel="stylesheet" href="studio/unified-designs.css?v=3307846e3a"><script defer src="studio/unified-designs.js?v=3307846e3a"></script>
<link rel="stylesheet" href="studio/design-chrome.css?v=3307846e3a">
${design?.mode==='fotoalbum'?'<link rel="stylesheet" href="studio/fotoalbum-polish.css?v=3307846e3a">':''}
${design?.illustrated?illustratedStyles():''}
${design?.early?earlyStyles():''}
${contourDirection?'<link rel="stylesheet" href="studio/contour-design.css?v=3307846e3a"><script defer src="studio/contour-motion.js?v=3307846e3a"></script>':''}
<link rel="icon" href="favicon.svg"><script type="module" src="studio/app.js?v=3307846e3a"></script>
<script defer src="studio/review-carousel.js?v=3307846e3a"></script>
${mode==='library'&&blockId==='hero'?'<script defer src="studio/hero-gallery.js?v=3307846e3a"></script>':''}
${comparing||blockCompare||assembling?'<script defer src="studio/comparison-palettes.js?v=3307846e3a"></script><script defer src="studio/comparison-request.js?v=3307846e3a"></script>':''}
${assembling||blockCompare?'<script defer src="studio/comparison-assembly.js?v=3307846e3a"></script>':''}
${assembling||blockCompare||transfers.length?'<script defer src="studio/reference-frames.js?v=3307846e3a"></script>':''}
</head><body data-fixed-theme="${comparisonBaseTheme}" class="design-tool ${mode==='preview'||(comparing&&!pencil)?'preview-only':''}" data-mode="${design?.mode??mode}" data-library-block="${blockId}"${pageFile==='index.html'?' data-live-request':''}>${mode==='preview'?designPanel:pencilSwitcher}${pageContent}${privacy}<noscript><p class="tool-noscript">${mode==='preview'||editorial||comparing?'Для подготовки заявки включите JavaScript или напишите Анастасии в Telegram.':'Для переключения дизайна и подготовки заявки включите JavaScript. Базовая страница доступна для просмотра.'}</p></noscript></body></html>`;
}

// Publish only the three requested source blocks, with links pointing into their new pages.
export const transferredBlockPages=blockTransfers.map(transfer=>{
  const source=[...additionalDesignSources,...referenceDesignSources].find(design=>design.mode===transfer.source);
  const destination=comparisonDesigns.find(design=>design.mode===transfer.destination);
  let html=source.reference?referenceBlockPage(source,transfer.block)
    :designBlockPage(source,transfer.block,studioPage(source.mode,'hero',source.file,source));
  html=html.replaceAll(source.file,preferredDesignFile(destination))
    .replace(/<link rel="canonical"[^>]+>/,utilityIndexingTags(transfer.file).match(/<link[^>]+>/)[0]);
  if(transfer.destination==='fotoalbum'&&transfer.block==='hero'){
    html=html.replace('хорошо&nbsp;ребёнку','хорошо ребёнку');
    html=html.replace('</head>','<link rel="stylesheet" href="studio/fotoalbum-polish.css?v=3307846e3a"></head>');
  }
  return {...transfer,html};
});

// Start with the user's saved block choices, then cover every retained full design.
// A source map documents shared blocks instead of adding a copy for each design.
// Register originals before inserted variations so existing block links keep their IDs.
const blockSourceDesigns=[...comparisonDesigns.filter(design=>!design.parentMode),...comparisonDesigns.filter(design=>design.parentMode)];
for(const [id,[,choices]] of Object.entries(comparisonBlockChoices)){
  const identities=new Map();
  comparisonChoiceDetails[id]={};
  comparisonChoiceAliases[id]??={};
  for(const [style,,variant] of choices){
    const markup=renderBlock(id,variant,{state:defaults,comparison:true,blockStyle:style,wavyArrows:style==='reference'});
    const identity=blockIdentity(id,markup,style);
    identities.set(identity,style);
    comparisonChoiceDetails[id][style]={identity,sources:[]};
  }
  for(const design of blockSourceDesigns){
    const file=preferredDesignFile(design);
    const html=studioPage(design.mode,'hero',file);
    const {markup}=extractDesignBlock(html,id);
    const transfer=transferredBlockPages.find(item=>item.destination===design.mode&&item.block===id);
    const actualMarkup=transfer?extractDesignBlock(transfer.html,id).markup:markup;
    const shared=design.imported&&!design.reference&&!['hero','service'].includes(id);
    const selectedService=design.imported&&!design.reference&&id==='service'&&markup.includes('s-service-personal');
    const family=transfer&&id==='process'?'imported-shared':design.illustrated||design.early?'illustrated':design.reference?'reference':design.contour?'contour':shared||selectedService?'imported-shared':design.imported?design.mode:'native';
    const style=transfer&&transfer.source==='chalk-route'?'route':design.reference?design.mode:family==='imported-shared'?({reviews:'letter',apply:'letter',process:design.chalk==='route'?'route':'reference'}[id]??'quiet'):design.refinement??'quiet';
    const identity=blockIdentity(id,actualMarkup,style,family);
    let key=identities.get(identity);
    if(!key){
      key=design.mode;
      identities.set(identity,key);
      choices.push([key,design.illustrated?`Мелок · ${illustratedBlockLabel(design,id)}`:/^Вариант \d+$/.test(design.name)?`Дизайн ${design.number}`:design.name,null]);
      comparisonChoiceDetails[id][key]={identity,sources:[]};
    }
    const details=comparisonChoiceDetails[id][key];
    if(!details.file){
      const preview=transfer?.file??(design.reference?referenceBlockFile(design,id):designBlockFile(design,id));
      details.file=preview;
      if(!design.reference&&!transfer)isolatedDesignBlocks.push({file:preview,html:designBlockPage(design,id,html),design:design.mode,block:id});
    }
    details.sources.push({mode:design.mode,name:design.name,number:design.number,file});
    if(key!==design.mode)comparisonChoiceAliases[id][design.mode]=key;
    (designBlockCoverage[design.mode]??={})[id]=key;
  }
}
