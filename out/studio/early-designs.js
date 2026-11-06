import {illustratedAssets} from './illustrated-assets.js';
import {extractDesignBlock} from './design-blocks.js?v=c6535752ac';

export const earlyDesigns=[
  {mode:'early-classic',file:'comparison-early-classic.html',name:'Классика и мелок',baseMode:'comparison-current',reviews:'cards',form:1,footer:3,refinement:'quiet',tone:'classic'},
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
    return markup.replace(/<div class="s-study-copy">/g,()=>`<div class="s-study-copy">${chalk(steps[index++],'early-step-picture')}`);
  }
  if(id==='pricing'){
    let index=0;
    const terms=['18-pricing-terms','13-step-application','19-guarantee-calendar'];
    return markup.replace(/<div><dt>/g,()=>{
      const asset=terms[index++];
      return personal&&index<3?'<div><dt>':`<div class="early-price-term">${chalk(asset,'early-term-picture')}<dt>`;
    });
  }
  if(id==='reviews')return markup.replaceAll('<span class="s-quote-mark" aria-hidden="true">“</span>',chalk('21-reviews-quote','early-quote'));
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
  return '<link rel="stylesheet" href="studio/variants/early-chalk/early.css?v=c6535752ac"><script defer src="studio/early-motion.js?v=c6535752ac"></script>';
}
