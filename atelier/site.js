import {initCommonUI} from '../shared-ui.js';
initCommonUI({menuButton:'.menu-toggle',menu:'#mobile-nav'});

// Optional interview/process tabs: the HTML remains readable before enhancement.
for(const group of document.querySelectorAll('[data-tabs]')){
 const tabs=[...group.querySelectorAll('[role="tab"]')];
 function activate(tab,focus=false){
  for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;}
  const progress=group.querySelector('[data-tab-progress]');
  if(progress)progress.textContent=`Этап ${tabs.indexOf(tab)+1} из ${tabs.length}`;
  if(focus)tab.focus();
 }
 for(const [index,tab] of tabs.entries()){
  tab.addEventListener('click',()=>activate(tab));
  tab.addEventListener('keydown',event=>{
   const offsets={ArrowRight:1,ArrowLeft:-1};let next;
   if(event.key in offsets)next=(index+offsets[event.key]+tabs.length)%tabs.length;
   if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
   if(next!==undefined){event.preventDefault();activate(tabs[next],true);}
  });
 }
 if(tabs.length)activate(tabs.find(t=>t.getAttribute('aria-selected')==='true')||tabs[0]);
}

const root=document.documentElement;
const capture=new URLSearchParams(location.search).get('capture')==='1';root.dataset.capture=String(capture);
if(capture){
 let timer;const settled=()=>requestAnimationFrame(()=>{root.dataset.captureReady=location.hash||'#top';root.dataset.captureScroll=String(Math.round(scrollY));});
 addEventListener('scroll',()=>{root.dataset.captureScroll='moving';clearTimeout(timer);timer=setTimeout(settled,120);},{passive:true});
 addEventListener('scrollend',settled);addEventListener('resize',settled);addEventListener('hashchange',settled);
 Promise.all([document.fonts.ready,...[...document.querySelectorAll('img[fetchpriority="high"]')].map(img=>img.decode().catch(()=>{}))]).then(settled);
}
