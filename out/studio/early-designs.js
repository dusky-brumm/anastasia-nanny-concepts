import {illustratedAssets} from './illustrated-assets.js';
import {extractDesignBlock} from './design-blocks.js?v=a0d5839180';
import {renderChalkJourneyArrows} from '../journeys.js?v=a0d5839180';

export const earlyDesigns=[
  {mode:'early-classic',file:'comparison-early-classic.html',name:'Классика и мелок',baseMode:'comparison-current',reviews:'cards',form:3,formStyle:'pencil',footer:3,refinement:'quiet',tone:'classic'},
  {mode:'early-personal',file:'comparison-early-personal.html',name:'Личное знакомство',baseMode:'pencil',reviews:'open',form:2,footer:2,refinement:'letter',tone:'personal'},
].map(design=>({...design,early:true,single:true}));

function chalk(id,className='',line=false){
  const asset=illustratedAssets.find(item=>item.id===id);
  if(!asset)throw new Error(`Unknown chalk illustration: ${id}`);
  return `<svg class="early-chalk ${className}" data-early-art${line?' data-chalk-line':''} viewBox="${asset.box}" preserveAspectRatio="${line?'none':'xMidYMid meet'}" aria-hidden="true" focusable="false"><image href="studio/media/chalk-kit/${id}.webp" width="${asset.width}" height="${asset.height}"/></svg>`;
}

function photoCorners(markup){
  return markup.replace(/(<figure\b[^>]*class="[^"]*s-frame[^"]*"[^>]*>)([\s\S]*?)(<\/figure>)/g,(_,open,content,close)=>`${open}${content}${chalk('10-about-photo-corners','early-photo-corners',true)}${close}`);
}

function classicService(){
  const details=[
    ['06-service-family-request','Ваш ритм и задачи','Обсудим возраст и характер ребёнка, график, привычки и правила дома. Из этого складывается портрет вашей няни.'],
    ['05-service-profile','Подходящие вам люди','Я беру на себя поиск, интервью и проверку рекомендаций. Вы получаете анкеты с моими комментариями и знакомитесь с кандидатками.'],
    ['17-step-support','Поддержка на каждом этапе','Помогу подготовиться к встрече и пробным дням. Останусь на связи после выхода няни — с гарантией замены на шесть месяцев.'],
  ];
  return `<div class="classic-service">
    <div class="classic-service-heading"><div><p class="classic-service-kicker">Подробнее об услуге</p><h2>Подбор няни под задачи вашей семьи</h2></div><p>Чтобы рядом с ребёнком был человек, которому вы доверяете, а в вашем дне стало больше спокойствия.</p></div>
    <div class="classic-service-details">${details.map(([asset,heading,copy])=>`<article>${chalk(asset,'classic-service-picture')}<h3>${heading}</h3><p>${copy}</p></article>`).join('')}</div>
    <div class="classic-service-note"><p>Вы выбираете своего человека. Я помогаю пройти весь путь до этого выбора.</p><a class="s-text-link" href="https://telegra.ph/Nyanya-Ispravnikova-Svetlana-10-11" target="_blank" rel="noopener noreferrer">Посмотреть пример анкеты ↗</a></div>
  </div>`;
}

