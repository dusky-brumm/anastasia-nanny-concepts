import {seoHead} from '../reference/studio/seo.js';

export const blockLabels={header:'Хедер',hero:'Главный блок',service:'Об услуге',about:'Знакомство с Анастасией',process:'Как проходит подбор',pricing:'Стоимость и гарантия',reviews:'Отзывы и история семьи',apply:'Заявка',footer:'Футер'};

export function sitePage(selection){
  return `<!doctype html><html lang="ru" data-font-pair="5" data-body-font="manrope"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${seoHead('index.html')}
<link rel="icon" href="favicon.svg"><link rel="stylesheet" href="site-base.css?v=__VERSION__">
<link rel="stylesheet" href="fonts.css?v=__VERSION__"><link rel="stylesheet" href="studio/fonts.css?v=__VERSION__"><link rel="stylesheet" href="site-typography.css?v=__VERSION__">
<script defer src="studio/reference-frames.js?v=__VERSION__"></script><script type="module" src="site-base.js?v=__VERSION__"></script>
</head><body>
<main aria-label="Индивидуальный подбор няни">${selection.blocks.map(({id,file})=>`
<div id="${id}" data-selected-block="${id}"><iframe data-reference-frame title="${blockLabels[id]}" src="${file}?v=__VERSION__" loading="eager" height="${id==='header'?96:id==='footer'?220:650}"></iframe></div>`).join('')}
</main>
<dialog id="studio-privacy" aria-labelledby="privacy-heading"><button type="button" data-close aria-label="Закрыть окно">×</button><h2 id="privacy-heading">О данных формы</h2><p>Заявка составляется в вашем браузере. Имя, контакт и текст не сохраняются и автоматически не передаются. Вы самостоятельно отправляете подготовленное сообщение Анастасии в Telegram.</p></dialog>
<noscript><p class="no-script">Для подготовки заявки включите JavaScript или <a href="https://t.me/inyfid">напишите Анастасии в Telegram</a>.</p></noscript>
</body></html>`;
}
