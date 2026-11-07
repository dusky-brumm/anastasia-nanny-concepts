import {blocks,palettes,approvedTheme,fontSets,defaults,presets,readState,normalizeState,selectVariant,designUrl} from './model.js?v=dc638001c0';
import {renderSite,renderBlock} from './render.js?v=dc638001c0';
import {formatRequest} from '../request.js?v=dc638001c0';
import {requestEndpoint} from './request-endpoint.js?v=dc638001c0';
import EmblaCarousel from './vendor/embla-carousel-8.6.0.js';

const mode=document.body.dataset.mode;
const liveRequests=Boolean(requestEndpoint)&&document.body.hasAttribute('data-live-request');
if(liveRequests)document.querySelector('#studio-privacy p').textContent='При отправке имя, контакт и текст заявки передаются в Telegram Анастасии, чтобы она могла ответить.';
const capture=new URLSearchParams(location.search).get('capture')==='1';
let state=readState(location.search);
const explicit=['layout','palette','font','route','version'].some(key=>new URLSearchParams(location.search).has(key));
if(mode==='studio'&&!explicit){try{state=normalizeState(JSON.parse(localStorage.getItem('nastya-design-studio-v1')??'{}'));}catch{/* Use the supplied defaults when saved settings are unavailable. */}}
const root=document.querySelector('[data-site-root]');
const designPanel=document.querySelector('.design-panel');
if(designPanel&&'ResizeObserver' in window){
  new ResizeObserver(()=>root.style.setProperty('--comparison-offset',designPanel.offsetHeight+14+'px')).observe(designPanel);
}
if(root)root.innerHTML=renderSite(state);
else if(state.version==='previous')renderReviews();

const chalkObserver=!capture&&'IntersectionObserver' in window
  ?new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.intersectionRatio<.15)continue;
      entry.target.dataset.chalk='drawn';
      chalkObserver.unobserve(entry.target);
    }
  },{threshold:.15})
  :null;
function observeServiceDrawings() {
  if(!chalkObserver)return;
  chalkObserver.disconnect();
  document.querySelectorAll('.s-service:not([data-chalk="drawn"])').forEach(section=>{
    section.dataset.chalk='waiting';
    chalkObserver.observe(section);
  });
}
observeServiceDrawings();

let aboutCarousels=[];
function playAboutCarousel(section,carousel,motion){
  if(capture)return;
  const events=new AbortController();
  const options={signal:events.signal};
  let timer;
  let visible=false;
  let hovered=false;
  let dragging=false;
  const schedule=()=>{
    clearTimeout(timer);
    if(!visible||document.hidden||motion.matches||hovered||dragging||section.querySelector(':focus-visible'))return;
    const delay=carousel.selectedScrollSnap()===0?16000:8000;
    timer=setTimeout(()=>carousel.scrollNext(),delay);
  };
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    schedule();
  },{threshold:.3});
  observer.observe(section);
  section.addEventListener('pointerenter',event=>{hovered=event.pointerType==='mouse';schedule();},options);
  section.addEventListener('pointerleave',()=>{hovered=false;schedule();},options);
  section.addEventListener('focusin',schedule,options);
  section.addEventListener('focusout',()=>queueMicrotask(schedule),options);
  document.addEventListener('visibilitychange',schedule,options);
  motion.addEventListener('change',schedule,options);
  carousel.on('select',schedule).on('reInit',schedule)
    .on('pointerDown',()=>{dragging=true;schedule();})
    .on('pointerUp',()=>{dragging=false;schedule();})
    .on('destroy',()=>{
      visible=false;
      clearTimeout(timer);
      observer.disconnect();
      events.abort();
    });
}

