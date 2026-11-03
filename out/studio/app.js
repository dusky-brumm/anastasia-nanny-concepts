import {blocks,palettes,fontSets,presets,readState,normalizeState,selectVariant,designUrl} from './model.js?v=d7651a8075';
import {renderSite,renderBlock} from './render.js?v=d7651a8075';
import {formatRequest} from '../request.js?v=d7651a8075';

const mode=document.body.dataset.mode;
const capture=new URLSearchParams(location.search).get('capture')==='1';
let state=readState(location.search);
const explicit=['layout','palette','font','route'].some(key=>new URLSearchParams(location.search).has(key));
if(mode==='studio'&&!explicit){try{state=normalizeState(JSON.parse(localStorage.getItem('nastya-design-studio-v1')??'{}'));}catch{/* Use the supplied defaults when saved settings are unavailable. */}}
const root=document.querySelector('[data-site-root]');
const versionMenu=document.querySelector('.version-menu');
if(root)root.innerHTML=renderSite(state);
else if(state.palette==='sky-previous')renderReviews();

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

function renderReviews() {
  document.querySelectorAll('[data-block="reviews"][data-variant="1"]').forEach(review=>{
    review.outerHTML=renderBlock('reviews',1,{state,library:mode==='library'});
  });
}

function applyTheme() {
  const palette=palettes.find(p=>p.id===state.palette);
  if(mode==='preview')document.body.style.setProperty('--page-paper',palette.paper);
  document.querySelectorAll('.site-preview').forEach(site=>{
    site.dataset.font=state.font;site.dataset.palette=state.palette;
    for(const key of ['paper','wash','soft','ink','accent','wine'])site.style.setProperty('--'+key,palette[key]);
  });
}
function currentUrl(page,hash='') {return designUrl(page,state,hash);}
function persistState() {
  if(mode==='studio'){try{localStorage.setItem('nastya-design-studio-v1',JSON.stringify(state));}catch{/* The shared link remains available without local storage. */}}
}
function refreshControls() {
  document.querySelectorAll('[data-palette]').forEach(button=>{if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.palette===state.palette));});
  document.querySelectorAll('[data-palette-select]').forEach(select=>select.value=state.palette);
  document.querySelectorAll('[data-font-select]').forEach(select=>select.value=state.font);
  document.querySelectorAll('[data-block-select]').forEach(select=>select.value=state.layout[blocks.findIndex(b=>b.id===select.dataset.blockSelect)]);
  document.querySelectorAll('[data-preset]').forEach(button=>button.setAttribute('aria-pressed',String(state.layout===presets.find(p=>p.id===button.dataset.preset)?.layout)));
  document.querySelectorAll('[data-library-link]').forEach(a=>a.href=currentUrl('blocks-'+a.dataset.libraryLink+'.html'));
  document.querySelectorAll('[data-open-preview]').forEach(a=>a.href=currentUrl('preview.html'));
  document.querySelectorAll('[data-back-builder]').forEach(a=>a.href=currentUrl('studio.html'));
  document.querySelectorAll('[data-pick-block]').forEach(a=>a.href=designUrl('studio.html',selectVariant(state,a.dataset.pickBlock,a.dataset.pickValue),a.dataset.pickBlock));
  document.querySelectorAll('[data-open-option]').forEach(a=>a.href=designUrl('preview.html',selectVariant(state,document.body.dataset.libraryBlock,a.dataset.openOption),document.body.dataset.libraryBlock));
  const share=document.querySelector('[data-share-url]');if(share)share.value=new URL(currentUrl('preview.html'),location.href).href;
  const summary=document.querySelector('[data-current-design]');if(summary)summary.textContent=palettes.find(p=>p.id===state.palette).name+' · '+fontSets.find(f=>f.id===state.font).name;
  const note=document.querySelector('[data-font-note]');if(note)note.textContent=fontSets.find(f=>f.id===state.font).note;
  document.querySelectorAll('.s-consult-form [type=submit]').forEach(button=>button.disabled=false);
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
  const previousReviews=state.palette==='sky-previous';
  state=normalizeState(next);
  if(root&&all)root.innerHTML=renderSite(state);
  else if(root&&blockId){const index=blocks.findIndex(b=>b.id===blockId);root.querySelector(`[data-block="${blockId}"]`).outerHTML=renderBlock(blockId,state.layout[index],{state});}
  else if(previousReviews!==(state.palette==='sky-previous'))renderReviews();
  if(all||blockId==='service')observeServiceDrawings();
  if(draft){const newForm=root?.querySelector('.s-consult-form');if(newForm)for(const [key,value] of Object.entries(draft))newForm.elements.namedItem(key).value=value;}
  applyTheme();refreshControls();
  const filename=location.pathname.split('/').pop()||'./';
  history.replaceState(null,'',currentUrl(filename)+location.hash);
  persistState();
  markReady();
  if(blockId)root?.querySelector(`[data-block="${blockId}"]`).scrollIntoView({block:'start',behavior:'instant'});
}
function switchVersion(palette) {
  if(palette===state.palette)return;
  const edge=versionMenu.getBoundingClientRect().bottom;
  const visibleBlock=[...root.children].find(block=>block.getBoundingClientRect().bottom>edge+32);
  const position=visibleBlock?.getBoundingClientRect().top;
  updateState({...state,palette});
  if(!visibleBlock)return;
  const updated=document.getElementById(visibleBlock.id).getBoundingClientRect();
  const targetTop=Math.max(position,edge-updated.height+2);
  window.scrollBy({top:updated.top-targetTop,behavior:'instant'});
}
document.addEventListener('change',event=>{
  const control=event.target;
  if(control.matches('[data-block-page-select]')){const block=blocks.find(b=>b.id===control.value);if(block)location.assign(currentUrl('blocks-'+block.id+'.html'));return;}
  if(control.matches('[data-font-select]'))updateState({...state,font:control.value});
  if(control.matches('[data-palette-select]'))updateState({...state,palette:control.value});
  if(control.matches('[data-block-select]'))updateState(selectVariant(state,control.dataset.blockSelect,control.value),{blockId:control.dataset.blockSelect});
});
document.addEventListener('click',async event=>{
  const button=event.target.closest('button');
  if(button?.matches('[data-mobile-settings]')){const open=document.querySelector('.studio-workspace').classList.toggle('settings-open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'Скрыть настройки':'Настроить блоки, цвета и шрифты';}
  if(button?.dataset.palette){
    if(versionMenu?.contains(button))switchVersion(button.dataset.palette);
    else updateState({...state,palette:button.dataset.palette});
  }
  if(button?.dataset.preset){const preset=presets.find(p=>p.id===button.dataset.preset);if(preset)updateState({...state,layout:preset.layout},{all:true});}
  if(button?.dataset.view){const mobile=button.dataset.view==='mobile';document.querySelector('.studio-canvas').classList.toggle('is-mobile',mobile);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));markReady();}
  if(button?.matches('[data-copy-design]')){const input=document.querySelector('[data-share-url]'),status=document.querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(input.value);status.textContent='Ссылка скопирована.';}catch{input.focus();input.select();status.textContent='Скопируйте выделенную ссылку.';}}
  if(button?.matches('.s-privacy'))document.querySelector('#studio-privacy').showModal();
  if(button?.matches('[data-close]'))button.closest('dialog').close();
  if(button?.matches('.s-copy')){const form=button.closest('form'),output=form.elements.namedItem('draft'),status=form.querySelector('[role=status]');try{await navigator.clipboard.writeText(output.value);status.textContent='Текст скопирован.';}catch{output.focus();output.select();status.textContent='Скопируйте выделенный текст вручную.';}}
  const menuLink=event.target.closest('.s-menu a');if(menuLink)menuLink.closest('details').open=false;
  document.querySelectorAll('.s-menu[open]').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;});
  if(event.target.matches('#studio-privacy')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.s-menu[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});
document.addEventListener('submit',event=>{
  const form=event.target;if(!form.matches('.s-consult-form'))return;event.preventDefault();
  const name=form.elements.namedItem('name'),contact=form.elements.namedItem('contact'),message=form.elements.namedItem('message');
  name.setCustomValidity(name.value.trim()?'':'Укажите ваше имя.');contact.setCustomValidity(contact.value.trim().length>=3?'':'Укажите телефон или Telegram для связи.');
  if(!form.reportValidity())return;
  form.elements.namedItem('draft').value=formatRequest({name:name.value,contact:contact.value,message:message.value});
  const draft=form.querySelector('.s-draft');draft.hidden=false;form.querySelector('[role=status]').textContent='Заявка подготовлена. Отправьте её Анастасии самостоятельно.';
  draft.scrollIntoView({block:'nearest',behavior:'instant'});
});
document.addEventListener('input',event=>{const form=event.target.closest('.s-consult-form');if(!form||event.target.name==='draft')return;form.querySelector('.s-draft').hidden=true;form.elements.namedItem('name').setCustomValidity('');form.elements.namedItem('contact').setCustomValidity('');});
applyTheme();refreshControls();persistState();markReady();
