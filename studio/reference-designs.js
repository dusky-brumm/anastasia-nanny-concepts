import {referenceTemplates} from './reference-templates.js';
import {aboutSlides} from './render.js?v=7243f4a467';
import {approvedThemeStyle} from './model.js?v=7243f4a467';
import {sharedDesignHeader,withoutRepeatedHeroLabel} from './design-chrome.js?v=7243f4a467';
import {utilityIndexingTags} from './seo.js?v=7243f4a467';

export const referenceDesigns=[
  ['01-jenny','Альбом · Jenny'],['02-elliot','Бумажные карточки · Elliot'],
  ['03-josephine','Фотоколлаж · Josephine'],['04-leyla','Арка и волна · Leyla'],
  ['05-yoga','Плавный контур · Yoga'],['06-maren','Фотообложка · Maren'],
  ['07-marina','Личная поддержка · Марина'],['08-elena','Голубая рамка · Елена'],
].map(([id,name])=>({id,name,mode:`reference-${id}`,file:`comparison-ref-${id}.html`,reference:true,imported:true,single:true}));

const drawing=name=>`<span class="reference-drawing reference-drawing--${name}" aria-hidden="true"></span>`;
const storyMarkup=()=>`<div class="reference-stories" data-reference-stories aria-label="Знакомство с Анастасией">
  ${aboutSlides.map(([name,,copy],index)=>`<article data-reference-story="${index}"><h3>${name}</h3><p>${copy}</p></article>`).join('')}
  <div class="reference-story-controls" role="group" aria-label="Выбрать слайд" hidden>${aboutSlides.map(([name],index)=>`<button type="button" data-reference-story-button="${index}" aria-label="${name}">${index+1}</button>`).join('')}</div>
</div>`;

export function referencePage(design,navigation){
  const asset='studio/variants/eight-references/';
  let html=referenceTemplates[design.id]
    .replace(/\b(href|src)="(?!https?:|#|data:)([^"]+)"/g,(_,attr,url)=>`${attr}="${asset}${url}"`)
    .replace(/<header id="header"[\s\S]*?<\/header>/,sharedDesignHeader())
    .replace(/<div class="announcement">[\s\S]*?<\/div>/,'')
    .replace(/<div class="text-band"[\s\S]*?<\/div>/,'')
    .replace(/<div class="wrap contact-trip">[\s\S]*?<\/div>/,'')
    .replace(/<a class="text-link" href="[^\"]*index.html">Все варианты<\/a>/,'')
    .replace('Форму на сайте можно использовать, чтобы подготовить текст сообщения для отправки.','')
    .replace(/<svg class="footer-drawing"[\s\S]*?<\/svg>/,drawing('plane'));
  html=html.replace(/<meta name="robots"[^>]+>/,utilityIndexingTags(design.file));
  html=withoutRepeatedHeroLabel(html);
  for(const id of ['hero','service','about','process','pricing','reviews','apply','footer']){
    html=html.replace(new RegExp(`(<(?:section|footer) id="${id}")`),`$1 data-block="${id}"`);
  }
  html=html.replace('aria-labelledby="about-title"','aria-label="Знакомство с Анастасией"')
    .replace(/<div class="about-copy">[\s\S]*?<\/div>/,`<div class="about-copy">${storyMarkup()}</div>`)
    .replace('<div class="guarantee">',`<div class="guarantee">${drawing('calendar')}`)
    .replace('<div class="apply-copy">',`<div class="apply-copy">${drawing('family')}`)
    .replace(/<div class="interview">/,`<div class="interview">${drawing('profile')}`);
  // The original page's script depends on its own header; the shared header has its own handler.
  html=html.replace(/<script defer src="[^\"]*page.js"><\/script>/,'')
    .replace('</head>',`<link rel="stylesheet" href="studio/pencil-preview.css?v=7243f4a467">
<link rel="stylesheet" href="studio/comparison-design.css?v=7243f4a467">
<link rel="stylesheet" href="studio/unified-designs.css?v=7243f4a467">
<link rel="stylesheet" href="studio/design-chrome.css?v=7243f4a467">
<link rel="stylesheet" href="studio/reference-integration.css?v=7243f4a467">
<script defer src="studio/comparison-request.js?v=7243f4a467"></script>
<script defer src="studio/variants/eight-references/gallery-ui.js?v=7243f4a467"></script>
<script defer src="studio/reference-interactions.js?v=7243f4a467"></script>
<script defer src="studio/comparison-palettes.js?v=7243f4a467"></script>
<script defer src="studio/unified-designs.js?v=7243f4a467"></script></head>`)
    .replace(/<body class="([^"]+)">/,`<body class="$1 reference-design" data-fixed-theme="almost-white" style="${approvedThemeStyle}">${navigation}<div data-comparison-site>`)
    .replace('</body>','</div></body>');
  return html;
}