function mountAboutCarousels(){
  aboutCarousels=[...document.querySelectorAll('[data-about-carousel]:not([data-about-custom])')].map(section=>{
    const events=new AbortController();
    const eventOptions={signal:events.signal};
    const viewport=section.querySelector('.s-about-viewport');
    const controls=section.querySelector('.s-about-dots');
    const dots=[...section.querySelectorAll('[data-about-dot]')];
    const status=section.querySelector('.s-about-status');
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    viewport.dataset.ready='';
    const carousel=EmblaCarousel(viewport,{loop:true,breakpoints:{'(prefers-reduced-motion: reduce)':{duration:0}}});
    const select=index=>carousel.scrollTo(index,motion.matches);
    const refresh=()=>{
      const current=carousel.selectedScrollSnap();
      carousel.slideNodes().forEach((slide,index)=>slide.setAttribute('aria-hidden',String(index!==current)));
      dots.forEach((dot,index)=>dot.setAttribute('aria-current',String(index===current)));
    };
    carousel.on('select',()=>{
      refresh();
      if(section.contains(document.activeElement))status.textContent=dots[carousel.selectedScrollSnap()].getAttribute('aria-label');
    }).on('reInit',refresh);
    dots.forEach((dot,index)=>dot.addEventListener('click',()=>select(index),eventOptions));
    const previous=()=>carousel.scrollPrev(motion.matches);
    const next=()=>carousel.scrollNext(motion.matches);
    viewport.addEventListener('keydown',event=>{
      if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
      event.preventDefault();
      if(event.key==='ArrowLeft')previous();
      else next();
    },eventOptions);
    carousel.on('destroy',()=>events.abort());
    refresh();
    controls.hidden=false;
    playAboutCarousel(section,carousel,motion);
    return carousel;
  });
}
mountAboutCarousels();
document.addEventListener('comparison:about-changed',()=>{
  aboutCarousels.forEach(carousel=>carousel.destroy());
  mountAboutCarousels();
});

function renderReviews() {
  document.querySelectorAll('[data-block="reviews"][data-variant="1"]').forEach(review=>{
    review.outerHTML=renderBlock('reviews',1,{state,library:mode==='library'});
  });
}