function decorateBlock(id,markup,design){
  const personal=design.tone==='personal';
  markup=markup.replace(/^(<(?:section|header|footer)\b[^>]*class=")/,'$1early-block early-block--'+design.tone+' ');
  markup=markup.replace(/^<(?:section|header|footer)\b[^>]*>/,tag=>tag.includes('data-block=')?tag:tag.replace(/>$/,` data-block="${id}">`));
  if(id==='header'){
    return markup.replace(/<\/(?:header)>$/,`${chalk(personal?'26-section-divider':'04-text-underline','early-header-line',true)}</header>`);
  }
  if(id==='hero'){
    markup=markup.replace(/(<em class="s-chalk-text">спокойно)<svg[\s\S]*?<\/svg>/,`$1${chalk('04-text-underline','early-underline',true)}`);
    if(personal){
      return markup.replace('</figure>',`${chalk('27-support-sprig','early-hero-leaf')}</figure>`);
    }
    markup=markup.replace(/(<div class="s-actions">[\s\S]*?<\/div>)/,`$1<div class="early-care-note">${chalk('02-hero-care')}<p>Под ваши задачи,<br>привычки и ритм семьи</p></div>`);
    return markup;
  }
  if(id==='service'){
    if(!personal)return markup.slice(0,markup.indexOf('>')+1)+classicService()+'</section>';
    markup=markup.replace('<div class="s-service-result">',`<div class="s-service-result">${chalk('05-service-profile','early-profile')}`);
    if(personal)markup=markup.replace('<div class="s-service-examples">',`<div class="s-service-examples">${chalk('07-service-interview','early-interview')}`);
    return markup;
  }
  if(id==='about'){
    markup=photoCorners(markup);
    if(personal)markup=markup.replace(/(<p class="s-signature">[\s\S]*?<\/p>)/,`<div class="early-signoff">${chalk('09-about-personal-work')}$1</div>`);
    return markup;
  }
  if(id==='process'){
    if(personal)return markup.replace('</h2></div>',`</h2>${chalk('17-step-support','early-process-emblem')}</div>`);
    const steps=['13-step-application','14-step-nanny-profile','15-step-search-interview','16-step-first-meeting','17-step-support'];
    let index=0;
    markup=markup.replace(/<div class="s-study-copy">/g,()=>`<div class="s-study-copy">${chalk(steps[index++],'early-step-picture')}`);
    if(design.processArrows){
      markup=markup.replace(/<h2>[\s\S]*?<\/h2>/,'<h2>Как проходит подбор</h2>')
        .replace('class="s-route-study"','class="s-route-study classic-arrow-route"')
        .replace(/<svg class="s-study-line"[\s\S]*?<\/svg>/,renderChalkJourneyArrows());
      let connector=0;
      markup=markup.replace(/<\/li>/g,()=>`${connector<4?renderChalkJourneyArrows(connector++):''}</li>`);
    }
    return markup;
  }
  if(id==='pricing'){
    let index=0;
    const terms=['18-pricing-terms','13-step-application','19-guarantee-calendar'];
    return markup.replace(/<div><dt>/g,()=>{
      const asset=terms[index++];
      return personal&&index<3?'<div><dt>':`<div class="early-price-term">${chalk(asset,'early-term-picture')}<dt>`;
    });
  }
  if(id==='reviews'){
    markup=markup.replaceAll('<span class="s-quote-mark" aria-hidden="true">“</span>',chalk('21-reviews-quote','early-quote'));
    if(!personal)markup=markup.replace(/(<button[^>]+data-quote-step="-?1"[^>]*>)[←→](<\/button>)/g,'$1<span class="classic-quote-arrow" aria-hidden="true"></span>$2');
    return markup;
  }
  if(id==='apply')return markup.replace('<div class="comparison-form-contact">',`${chalk(personal?'24-apply-ready-message':'23-apply-writing','early-apply-picture')}<div class="comparison-form-contact">`);
  if(id==='footer')return markup.replace(/<svg class="s-footer-drawing"[\s\S]*?<\/svg>/,chalk(personal?'01-header-welcome':'25-footer-contact','early-footer-picture',true));
  return markup;
}

export function decorateEarlyDesign(markup,design){
  for(const id of ['header','hero','service','about','process','pricing','reviews','apply','footer']){
    const block=extractDesignBlock(markup,id).markup;
    markup=markup.replace(block,decorateBlock(id,block,design));
  }
  return markup;
}

export function earlyStyles(){
  return '<link rel="stylesheet" href="studio/variants/early-chalk/early.css?v=a0d5839180"><script defer src="studio/early-motion.js?v=a0d5839180"></script>';
}
