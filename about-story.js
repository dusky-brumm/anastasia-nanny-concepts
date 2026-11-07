import {readAboutVariant} from './about-model.js?v=08901a9aa0';

const section=document.querySelector('[data-about-story]');
if(section){
  const slides=[...section.querySelectorAll('.s-about-slides li')];
  const dots=[...section.querySelectorAll('[data-about-dot]')];
  const status=section.querySelector('.s-about-status');
  const position=section.querySelector('[data-about-position]');
  const pause=section.querySelector('[data-about-pause]');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,visible=false,paused=false,mode='auto',timer;

  function schedule(){
    clearTimeout(timer);
    const focused=section.querySelector(':focus-visible')&&document.activeElement!==pause;
    if(!visible||paused||document.hidden||motion.matches||mode==='scroll'||focused)return;
    timer=setTimeout(()=>show((index+1)%slides.length,'auto'),6500);
  }
  function show(next,source='manual'){
    index=Math.max(0,Math.min(slides.length-1,next));
    slides.forEach((slide,i)=>{
      slide.classList.toggle('is-current',i===index);
      slide.setAttribute('aria-hidden',String(i!==index));
    });
    dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
    position.textContent=`0${index+1} / 0${slides.length}`;
    if(source==='manual')status.textContent=dots[index].getAttribute('aria-label');
    section.dispatchEvent(new CustomEvent('about:selection',{detail:{index,source}}));
    schedule();
  }
  function configure({variant,scroll=false}){
    const changed=section.dataset.aboutDesign!==variant;
    section.dataset.aboutDesign=variant;
    mode=scroll?'scroll':'auto';
    section.dataset.aboutMode=mode;
    pause.hidden=scroll||motion.matches;
    section.querySelector('[data-about-scroll-hint]').hidden=!scroll;
    if(changed)show(0,'design');else schedule();
  }
  let search=location.search;
  try{if(parent!==window)search=parent.location.search;}catch{/* Standalone previews use their own URL. */}
  configure({variant:readAboutVariant(search).id});
  section.addEventListener('about:configure',event=>configure(event.detail));
  section.addEventListener('about:scroll',event=>show(event.detail.index,'scroll'));
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();},{threshold:.3}).observe(section);
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
  section.querySelectorAll('[data-about-step]').forEach(button=>button.addEventListener('click',()=>show((index+Number(button.dataset.aboutStep)+slides.length)%slides.length)));
  pause.addEventListener('click',()=>{
    paused=!paused;
    pause.textContent=paused?'Продолжить':'Пауза';
    pause.setAttribute('aria-label',paused?'Продолжить автоматическую смену историй':'Приостановить автоматическую смену историй');
    pause.setAttribute('aria-pressed',String(paused));
    schedule();
  });
  section.querySelector('.s-about-viewport').addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();
    show((index+(event.key==='ArrowRight'?1:-1)+slides.length)%slides.length);
  });
  let touchStart;
  section.addEventListener('touchstart',event=>{touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
  section.addEventListener('touchend',event=>{
    if(!touchStart)return;
    const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)show((index+(dx<0?1:-1)+slides.length)%slides.length);
    touchStart=null;
  },{passive:true});
  section.addEventListener('focusin',schedule);
  section.addEventListener('focusout',()=>queueMicrotask(schedule));
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change',()=>{pause.hidden=mode==='scroll'||motion.matches;schedule();});
  section.dataset.ready='';
  show(0,'initial');
}
