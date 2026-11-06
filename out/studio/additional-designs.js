import {additionalTemplates} from './additional-templates.js';
import {renderBlock} from './render.js?v=c6535752ac';
import {defaults,approvedTheme,approvedThemeStyle} from './model.js?v=c6535752ac';
import {sharedDesignHeader,withoutRepeatedHeroLabel} from './design-chrome.js?v=c6535752ac';

export const additionalDesigns=[
  {mode:'fotoalbum',file:'comparison-fotoalbum.html',name:'Семейный фотоальбом',css:'album.css'},
  {mode:'editorial-new',file:'comparison-editorial.html',name:'Тихая редакция',css:'editorial.css'},
  {mode:'chalk-album',file:'comparison-chalk-album.html',name:'Семейный альбом',chalk:'album'},
  {mode:'chalk-route',file:'comparison-chalk-route.html',name:'Маршрут семьи',chalk:'route'},
].map(design=>({...design,single:true,imported:true}));

export function additionalStyles(design){
  const directory=design.chalk?'chalk':design.mode;
  return `${!design.chalk&&design.mode!=='fotoalbum'?`<link rel="stylesheet" href="studio/variants/${directory}/fonts.css?v=c6535752ac">`:''}<link rel="stylesheet" href="studio/variants/${directory}/${design.css??'chalk.css'}?v=c6535752ac">`;
}

export function selectedBlock(id,style='quiet',variant=1,drawings=false){
  return `<div class="site-preview comparison-design selected-section" data-block-style="${style}" data-refinement="${style}" data-review-layout="open">${renderBlock(id,variant,{state:defaults,comparison:true,blockStyle:style,formStyle:'letter',wavyArrows:style==='reference',previewId:`selected-${id}`,contourDirection:drawings?'wave':undefined})}</div>`;
}

export function renderAdditionalDesign(design){
  const composition=additionalTemplates[design.mode];
  const service=composition.service??selectedBlock('service','quiet',1,true);
  const pricing=selectedBlock('pricing','quiet',1,true);
  const about=selectedBlock('about');
  const process=selectedBlock('process',design.chalk==='route'?'route':design.chalk==='arc'?'air':'reference',design.chalk==='route'||design.chalk==='arc'?7:1);
  const reviews=selectedBlock('reviews','letter');
  const apply=selectedBlock('apply','letter',2);
  const footer=selectedBlock('footer','quiet',3,Boolean(design.chalk));
  const hero=withoutRepeatedHeroLabel(composition.hero).replaceAll('вам и хорошо ребёнку','вам и&nbsp;хорошо ребёнку');
  const content=`${sharedDesignHeader()}<main>${hero}${service}${about}${process}${pricing}${reviews}${apply}</main>${footer}`;
  return `<div class="imported-design imported-${design.mode}" data-font="lora" data-comparison-theme="${approvedTheme.id}" style="${approvedThemeStyle}">${design.chalk?`<div id="chalk-site-directions"><article class="landing ${design.chalk}-page">${content}</article></div>`:design.mode==='journal'?`<div class="journal">${content}</div>`:content}</div>`;
}
