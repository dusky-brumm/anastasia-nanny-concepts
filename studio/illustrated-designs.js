import {illustratedTemplates,illustratedLabels} from './illustrated-templates.js';
import {illustratedAssets} from './illustrated-assets.js';
import {renderBlock} from './render.js?v=c6535752ac';
import {defaults,approvedTheme,approvedThemeStyle} from './model.js?v=c6535752ac';

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

function routeDrawing(){
  // Keep the original chalk rings round while making the connecting wave shallower.
  const markers=[[20,58,'260 353 76 76'],[260,20,'632 212 76 76'],[500,72,'1048 392 76 76'],[740,34,'1436 276 76 76'],[980,55,'1836 345 76 76']];
  const rings=markers.map(([x,y,box])=>`<svg x="${x-11}" y="${y-11}" width="22" height="22" viewBox="${box}" preserveAspectRatio="xMidYMid meet"><image href="studio/media/chalk-kit/12-process-route.webp" width="2172" height="724"/></svg>`).join('');
  return `<svg class="process-art chalk-route-line" viewBox="0 0 1000 94" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <defs><filter id="chalk-route-grain" x="-5%" y="-30%" width="110%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="8"/>
      <feColorMatrix type="luminanceToAlpha"/>
      <feComponentTransfer><feFuncA type="linear" slope="2.2" intercept="-.2"/></feComponentTransfer>
      <feComposite in="SourceGraphic" operator="in"/>
    </filter></defs>
    <path d="M20 58C100 23 178 8 260 20S412 83 500 72S653 21 740 34S907 63 980 55" fill="none" stroke="#577484" stroke-width="3.4" stroke-linecap="round" filter="url(#chalk-route-grain)"/>
    ${rings}</svg>`;
}

function tailBlock(id,design){
  const index=design.index;
  let html=renderBlock(id,id==='apply'?(index===1?1:2):1,{state:defaults,comparison:true,blockStyle:'letter',formStyle:'letter',previewId:`${design.mode}-${id}`});
  html=html.replace('class="s-block ',`class="s-block chalk-tail-block chalk-tail--${index+1} `);
  if(id==='reviews'){
    const picture=index===1?art('22-reviews-family-album','chalk-reviews-picture'):'';
    html=html.replace('<h2>Отзывы</h2>',`<div class="chalk-review-title">${picture}<h2>Отзывы</h2></div>`);
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
  let blocks=['hero','service','about','process','pricing'].map(id=>illustratedTemplates[id][design.index]).join('')
    .replace(/<div class="(portrait-picture|album-main)"><\/div>/g,`<div class="$1">${portrait}</div>`)
    .replace(/<div class="flow-path">[\s\S]*?<\/div>/,`<div class="flow-path">${routeDrawing()}</div>`)
    .replace('Анастасия Доронина · индивидуальный подбор','Личный подбор для вашей семьи')
    .replace('Найду няню, с которой','Найду няню, с&nbsp;которой')
    .replace('вам и хорошо ребёнку</h1>','вам и&nbsp;хорошо ребёнку</h1>');
  if(design.index===1){
    blocks=blocks.replace(/<div class="letter-photo">[\s\S]*?<\/div>/,'<div class="letter-photo"><img src="studio/media/child.webp" width="960" height="960" loading="lazy" alt=""></div>')
      .replace('Портрет Анастасии со свободным меловым контуром','Анастасия с малышом, снимок из опыта работы с детьми');
  }
  let header=design.index===1?illustratedTemplates.header[1].replace('viewBox="279 129 1605 488"','viewBox="1440 115 460 520"').replace('preserveAspectRatio="none"','preserveAspectRatio="xMidYMid meet"'):illustratedTemplates.header[design.index];
  if(design.index===2)header=header.replace(/<svg class="chalk-mark header-line"[\s\S]*?<\/svg>/,art('26-section-divider','chalk-mark header-line').replace('preserveAspectRatio="xMidYMid meet"','preserveAspectRatio="none"'));
  return `<div class="illustrated-site imported-design illustrated-${design.mode}" data-font="lora" data-chalk-variant="${design.index+1}" data-comparison-theme="${approvedTheme.id}" style="${approvedThemeStyle}">${header}<main>${blocks}${tailBlock('reviews',design)}${tailBlock('apply',design)}</main>${tailBlock('footer',design)}</div>`;
}

export function illustratedStyles(){
  return `${['header','hero','service','about','process','pricing','site'].map(name=>`<link rel="stylesheet" href="studio/variants/illustrated/${name}.css?v=c6535752ac">`).join('')}<script defer src="studio/illustrated-motion.js?v=c6535752ac"></script>`;
}
