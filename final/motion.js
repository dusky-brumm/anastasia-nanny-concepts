/** Optional presentation effects. No text is hidden while scripts are loading. */
export function initPresentationEffects({doc=document,win=window}={}){
  const root=doc.documentElement;
  const preference=win.matchMedia('(prefers-reduced-motion: reduce)');
  const params=new URLSearchParams(win.location.search);
  const capture=params.get('capture')==='1';
  root.dataset.capture=String(capture);
  const motionOff=capture||params.get('motion')==='off';
  // Paint/scroll signals let screenshot QA wait for a stable view without sleeps.
  let captureTimer;
  function finishCapturePaint(){
    win.requestAnimationFrame(()=>{
      root.dataset.captureReady=win.location.hash||'#top';
      root.dataset.captureScroll=String(Math.round(win.scrollY));
    });
  }
  function markCapturePaint(){
    delete root.dataset.captureReady;
    root.dataset.captureScroll='moving';
    win.requestAnimationFrame(()=>win.requestAnimationFrame(finishCapturePaint));
  }
  function markCaptureScroll(){
    root.dataset.captureScroll='moving';
    win.clearTimeout(captureTimer);
    captureTimer=win.setTimeout(finishCapturePaint,120);
  }
  if(capture){
    win.addEventListener('hashchange',markCapturePaint);
    win.addEventListener('resize',markCapturePaint);
    win.addEventListener('scroll',markCaptureScroll,{passive:true});
    win.addEventListener('scrollend',finishCapturePaint);
    markCapturePaint();
  }
  const bar=doc.querySelector('.reading-progress>span');
  const floating=doc.querySelector('.floating-request');
  let frame=0;
  function updateProgress(){
    frame=0;
    const distance=root.scrollHeight-win.innerHeight;
    const progress=distance>0?Math.min(1,Math.max(0,win.scrollY/distance)):0;
    if(bar)bar.style.transform=`scaleX(${progress})`;
  }
  function scheduleProgress(){if(!frame)frame=win.requestAnimationFrame(updateProgress);}
  win.addEventListener('scroll',scheduleProgress,{passive:true});
  win.addEventListener('resize',scheduleProgress,{passive:true});
  win.addEventListener('pageshow',scheduleProgress);
  scheduleProgress();

  const observers=[];
  if(typeof win.IntersectionObserver==='function'){
    let heroPassed=false,requestVisible=false;
    const visibility=new win.IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.target.id==='hero')heroPassed=!entry.isIntersecting&&entry.boundingClientRect.bottom<=0;
        if(entry.target.id==='request')requestVisible=entry.isIntersecting;
      }
      if(floating)floating.hidden=!heroPassed||requestVisible;
    });
    observers.push(visibility);
    for(const id of ['hero','request']){const section=doc.getElementById(id);if(section)visibility.observe(section);}
    const navigation=new win.IntersectionObserver(entries=>{
      const current=entries.find(entry=>entry.isIntersecting);
      if(!current)return;
      doc.querySelectorAll('.desktop-nav a,.mobile-nav a').forEach(link=>{
        if(link.getAttribute('href')===`#${current.target.id}`)link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    },{rootMargin:'-20% 0px -55% 0px'});
    observers.push(navigation);
    doc.querySelectorAll('main [data-section]').forEach(section=>navigation.observe(section));
  }

  let revealObserver;
  const animations=new Set();
  function stopMotion(){
    revealObserver?.disconnect();
    animations.forEach(animation=>animation.cancel());
    animations.clear();
  }
  function startMotion(){
    stopMotion();
    root.dataset.motion=motionOff?'off':preference.matches?'reduced':'on';
    if(motionOff||preference.matches||typeof win.IntersectionObserver!=='function'||typeof root.animate!=='function')return;
    const seen=new WeakSet();
    function reveal(element,delay=0){
      if(seen.has(element))return;
      seen.add(element);
      const isNote=element.matches('.paper-note');
      const keyframes=isNote?
        [{opacity:.65,transform:'translateY(6px) rotate(-5deg)'},{opacity:1,transform:'rotate(-3deg)'}]:
        [{opacity:element.matches('h1') ? .85 : .7,translate:'0 8px'},{opacity:1,translate:'0 0'}];
      const animation=element.animate(keyframes,{duration:isNote?650:420,delay,easing:'cubic-bezier(.2,.65,.3,1)'});
      animations.add(animation);
      animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));
    }
    doc.querySelectorAll('.hero h1,.hero .hero-intro,.hero .hero-actions').forEach((element,index)=>reveal(element,index*55));
    revealObserver=new win.IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){reveal(entry.target);revealObserver.unobserve(entry.target);}});
    },{threshold:.12,rootMargin:'0px 0px -25px 0px'});
    doc.querySelectorAll('.section-heading,.service-items>article,.process-layout>article,.price-plan,.review-card,.paper-note').forEach(element=>revealObserver.observe(element));
  }
  preference.addEventListener('change',startMotion);
  startMotion();
  return ()=>{
    stopMotion();
    observers.forEach(observer=>observer.disconnect());
    preference.removeEventListener('change',startMotion);
    win.removeEventListener('scroll',scheduleProgress);
    win.removeEventListener('resize',scheduleProgress);
    win.removeEventListener('pageshow',scheduleProgress);
    win.removeEventListener('hashchange',markCapturePaint);
    win.removeEventListener('resize',markCapturePaint);
    win.removeEventListener('scroll',markCaptureScroll);
    win.removeEventListener('scrollend',finishCapturePaint);
    win.clearTimeout(captureTimer);
    if(frame)win.cancelAnimationFrame(frame);
  };
}
