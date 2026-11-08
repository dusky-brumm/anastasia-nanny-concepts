import {seoHead} from '../reference/studio/seo.js';

export const blockLabels={header:'Хедер',hero:'Главный блок',service:'Об услуге',about:'Знакомство с Анастасией',process:'Как проходит подбор',pricing:'Стоимость и гарантия',reviews:'Отзывы и история семьи',apply:'Заявка',footer:'Футер'};

export function sitePage(selection){
  return `<!doctype html><html lang="ru" data-font-pair="5" data-body-font="manrope"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${seoHead('index.html')}
<link rel="icon" href="favicon.svg"><link rel="stylesheet" href="site-base.css?v=__VERSION__">
<link rel="preload" href="fonts/manrope-400.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="studio/fonts/0QIvMX1D_JOuMw77I-NP.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="media/portrait-480.webp" imagesrcset="media/portrait-480.webp 480w, media/portrait-720.webp 720w" imagesizes="(max-width:650px) calc(100vw - 100px), (max-width:850px) 330px, 390px">
<link rel="stylesheet" href="fonts.css?v=__VERSION__"><link rel="stylesheet" href="site-typography.css?v=__VERSION__">
<script type="module" src="site-base.js?v=__VERSION__"></script>
</head><body>
<main aria-label="Индивидуальный подбор няни">${selection.blocks.map(({id,file})=>`
<div id="${id}" data-selected-block="${id}"><iframe data-reference-frame title="${blockLabels[id]}" src="${file}?v=__VERSION__" loading="${id==='header'||id==='hero'?'eager':'lazy'}" height="${id==='header'?96:id==='footer'?220:650}"></iframe></div>`).join('')}
</main>
<dialog id="studio-privacy" aria-labelledby="privacy-heading"><button type="button" data-close aria-label="Закрыть окно">×</button><h2 id="privacy-heading">О данных формы</h2><p>При нажатии «Оставить заявку» откроется Telegram с заполненным сообщением. Отправку подтверждаете вы. Поля не сохраняются на сайте.</p></dialog>
<noscript><p class="no-script">Для отправки заявки включите JavaScript или <a href="https://t.me/inyfid">напишите Анастасии в Telegram</a>.</p></noscript>
</body></html>`;
}
