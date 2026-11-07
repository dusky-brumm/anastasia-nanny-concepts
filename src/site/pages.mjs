import {seoHead,utilityIndexingTags} from '../reference/studio/seo.js';
import {fontPairs,fontCatalog,quickFontPairs,defaultFontPair} from './font-pairs.js';
import {aboutVariants} from './about-model.js';

export const blockLabels={header:'Хедер',hero:'Главный блок',service:'Об услуге',about:'Знакомство с Анастасией',process:'Как проходит подбор',pricing:'Стоимость и гарантия',reviews:'Отзывы и история семьи',apply:'Заявка',footer:'Футер'};
export const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export function sitePage(selection){
  const fontOptions=selected=>[false,true].map(system=>`<optgroup label="${system?'Системные из прежних макетов':'Основные шрифты прежних вариантов'}">${fontCatalog.filter(font=>Boolean(font.system)===system).map(font=>`<option value="${font.id}"${font.id===selected?' selected':''}>${escapeHtml(font.family)}</option>`).join('')}</optgroup>`).join('');
  return `<!doctype html><html lang="ru" data-font-pair="${defaultFontPair.id}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${seoHead('index.html')}
<link rel="icon" href="favicon.svg"><link rel="stylesheet" href="site-base.css?v=__VERSION__">
<link rel="stylesheet" href="fonts.css?v=__VERSION__"><link rel="stylesheet" href="studio/fonts.css?v=__VERSION__"><link rel="stylesheet" href="site-typography.css?v=__VERSION__">
<script defer src="studio/reference-frames.js?v=__VERSION__"></script><script type="module" src="site-base.js?v=__VERSION__"></script>
</head><body>
<aside class="font-switcher" aria-label="Выбор сочетания шрифтов"><div class="font-switcher-inner"><div class="font-switcher-top"><span class="font-switcher-label">Шрифты</span><nav aria-label="Готовые сочетания шрифтов">${quickFontPairs.map(pair=>`<button type="button" data-font-choice="${pair.id}" aria-label="${pair.id}: ${pair.heading} + ${pair.body}" aria-pressed="${pair.id===defaultFontPair.id}" title="${pair.heading} + ${pair.body}">${pair.id}</button>`).join('')}</nav><div class="font-tools"><button type="button" class="font-details-toggle" data-font-details-toggle aria-expanded="false" aria-controls="font-details">Настроить <span aria-hidden="true">⌄</span></button><a class="font-artwork-link" href="artwork">Рисунки ↗</a></div></div><div class="font-role-controls" id="font-details" hidden><div class="font-role-field"><label for="font-heading">Заголовки</label><select id="font-heading" data-heading-choice>${fontOptions(defaultFontPair.headingId)}</select></div><div class="font-role-field"><label for="font-body">Основной текст</label><select id="font-body" data-body-choice>${fontOptions(defaultFontPair.bodyId)}</select></div><p class="font-pair-caption" data-font-status role="status" aria-live="polite"><strong>${defaultFontPair.heading} + ${defaultFontPair.body}</strong><span>Все прежние шрифты · ${fontPairs.length} сочетаний</span></p><button type="button" class="motion-toggle" data-motion-toggle aria-pressed="true">Анимация включена</button></div></div></aside>
<main aria-label="Индивидуальный подбор няни">${selection.blocks.map(({id,file})=>`
<div id="${id}" data-selected-block="${id}">${id==='about'?`<div class="about-pin"><nav class="about-variant-switcher" aria-label="Варианты блока знакомства"><span>Знакомство · варианты</span>${aboutVariants.map(variant=>`<button type="button" data-about-choice="${variant.id}" aria-pressed="${variant.id==='1'}" aria-label="${variant.id}: ${variant.name}" title="${variant.description}">${variant.id}</button>`).join('')}<span data-about-design-name>${aboutVariants[0].name}</span></nav>`:''}<iframe data-reference-frame title="${blockLabels[id]}" src="${file}?v=__VERSION__" loading="eager" height="${id==='header'?96:id==='footer'?220:650}"></iframe>${id==='about'?'</div>':''}</div>`).join('')}
</main>
<dialog id="studio-privacy" aria-labelledby="privacy-heading"><button type="button" data-close aria-label="Закрыть окно">×</button><h2 id="privacy-heading">О данных формы</h2><p>Заявка составляется в вашем браузере. Имя, контакт и текст не сохраняются и автоматически не передаются. Вы самостоятельно отправляете подготовленное сообщение Анастасии в Telegram.</p></dialog>
<noscript><p class="no-script">Для подготовки заявки включите JavaScript или <a href="https://t.me/inyfid">напишите Анастасии в Telegram</a>.</p></noscript>
</body></html>`;
}

