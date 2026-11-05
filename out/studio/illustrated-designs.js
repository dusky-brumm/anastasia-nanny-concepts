import {illustratedTemplates,illustratedLabels} from './illustrated-templates.js';
import {illustratedAssets} from './illustrated-assets.js';
import {renderBlock} from './render.js?v=18f7f507b8';
import {defaults,approvedTheme,approvedThemeStyle} from './model.js?v=18f7f507b8';

export const illustratedDesigns=[
  {mode:'chalk-light',name:'Мелок · Светлая дуга'},
  {mode:'chalk-letter',name:'Мелок · Личное письмо'},
  {mode:'chalk-story',name:'Мелок · Фотоистория'},
].map((design,index)=>({...design,index,file:`comparison-${design.mode}.html`,single:true,illustrated:true}));

const tailLabels={reviews:['Меловые цитаты','Альбом отзывов','Заметки семей'],apply:['Письмо о вашей семье','Открытка с заявкой','Запрос и линия'],footer:['Самолёт на линии','Арка и контакты','Короткий росчерк']};
export const illustratedBlockLabel=(design,id)=>(illustratedLabels[id]??tailLabels[id])[design.index];

function art(id,className=''){
  const asset=illustratedAssets.find(item=>item.id===id);
  return `<svg class="chalk-motif ${className}" viewBox="${asset.box}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><image href="studio/media/chalk-kit/${id}.webp" width="${asset.width}" height="${asset.height}"/></svg>`;
}

function tailBlock(id,design){
  const index=design.index;
  let html=renderBlock(id,id==='apply'?(index===1?1:2):1,{state:defaults,comparison:true,blockStyle:'letter',formStyle:'letter',previewId:`${design.mode}-${id}`});
  html=html.replace('class="s-block ',`class="s-block chalk-tail-block chalk-tail--${index+1} `);
  if(id==='reviews'){
    const picture=art(index===1?'22-reviews-family-album':'21-reviews-quote','chalk-reviews-picture');
    html=html.replace('<div class="s-review-heading">',`<div class="chalk-reviews-intro">${picture}<p>Слова семей, которым я помогла</p></div><div class="s-review-heading">`);
    html=html.replaceAll('<span class="s-quote-mark" aria-hidden="true">“</span>',art('21-reviews-quote','chalk-quote'));
  }
  if(id==='apply'){
    html=html.replace('<div class="comparison-form-contact">',`${art(index===1?'24-apply-ready-message':index===2?'27-support-sprig':'23-apply-writing','chalk-apply-picture')}<div class="comparison-form-contact">`);
    if(index===2)html=html.replace('<form class=',`${art('26-section-divider','chalk-form-line')}<form class=`);
  }
  if(id==='footer'){
    html=html.replace(/<svg class="s-footer-drawing"[\s\S]*?<\/svg>/,art(index===1?'01-header-welcome':'25-footer-contact','chalk-footer-picture'));
  }
  return `<div class="site-preview comparison-design selected-section chalk-tail" data-font="lora" data-block-style="letter" data-review-layout="${index===1?'ribbon':'open'}">${html}</div>`;
}

export function renderIllustratedDesign(design){
  const portrait='<svg class="cafe-crop" viewBox="0 420 720 860" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><image href="studio/media/cafe.webp" width="720" height="1280"/></svg>';
  const blocks=['hero','service','about','process','pricing'].map(id=>illustratedTemplates[id][design.index]).join('')
    .replace(/<div class="(portrait-picture|album-main)"><\/div>/g,`<div class="$1">${portrait}</div>`);
  return `<div class="illustrated-site imported-design illustrated-${design.mode}" data-font="lora" data-chalk-variant="${design.index+1}" data-comparison-theme="${approvedTheme.id}" style="${approvedThemeStyle}">${illustratedTemplates.header[design.index]}<main>${blocks}${tailBlock('reviews',design)}${tailBlock('apply',design)}</main>${tailBlock('footer',design)}</div>`;
}

export function illustratedStyles(){
  return `${['header','hero','service','about','process','pricing','site'].map(name=>`<link rel="stylesheet" href="studio/variants/illustrated/${name}.css?v=18f7f507b8">`).join('')}<script defer src="studio/illustrated-motion.js?v=18f7f507b8"></script>`;
}