function applyTheme() {
  if(document.querySelector('.comparison-design'))return;
  const palette=document.body.dataset.fixedTheme?approvedTheme:palettes.find(p=>p.id===state.palette);
  if(mode==='preview')document.body.style.setProperty('--page-paper',palette.paper);
  document.querySelectorAll('.site-preview').forEach(site=>{
    site.dataset.font=state.font;site.dataset.palette=state.palette;
    for(const key of ['paper','wash','soft','ink','accent','wine'])site.style.setProperty('--'+key,palette[key]);
    for(const [css,key] of Object.entries({'button-fill':'button','photo-backing':'backing','drawing-blue':'drawingBlue','drawing-rose':'drawingRose','drawing-green':'drawingGreen'})){
      if(palette[key])site.style.setProperty('--'+css,palette[key]);
      else site.style.removeProperty('--'+css);
    }
  });
}
function currentUrl(page,hash='') {return designUrl(page,state,hash);}
function persistState() {
  if(mode==='studio'){try{localStorage.setItem('nastya-design-studio-v1',JSON.stringify(state));}catch{/* The shared link remains available without local storage. */}}
}
function refreshControls() {
  document.dispatchEvent(new Event('reviews:refresh'));
  document.querySelectorAll('[data-palette]').forEach(button=>{if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.palette===state.palette));});
  const paletteLabel=document.querySelector('[data-selected-palette]');
  const paletteButton=document.querySelector(`.theme-options [data-palette="${state.palette}"]`);
  if(paletteLabel&&paletteButton)paletteLabel.replaceChildren(...[...paletteButton.childNodes].map(node=>node.cloneNode(true)));
  document.querySelectorAll('[data-palette-select]').forEach(select=>select.value=state.palette);
  document.querySelectorAll('[data-font-select]').forEach(select=>select.value=state.font);
  document.querySelectorAll('[data-block-select]').forEach(select=>select.value=String(parseInt(state.layout[blocks.findIndex(b=>b.id===select.dataset.blockSelect)],36)));
  document.querySelectorAll('[data-preset-select]').forEach(select=>select.value=presets.find(preset=>preset.layout===state.layout)?.id??'');
  document.querySelectorAll('[data-preset]').forEach(button=>button.setAttribute('aria-pressed',String(state.layout===presets.find(p=>p.id===button.dataset.preset)?.layout)));
  document.querySelectorAll('[data-library-link]').forEach(a=>a.href=currentUrl('blocks-'+a.dataset.libraryLink+'.html'));
  document.querySelectorAll('[data-open-preview]').forEach(a=>a.href=currentUrl('preview.html'));
  document.querySelectorAll('[data-back-builder]').forEach(a=>a.href=currentUrl('studio.html'));
  document.querySelectorAll('[data-pick-block]').forEach(a=>a.href=designUrl('studio.html',selectVariant(state,a.dataset.pickBlock,a.dataset.pickValue),a.dataset.pickBlock));
  document.querySelectorAll('[data-open-option]').forEach(a=>a.href=designUrl('preview.html',selectVariant(state,document.body.dataset.libraryBlock,a.dataset.openOption),document.body.dataset.libraryBlock));
  const share=document.querySelector('[data-share-url]');if(share)share.value=new URL(currentUrl('preview.html'),location.href).href;
  const summary=document.querySelector('[data-current-design]');if(summary)summary.textContent=(document.body.dataset.fixedTheme?approvedTheme:palettes.find(p=>p.id===state.palette)).name+' · '+fontSets.find(f=>f.id===state.font).name;
  const note=document.querySelector('[data-font-note]');if(note)note.textContent=fontSets.find(f=>f.id===state.font).note;
  document.querySelectorAll('.s-consult-form').forEach(form=>{
    const button=form.querySelector('[type=submit]');
    button.disabled=form.getAttribute('aria-busy')==='true';
    if(!liveRequests)return;
    button.firstChild.textContent='Отправить заявку ';
  });
  // Isolated block previews keep their calls to action pointed at the full composition.
  if(mode==='library')document.querySelectorAll('.site-preview a[href*="preview.html"]').forEach(a=>{const url=new URL(a.href,location.href),variant=a.closest('[data-option]').dataset.option;const previewState=selectVariant(state,document.body.dataset.libraryBlock,variant);a.href=designUrl('preview.html',previewState,url.hash.slice(1));});
}
let readinessVersion=0;
async function markReady() {
  const requestVersion=++readinessVersion;
  delete document.documentElement.dataset.studioReady;
  await new Promise(requestAnimationFrame);
  if(capture)document.querySelectorAll('img').forEach(img=>img.loading='eager');
  await document.fonts.ready;
  const images=[...document.images].filter(img=>capture||img.loading!=='lazy'||img.complete);
  await Promise.all(images.map(img=>img.decode().catch(()=>{})));
  // Let decoded photos and the new anchor position reach the screen before capture.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  // Background browser previews publish their image after the DOM paint completes.
  if(capture)await new Promise(resolve=>setTimeout(resolve,180));
  if(requestVersion===readinessVersion){document.documentElement.dataset.studioHash=location.hash;document.documentElement.dataset.studioReady='true';}
}
window.addEventListener('hashchange',markReady);
if(capture)window.addEventListener('scroll',markReady,{passive:true});
function updateState(next,{blockId,all=false}={}) {
  const form=root?.querySelector('.s-consult-form');
  const draft=form?Object.fromEntries(['name','contact','message'].map(key=>[key,form.elements.namedItem(key).value])):null;
  const previousReviews=state.version==='previous';
  const remountAbout=Boolean(root&&(all||blockId==='about'));
  if(remountAbout)aboutCarousels.forEach(carousel=>carousel.destroy());
  state=normalizeState(next);
  if(root&&all)root.innerHTML=renderSite(state);
  else if(root&&blockId){const index=blocks.findIndex(b=>b.id===blockId);root.querySelector(`[data-block="${blockId}"]`).outerHTML=renderBlock(blockId,state.layout[index],{state});}
  else if(previousReviews!==(state.version==='previous'))renderReviews();
  if(all||blockId==='service')observeServiceDrawings();
  if(remountAbout)mountAboutCarousels();
  if(draft){const newForm=root?.querySelector('.s-consult-form');if(newForm)for(const [key,value] of Object.entries(draft))newForm.elements.namedItem(key).value=value;}
  applyTheme();refreshControls();
  const filename=location.pathname.split('/').pop()||'./';
  history.replaceState(null,'',currentUrl(filename)+location.hash);
  persistState();
  markReady();
  if(blockId)root?.querySelector(`[data-block="${blockId}"]`).scrollIntoView({block:'start',behavior:'instant'});
}
document.addEventListener('change',event=>{
  const control=event.target;
  if(control.matches('[data-block-page-select]')){const block=blocks.find(b=>b.id===control.value);if(block)location.assign(currentUrl('blocks-'+block.id+'.html'));return;}
  if(control.matches('[data-preset-select]')){
    const preset=presets.find(item=>item.id===control.value);
    if(preset)updateState({...state,layout:preset.layout},{all:true});
  }
  if(control.matches('[data-font-select]'))updateState({...state,font:control.value});
  if(control.matches('[data-palette-select]')){
    const next={...state,version:state.version??'current',palette:control.value};
    updateState(next);
  }
  if(control.matches('[data-block-select]'))updateState(selectVariant(state,control.dataset.blockSelect,control.value),{blockId:control.dataset.blockSelect});
});
document.addEventListener('click',async event=>{
  const button=event.target.closest('button');
  if(document.querySelector('.comparison-design')&&(button?.matches('.s-privacy,[data-close],.s-copy')||event.target.matches('#studio-privacy')))return;
  if(button?.matches('[data-mobile-settings]')){const open=document.querySelector('.studio-workspace').classList.toggle('settings-open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'Скрыть настройки':'Настроить блоки, цвета и шрифты';}
  if(button?.dataset.palette){
    updateState({...state,version:state.version??'current',palette:button.dataset.palette});
    const picker=button.closest('.theme-picker');
    if(picker){picker.open=false;picker.querySelector('summary').focus({preventScroll:true});}
  }
  if(button?.dataset.preset){const preset=presets.find(p=>p.id===button.dataset.preset);if(preset)updateState({...state,layout:preset.layout},{all:true});}
  if(button?.dataset.view){const mobile=button.dataset.view==='mobile';document.querySelector('.studio-canvas').classList.toggle('is-mobile',mobile);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));markReady();}
  if(button?.matches('[data-copy-design]')){const input=document.querySelector('[data-share-url]'),status=document.querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(input.value);status.textContent='Ссылка скопирована.';}catch{input.focus();input.select();status.textContent='Скопируйте выделенную ссылку.';}}
  if(button?.matches('.s-privacy'))document.querySelector('#studio-privacy').showModal();
  if(button?.matches('[data-close]'))button.closest('dialog').close();
  if(button?.matches('.s-copy')){const form=button.closest('form'),output=form.elements.namedItem('draft'),status=form.querySelector('[role=status]');try{await navigator.clipboard.writeText(output.value);status.textContent='Текст скопирован.';}catch{output.focus();output.select();status.textContent='Скопируйте выделенный текст вручную.';}}
  const menuLink=event.target.closest('.s-menu a');if(menuLink)menuLink.closest('details').open=false;
  document.querySelectorAll('.s-menu[open]').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;});
  document.querySelectorAll('.theme-picker[open]').forEach(picker=>{if(!picker.contains(event.target))picker.open=false;});
  if(event.target.matches('#studio-privacy')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.s-menu[open],.theme-picker[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus({preventScroll:true});});});