const knownTitles={
  '02-hero':'Главный блок','03-service':'Об услуге','04-about':'Знакомство с Анастасией','05-process':'Этапы подбора','06-guarantee':'Стоимость и гарантия','07-reviews':'Отзывы','08-apply':'Заявка','09-footer':'Контакты',
  'paper-chalk':'Бумага с меловой фактурой','soft-chalk':'Сухая меловая фактура','wash-chalk':'Меловая заливка',
};
export function artworkPage(catalog){
  const groups=[...new Set(catalog.map(item=>item.group))];
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Библиотека рисунков — Анастасия</title>${utilityIndexingTags('artwork.html')}
<link rel="icon" href="favicon.svg"><link rel="stylesheet" href="artwork.css?v=__VERSION__"><script defer src="artwork.js?v=__VERSION__"></script>
</head><body><header class="library-heading"><a class="back" href="./">← К сайту</a><p class="eyebrow">Сохранённые материалы</p><h1>Библиотека рисунков</h1><p class="intro">Иллюстрации, меловые линии, рамки и стрелки из всех вариантов. Скачивайте по одному или заберите всю коллекцию.</p><a class="download-all" href="artwork-library.zip" download>Скачать всё · ${catalog.length} элементов ↓</a></header>
<main><div class="library-tools"><label class="search-label">Найти рисунок<input type="search" id="artwork-search" placeholder="Анкета, семья, линия…"></label><fieldset><legend>Фон для просмотра</legend><div class="swatches"><button type="button" data-background="milk" aria-pressed="true">Почти белый</button><button type="button" data-background="blue" aria-pressed="false">Голубой</button><button type="button" data-background="sage" aria-pressed="false">Шалфейный</button></div></fieldset><p id="artwork-count" role="status">${catalog.length} элементов</p></div>
${groups.map(group=>`<section class="art-group" data-art-group><h2>${group}</h2><div class="art-grid">${catalog.filter(item=>item.group===group).map(item=>{
    const stem=item.file.split('/').at(-1).replace(/\.[^.]+$/,'');
    const title=knownTitles[stem]??item.title;
    const file=escapeHtml(item.file);
    const preview=item.box?`<svg viewBox="${item.box}" role="img" aria-label="${escapeHtml(title)}"><image href="${file}" width="${item.width}" height="${item.height}"/></svg>`:`<img src="${file}" alt="${escapeHtml(title)}" loading="lazy">`;
    return `<article class="art-card" data-artwork data-search="${escapeHtml([title,item.block??'',group,stem].join(' ').toLocaleLowerCase('ru'))}"><a class="art-preview" href="${file}" target="_blank" rel="noopener" aria-label="Открыть: ${escapeHtml(title)}">${preview}</a><div class="art-meta"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(item.block??(item.file.endsWith('.svg')?'Вектор · SVG':item.file.split('.').at(-1).toUpperCase()))}</p><a href="${file}" download>Скачать ↓</a></div></article>`;
  }).join('')}</div></section>`).join('')}
<p class="empty" hidden>По этому запросу ничего не найдено.</p></main><footer><a href="./">Вернуться к сайту</a><a href="artwork-catalog.json" download>Список файлов и контрольные суммы</a></footer></body></html>`;
}

export const assemblyRedirect=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Настя — выбранная сборка</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="https://dusky-brumm.github.io/anastasia-nanny-concepts/"><meta http-equiv="refresh" content="0;url=./"><script>location.replace('./'+location.hash);</script></head><body><a href="./">Открыть выбранную сборку</a></body></html>`;
