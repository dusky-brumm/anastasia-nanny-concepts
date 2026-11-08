import {drawingEnabled} from './drawing-model.js?v=d498d1698a';

export function mountDrawingExperience(frames){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const search=new URLSearchParams(location.search);
  const choice=search.get('motion')==='off'?'off':'on';
  let queued=false;

  function enabled(){return drawingEnabled({reduced:reduced.matches,choice,capture:search.get('capture')==='1'});}
  function render(){
    queued=false;
    if(document.hidden)return;
    const active=enabled(),toolbarHeight=0;
    const settled=document.documentElement.dataset.siteReady==='true';
    const state=active?'on':'off';
    if(document.documentElement.dataset.drawingMotion!==state){
      document.documentElement.dataset.drawingMotion=state;
      document.dispatchEvent(new CustomEvent('drawing:motion',{detail:{enabled:active}}));
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
  frames.forEach(frame=>{frame.addEventListener('load',schedule);observer.observe(frame);});
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('site:layout',schedule);
  reduced.addEventListener('change',schedule);
  schedule();
}