document.addEventListener('submit',async event=>{
  const form=event.target;if(!form.matches('.s-consult-form')||form.closest('.comparison-design'))return;event.preventDefault();
  if(form.getAttribute('aria-busy')==='true')return;
  const name=form.elements.namedItem('name'),contact=form.elements.namedItem('contact'),message=form.elements.namedItem('message');
  name.setCustomValidity(name.value.trim()?'':'Укажите ваше имя.');contact.setCustomValidity(contact.value.trim().length>=3?'':'Укажите телефон или Telegram для связи.');
  if(!form.reportValidity())return;
  const application={name:name.value,contact:contact.value,message:message.value,website:form.elements.namedItem('website').value};
  const draft=form.querySelector('.s-draft'),status=form.querySelector('[role=status]');
  const deliveryError='Не удалось подтвердить отправку. Можно отправить текст ниже Анастасии в Telegram.';
  let feedback='Заявка подготовлена. Отправьте её Анастасии самостоятельно.';
  if(liveRequests){
    const submit=form.querySelector('[type=submit]');
    const fields=[name,contact,message];
    draft.hidden=true;
    form.setAttribute('aria-busy','true');
    submit.disabled=true;
    fields.forEach(field=>field.readOnly=true);
    submit.firstChild.textContent='Отправляем… ';
    status.textContent='';
    try{
      const response=await fetch(requestEndpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(application),
        credentials:'omit',
        signal:AbortSignal.timeout(15000),
      });
      if(response.ok&&(await response.json()).ok===true){
        form.reset();
        status.textContent='Заявка отправлена. Анастасия свяжется с вами.';
        return;
      }
      if(response.status===429)feedback='Слишком много попыток. Попробуйте через минуту или напишите Анастасии в Telegram.';
      else feedback=deliveryError;
    }catch{
      feedback=deliveryError;
    }finally{
      form.removeAttribute('aria-busy');
      submit.disabled=false;
      fields.forEach(field=>field.readOnly=false);
      submit.firstChild.textContent='Отправить заявку ';
    }
  }
  form.elements.namedItem('draft').value=formatRequest(application);
  status.textContent=feedback;
  draft.hidden=false;
  draft.scrollIntoView({block:'nearest',behavior:'instant'});
});
document.addEventListener('input',event=>{const form=event.target.closest('.s-consult-form');if(!form||form.closest('.comparison-design')||event.target.name==='draft')return;form.querySelector('.s-draft').hidden=true;form.querySelector('[role=status]').textContent='';form.elements.namedItem('name').setCustomValidity('');form.elements.namedItem('contact').setCustomValidity('');});
applyTheme();refreshControls();persistState();markReady();
