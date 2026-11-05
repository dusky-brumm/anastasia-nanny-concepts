import {referenceTemplates} from './reference-templates.js';
import {aboutSlides} from './render.js?v=e6fe33e05c';
import {approvedThemeStyle} from './model.js?v=e6fe33e05c';
import {sharedDesignHeader,withoutRepeatedHeroLabel} from './design-chrome.js?v=e6fe33e05c';
import {utilityIndexingTags} from './seo.js?v=e6fe33e05c';

export const referenceDesigns=[
  ['02-elliot','Бумажные карточки · Elliot'],
  ['05-yoga','Плавный контур · Yoga'],
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
    .replace('</head>',`<link rel="stylesheet" href="studio/pencil-preview.css?v=e6fe33e05c">
<link rel="stylesheet" href="studio/comparison-design.css?v=e6fe33e05c">
<link rel="stylesheet" href="studio/unified-designs.css?v=e6fe33e05c">
<link rel="stylesheet" href="studio/design-chrome.css?v=e6fe33e05c">
<link rel="stylesheet" href="studio/reference-integration.css?v=e6fe33e05c">
<script defer src="studio/comparison-request.js?v=e6fe33e05c"></script>
<script defer src="studio/variants/eight-references/gallery-ui.js?v=e6fe33e05c"></script>
<script defer src="studio/reference-interactions.js?v=e6fe33e05c"></script>
<script defer src="studio/comparison-palettes.js?v=e6fe33e05c"></script>
<script defer src="studio/unified-designs.js?v=e6fe33e05c"></script></head>`)
    .replace(/<body class="([^"]+)">/,`<body class="$1 reference-design" data-fixed-theme="almost-white" style="${approvedThemeStyle}">${navigation}<div data-comparison-site>`)
    .replace('</body>','</div></body>');
  return html;
}

export const referenceBlockFile=(design,id)=>`compare-ref-${design.id}-${id}.html`;

// Extract the complete section, including nested sections, from the adapted page.
// Each preview gets its own document so the original global styles stay isolated.
export function referenceBlockPage(design,id){
  if (!['hero','service','about','process','pricing','reviews','apply','footer'].includes(id)) {
    throw new Error(`Unknown reference block: ${id}`);
  }
  const html=referencePage(design,'');
  const start=html.indexOf(`<${id==='footer'?'footer':'section'} id="${id}"`);
  if(start<0)throw new Error(`Missing ${id} in ${design.id}`);
  const tag=id==='footer'?'footer':'section';
  const tokens=new RegExp(`<\\/?${tag}\\b[^>]*>`,'g');
  tokens.lastIndex=start;
  let depth=0,end=-1;
  for(let match;(match=tokens.exec(html));){
    depth+=match[0].startsWith('</')?-1:1;
    if(depth===0){end=tokens.lastIndex;break;}
  }
  if(end<0)throw new Error(`Unclosed ${id} in ${design.id}`);
  let block=html.slice(start,end);
  const ids=new Set([...block.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  block=block.replace(/href="#([^"]+)"/g,(attribute,target)=>ids.has(target)?attribute:
    `href="${design.file}?v=e6fe33e05c#${target}" target="_top" data-reference-target="${target}"`);
  const dialog=html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0]??'';
  return html
    .replace(/<body([^>]*)>[\s\S]*<\/body>/,`<body$1><div class="sheet" data-reference-block-root><main>${block}</main></div>${dialog}</body>`)
    .replace('reference-design"','reference-design reference-block-page"')
    .replace(/<link rel="canonical"[^>]+>/,utilityIndexingTags(referenceBlockFile(design,id)).match(/<link[^>]+>/)[0])
    .replace(/<script defer src="studio\/(?:unified-designs|comparison-palettes)\.js[^\"]*"><\/script>/g,'');
}
