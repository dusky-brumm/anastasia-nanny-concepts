import {reviewTextureDefs} from './review-texture.mjs';
import {seoHead} from '../reference/studio/seo.js';

export const blockLabels={header:'Хедер',hero:'Главный блок',service:'Об услуге',about:'Знакомство с Анастасией',process:'Как проходит подбор',pricing:'Стоимость и гарантия',reviews:'Отзывы и история семьи',apply:'Заявка',footer:'Футер'};

export function sitePage(selection,blocks=[]){
  if(blocks.length!==selection.blocks.length)throw new Error('The complete selected page must be rendered before publication');
  return `<!doctype html><html lang="ru" data-font-pair="5" data-body-font="manrope"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${seoHead('index.html')}
<link rel="icon" href="favicon.svg"><link rel="stylesheet" href="site-base.css?v=__VERSION__">
<link rel="preload" as="image" href="media/portrait-480.webp" imagesrcset="media/portrait-480.webp 480w, media/portrait-720.webp 720w" imagesizes="(max-width:650px) calc(100vw - 100px), (max-width:850px) 330px, 390px">
<link rel="stylesheet" href="site-typography.css?v=__VERSION__">
<script>(()=>{const root=document.documentElement;root.dataset.imageReveal='on';root.dataset.drawingMotion=matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).get('motion')==='off'||new URLSearchParams(location.search).get('capture')==='1'?'off':'on';if(!document.fonts)return;root.dataset.fontsReady='pending';const reveal=()=>{root.dataset.fontsReady='ready';};const fallback=setTimeout(reveal,1200);document.addEventListener('load',event=>{if(event.target.id!=='site-design')return;Promise.allSettled([document.fonts.load('400 16px Manrope','Няня Nanny'),document.fonts.load('500 16px Manrope','Няня Nanny'),document.fonts.load('600 16px Manrope','Няня Nanny'),document.fonts.load('400 32px Lora','Няня Nanny'),document.fonts.load('400 32px Caveat','Анастасия Доронина')]).then(()=>document.fonts.ready).then(()=>{clearTimeout(fallback);reveal();});},true);})();</script>
<link id="site-design" rel="stylesheet" href="site-sections.css?v=__VERSION__">
<link rel="stylesheet" href="single-page.css?v=__VERSION__">
<link rel="stylesheet" href="review-texture.css?v=__VERSION__">
<script defer src="site-runtime.js?v=__VERSION__"></script>
</head><body>
${reviewTextureDefs}
<main aria-label="Индивидуальный подбор няни">${blocks.join('\n')}</main>
<dialog id="studio-privacy" aria-labelledby="privacy-heading"><button type="button" data-close aria-label="Закрыть окно">×</button><h2 id="privacy-heading">О данных формы</h2><p>При нажатии «Оставить заявку» откроется Telegram с заполненным сообщением. Отправку подтверждаете вы. Поля не сохраняются на сайте.</p></dialog>
<noscript><p class="no-script">Для отправки заявки включите JavaScript или <a href="https://t.me/inyfid">напишите Анастасии в Telegram</a>.</p></noscript>
</body></html>`;
}
