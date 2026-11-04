import {normalizeJourney, renderJourney} from './journeys.js?v=b41e877658';
import {formatRequest} from './request.js?v=b41e877658';
export {formatRequest};

function initialize() {
  const requestedRoute=new URLSearchParams(location.search).get('route');
  const routeId=normalizeJourney(requestedRoute);
  const journeyHost=document.querySelector('[data-journey-main]');
  if(routeId!=='1')journeyHost.innerHTML=renderJourney(routeId);
  journeyHost.closest('.process').dataset.routeVariant=routeId;
  if(requestedRoute)document.querySelector('.route-back').hidden=false;
  const menuButton=document.querySelector('.menu-toggle');
  const navigation=document.querySelector('#navigation');
  function closeMenu(focus=false){navigation.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');if(focus)menuButton.focus();}
  menuButton.addEventListener('click',()=>{const open=navigation.hidden;navigation.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
  navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('click',event=>{if(!navigation.hidden&&!navigation.contains(event.target)&&!menuButton.contains(event.target))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!navigation.hidden)closeMenu(true);});
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
  document.querySelectorAll('[data-request]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();document.querySelector('#request-dialog').showModal();}));
  document.querySelector('[data-privacy]').addEventListener('click',()=>document.querySelector('#privacy-dialog').showModal());
  document.querySelector('[data-whatsapp]').addEventListener('click',()=>document.querySelector('#channel-dialog').showModal());
  const form=document.querySelector('#request-form');
  const draft=form.querySelector('.draft');
  const output=form.querySelector('.draft-text');
  const status=draft.querySelector('[role=status]');
  form.addEventListener('input',event=>{if(draft.contains(event.target))return;draft.hidden=true;form.elements.name.setCustomValidity('');form.elements.contact.setCustomValidity('');});
  form.addEventListener('submit',event=>{event.preventDefault();const name=form.elements.name;const contact=form.elements.contact;name.setCustomValidity(name.value.trim()?'':'Укажите ваше имя.');contact.setCustomValidity(contact.value.trim().length>=3?'':'Укажите телефон или Telegram для связи.');if(!form.reportValidity())return;output.value=formatRequest({name:name.value,contact:contact.value,message:form.elements.message.value});draft.hidden=false;status.textContent='Сообщение подготовлено. Отправьте его Анастасии самостоятельно.';draft.scrollIntoView({block:'nearest',behavior:'instant'});});
  form.querySelector('[data-copy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.value);status.textContent='Текст скопирован.';}catch{output.focus();output.select();status.textContent='Скопируйте выделенный текст вручную.';}});
  form.querySelector('[type=submit]').disabled=false;
  if(new URLSearchParams(location.search).get('capture')==='1'){
    document.documentElement.style.scrollBehavior='auto';
    const images=[...document.images];images.forEach(image=>image.loading='eager');
    Promise.all([document.fonts.ready,...images.map(image=>image.decode().catch(()=>{}))]).then(()=>requestAnimationFrame(()=>{document.documentElement.dataset.captureReady='true';}));
  }
}
if(typeof document!=='undefined')initialize();
