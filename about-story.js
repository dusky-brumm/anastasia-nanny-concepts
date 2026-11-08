const section=document.querySelector('[data-about-story]');
if(section){
  const slides=[...section.querySelectorAll('.s-about-slides li')];
  const dots=[...section.querySelectorAll('[data-about-dot]')];
  const status=section.querySelector('.s-about-status');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,visible=false,hovered=false,timer,clockAnimation;
  let drawingOn=document.documentElement.dataset.drawingMotion!=='off';
  const clocks=dots.map((dot,i)=>{
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','about-dot-timer');svg.setAttribute('viewBox','0 0 28 28');
    svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    svg.innerHTML=`<defs><filter id="clock-grain-${i}"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2"/><feColorMatrix type="luminanceToAlpha"/><feComponentTransfer><feFuncA type="linear" slope="2" intercept="-.2"/></feComponentTransfer><feComposite in="SourceGraphic" operator="in"/></filter></defs><circle cx="14" cy="14" r="11" fill="none" stroke="#526c73" stroke-width="1.6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 14 14)" filter="url(#clock-grain-${i})"/>`;
    dot.append(svg);return svg.querySelector('circle');
  });

  function schedule(){
    clearTimeout(timer);
    clockAnimation?.cancel();clockAnimation=null;
    section.dataset.aboutRunning='false';
    const focused=document.hasFocus()&&section.querySelector(':focus-visible');
    if(!visible||hovered||document.hidden||motion.matches||!drawingOn||focused)return;
    section.dataset.aboutRunning='true';
    clockAnimation=clocks[index].animate?.([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:6500,easing:'linear',fill:'forwards'});
    timer=setTimeout(()=>show((index+1)%slides.length,'auto'),6500);
  }
  function show(next,source='manual'){
    index=Math.max(0,Math.min(slides.length-1,next));
    slides.forEach((slide,i)=>{
      slide.classList.toggle('is-current',i===index);
      slide.setAttribute('aria-hidden',String(i!==index));
    });
    dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
    if(source==='manual')status.textContent=dots[index].getAttribute('aria-label');
    schedule();
  }
  section.dataset.aboutDesign='1';
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();},{threshold:.3}).observe(section);
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
  section.querySelectorAll('[data-about-step]').forEach(button=>button.addEventListener('click',()=>show((index+Number(button.dataset.aboutStep)+slides.length)%slides.length)));
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
  const readingArea=section.querySelector('.s-about-viewport');
  readingArea.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;schedule();}});
  readingArea.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'){hovered=false;schedule();}});
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('drawing:motion',event=>{drawingOn=event.detail.enabled;schedule();});
  motion.addEventListener('change',schedule);
  section.dataset.ready='';
  show(0,'initial');
}
