import {initCommonUI} from '../shared-ui.js';
import {initFavorites} from '../preferences.js';
initCommonUI({menuButton:'.menu-toggle',menu:'#mobile-nav'});
initFavorites();

// Native tabs remain keyboard accessible; every stage has a server-rendered panel.
for(const widget of document.querySelectorAll('[data-route-widget]')){
 const tabs=[...widget.querySelectorAll('[role=tab]')];
 const controls=widget.querySelector('.route-controls');
 const previous=widget.querySelector('[data-route-prev]');
 const next=widget.querySelector('[data-route-next]');
 const count=widget.querySelector('[data-route-count]');
 let current=0;
 function activate(tab,focus=false){
  for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;}
  current=tabs.indexOf(tab);
  previous.disabled=current===0;next.disabled=current===tabs.length-1;
  count.textContent=`Этап ${current+1} из ${tabs.length}`;
  if(focus)tab.focus();
 }
 controls.hidden=false;
 previous.addEventListener('click',()=>{if(current>0)activate(tabs[current-1]);});
 next.addEventListener('click',()=>{if(current<tabs.length-1)activate(tabs[current+1]);});
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activate(tab));
  tab.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight')next=(index+1)%tabs.length;
   if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
   if(event.key==='Home')next=0;
   if(event.key==='End')next=tabs.length-1;
   if(next!==undefined){event.preventDefault();activate(tabs[next],true);}
  });
 });
}

const root=document.documentElement;
const capture=new URLSearchParams(location.search).get('capture')==='1';
root.dataset.capture=String(capture);
let paintTimer;
function settled(){requestAnimationFrame(()=>{root.dataset.captureScroll=String(Math.round(scrollY));root.dataset.captureReady=location.hash||'#top';});}
if(capture){
 addEventListener('scroll',()=>{root.dataset.captureScroll='moving';clearTimeout(paintTimer);paintTimer=setTimeout(settled,120);},{passive:true});
 addEventListener('scrollend',settled);
 addEventListener('hashchange',settled);
 addEventListener('resize',settled);
 Promise.all([document.fonts.ready,...[...document.querySelectorAll('.hero img')].map(img=>img.decode().catch(()=>{}))]).then(()=>requestAnimationFrame(settled));
}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!capture&&!reduced.matches){
 const headline=document.querySelector('h1');
 headline?.animate([{opacity:.8,translate:'0 9px'},{opacity:1,translate:'0 0'}],{duration:420,easing:'ease-out'});
}
