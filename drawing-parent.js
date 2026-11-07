import {drawingEnabled} from './drawing-model.js?v=8cd89996c9';

export function mountDrawingExperience(frames,toolbar){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.querySelector('[data-motion-toggle]');
  const search=new URLSearchParams(location.search);
  let storage,choice=search.get('motion'),queued=false;
  try{storage=localStorage;choice??=storage.getItem('nastya-drawing-motion-v1');}catch{/* Motion remains optional without storage. */}
  choice=choice==='off'?'off':'on';

  function enabled(){return drawingEnabled({reduced:reduced.matches,choice,capture:search.get('capture')==='1'});}
  function render(){
    queued=false;
    if(document.hidden)return;
    const active=enabled(),toolbarHeight=toolbar.getBoundingClientRect().height;
    const settled=document.documentElement.dataset.siteReady==='true'&&!document.documentElement.classList.contains('font-changing')&&!document.documentElement.classList.contains('layout-changing');
    const state=active?'on':'off';
    if(document.documentElement.dataset.drawingMotion!==state){
      document.documentElement.dataset.drawingMotion=state;
      document.dispatchEvent(new CustomEvent('drawing:motion',{detail:{enabled:active}}));
    }
    if(toggle){
      toggle.setAttribute('aria-pressed',String(choice!=='off'));
      toggle.textContent=reduced.matches?'Движение уменьшено системой':choice==='off'?'Анимация выключена':'Анимация включена';
    }
    for(const frame of frames){
      const doc=frame.contentDocument;
      if(!doc?.querySelector('[data-reference-block-root]'))continue;
      const bounds=frame.getBoundingClientRect();
      doc.dispatchEvent(new frame.contentWindow.CustomEvent('drawing:viewport',{detail:{
        enabled:active,frameTop:bounds.top,viewportHeight:innerHeight,toolbarHeight,
        near:settled&&bounds.bottom>toolbarHeight-160&&bounds.top<innerHeight+160,
      }}));
    }
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
  const observer=new ResizeObserver(schedule);
  observer.observe(toolbar);
  frames.forEach(frame=>{frame.addEventListener('load',schedule);observer.observe(frame);});
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('site:layout',schedule);
  reduced.addEventListener('change',schedule);
  toggle?.addEventListener('click',()=>{
    choice=choice==='off'?'on':'off';
    try{storage?.setItem('nastya-drawing-motion-v1',choice);}catch{/* The current page still applies the preference. */}
    const url=new URL(location.href);url.searchParams.set('motion',choice);history.replaceState(null,'',url);
    schedule();
  });
  schedule();
}
