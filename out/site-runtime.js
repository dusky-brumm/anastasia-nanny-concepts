(()=>{

// Small public-site interactions, without the former design editor runtime.
for(const menu of document.querySelectorAll('.s-menu'))menu.addEventListener('toggle',()=>{
  menu.querySelector('summary').setAttribute('aria-label',menu.open?'Закрыть меню':'Открыть меню');
});
document.addEventListener('click',event=>{
  for(const menu of document.querySelectorAll('.s-menu[open]')){
    if(!menu.contains(event.target)||event.target.closest('a'))menu.open=false;
  }
  const dialog=document.querySelector('#studio-privacy');
  if(event.target.closest('.s-privacy'))dialog?.showModal();
  if(event.target.closest('[data-close]'))dialog?.close();
  if(event.target===dialog){
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  }
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  for(const menu of document.querySelectorAll('.s-menu[open]')){
    menu.open=false;menu.querySelector('summary').focus({preventScroll:true});
  }
});

})();
(()=>{

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

})();
(()=>{

// A single review on phones; all three cards stay aligned on larger screens.
const strip=document.querySelector('[data-open-quotes]');
if(strip){
  const track=strip.querySelector('.s-review-grid'),cards=[...track.children];
  const controls=strip.querySelector('.comparison-quote-controls');
  const previous=controls.querySelector('[data-quote-step="-1"]'),next=controls.querySelector('[data-quote-step="1"]');
  const position=controls.querySelector('.comparison-quote-position');
  let queued=false,previousStep=0;
  const step=()=>cards[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||0);
  function update(){
    queued=false;
    if(!track.isConnected||!track.clientWidth)return;
    const size=step(),limit=Math.max(0,track.scrollWidth-track.clientWidth);
    if(!size)return;
    const first=Math.min(cards.length-1,Math.max(0,Math.round(track.scrollLeft/size)));
    const count=Math.max(1,Math.round((track.clientWidth+(parseFloat(getComputedStyle(track).columnGap)||0))/size));
    const last=Math.min(cards.length,first+count);
    controls.hidden=limit<4;
    previous.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=limit-2;
    const label=`${last===first+1?first+1:`${first+1}–${last}`} из ${cards.length}`;
    if(position.textContent!==label)position.textContent=label;
    strip.style.setProperty('--review-progress',String(last/cards.length));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  function move(left){
    track.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.drawingMotion==='off'?'instant':'smooth'});
  }
  for(const button of [previous,next])button.addEventListener('click',()=>move(track.scrollLeft+step()*Number(button.dataset.quoteStep)));
  track.addEventListener('scroll',schedule,{passive:true});
  track.addEventListener('keydown',event=>{
    if(event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();move(event.key==='Home'?0:event.key==='End'?track.scrollWidth:track.scrollLeft+step()*(event.key==='ArrowRight'?1:-1));
  });
  const observer=new ResizeObserver(()=>{
    const size=step();
    if(previousStep&&Math.abs(size-previousStep)>1)track.scrollTo({left:Math.round(track.scrollLeft/previousStep)*size,behavior:'instant'});
    previousStep=size;schedule();
  });
  observer.observe(track);cards.forEach(card=>observer.observe(card));
  document.fonts.ready.then(schedule);update();
}

})();
(()=>{const clamp01=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;

// A drawing finishes while it is comfortably in view, before its caption is read.
function entryProgress(top,height,viewportHeight,toolbarHeight=0){
  if(![top,height,viewportHeight,toolbarHeight].every(Number.isFinite)||viewportHeight<=0)return 0;
  const available=Math.max(0,viewportHeight-Math.max(0,toolbarHeight));
  if(!available)return 0;
  const start=Math.max(0,toolbarHeight)+available*.92;
  const travel=Math.min(200,Math.max(80,height))+available*.16;
  return clamp01((start-top)/travel);
}

function segmentProgress(progress,index,count){
  if(!Number.isInteger(count)||count<1||!Number.isInteger(index)||index<0||index>=count)return 0;
  return clamp01(clamp01(progress)*count-index);
}

function drawingEnabled({reduced=false,choice='on',capture=false}={}){
  return !reduced&&!capture&&choice!=='off';
}

// Overscan keeps every pencil pass beyond the artwork's transparent edges.
function pencilGesture({x,y,width,height},passes=10){
  if(![x,y,width,height].every(Number.isFinite)||width<=0||height<=0||!Number.isInteger(passes)||passes<2||passes>16)throw new RangeError('Invalid pencil gesture bounds');
  const step=height/passes,left=x-width*.12,right=x+width*1.12;
  let d='';
  for(let row=0;row<=passes;row++){
    const start=row%2?right:left,end=row%2?left:right,centre=y+step*row;
    d+=`${row?'L':'M'}${start} ${centre-step*.18}L${end} ${centre+step*.18}`;
  }
  return {d,strokeWidth:step*1.5};
}


const svgNS='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let search=location.search;
try{if(parent!==window)search=parent.location.search;}catch{/* A standalone drawing uses its own preference. */}
const params=new URLSearchParams(search);
const initialChoice=params.get('motion');
let viewport={enabled:drawingEnabled({choice:initialChoice,capture:params.get('capture')==='1'}),frameTop:0,viewportHeight:innerHeight,toolbarHeight:0,near:true};
let active,serial=0,queued=false,viewportReceived=parent===window;
const easing='cubic-bezier(.22,1,.36,1)';
function svgElement(name,attributes){const node=document.createElementNS(svgNS,name);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node;}

const lines=[...document.querySelectorAll('svg[data-ink-line]')].map(svg=>({
  svg,progress:0,started:false,animations:[],
  paths:[...svg.querySelectorAll(':scope>path,[data-ink-stroke],g>path')].map(path=>{
    const marker=path.getAttribute('marker-end'),nonScaling=getComputedStyle(path).vectorEffect==='non-scaling-stroke';
    const strokeWidth=parseFloat(getComputedStyle(path).strokeWidth)||2.2;
    path.setAttribute('pathLength','1');path.style.strokeDasharray='1';
    return {path,marker,nonScaling,strokeWidth};
  }),
}));

// The original pixels stay still while overlapping pencil passes reveal them.
const pictureGroups=new Map();
const pictures=[...document.querySelectorAll('svg[data-chalk-picture],#process svg[data-early-art],#apply svg[data-early-art]')].map(svg=>{
  const image=svg.querySelector('image'),box=svg.viewBox.baseVal;
  if(!image||!box.width||!box.height)return null;
  svg.dataset.chalkPicture='';
  const group=svg.closest('section')??svg.parentElement,index=pictureGroups.get(group)??0;
  pictureGroups.set(group,index+1);
  const id=`chalk-gesture-${++serial}`,gesture=pencilGesture(box);
  const path=svgElement('path',{d:gesture.d,fill:'none',stroke:'white','stroke-width':gesture.strokeWidth,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1});
  const mask=svgElement('mask',{id,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height});
  mask.append(path);
  let defs=svg.querySelector('defs');if(!defs){defs=svgElement('defs',{});svg.prepend(defs);}defs.append(mask);
  return {svg,image,path,id,index,started:false,animation:null};
}).filter(Boolean);

function finishLine(line,remember=true){
  line.animations.forEach(animation=>animation.cancel());line.animations=[];
  for(const {path,marker} of line.paths){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.vectorEffect='';path.style.strokeWidth='';if(marker)path.setAttribute('marker-end',marker);}
  if(remember){line.progress=1;line.started=true;}
}
function finishPicture(picture,remember=true){
  picture.animation?.cancel();picture.animation=null;
  picture.path.style.strokeDashoffset='0';picture.image.removeAttribute('mask');
  if(remember)picture.started=true;
}
function setActive(next){
  if(active===next)return;
  active=next;
  document.documentElement.dataset.drawingMotion=active?'on':'off';
  for(const line of lines){
    if(!active){finishLine(line,false);continue;}
    if(parent===window&&!line.started){
      const bounds=line.svg.getBoundingClientRect();
      const openingUnderline=line.svg.classList.contains('hero-underline')&&scrollY<80;
      if(bounds.top<innerHeight&&bounds.bottom>0&&!openingUnderline){finishLine(line);continue;}
    }
    const pending=line.svg.dataset.inkLine==='scroll'?line.progress<1:!line.started;
    if(pending)for(const {path,marker} of line.paths){path.style.strokeDasharray='1';path.style.strokeDashoffset='1';if(marker)path.removeAttribute('marker-end');}
  }
  for(const picture of pictures){
    if(!active){finishPicture(picture,false);continue;}
    if(parent===window&&!picture.started){
      const bounds=picture.svg.getBoundingClientRect();
      if(bounds.top<innerHeight&&bounds.bottom>0){finishPicture(picture);continue;}
    }
    if(!picture.started&&picture.path.animate){picture.path.style.strokeDasharray='1';picture.path.style.strokeDashoffset='1';picture.image.setAttribute('mask',`url(#${picture.id})`);}
  }
  document.dispatchEvent(new CustomEvent('drawing:motion',{detail:{enabled:active}}));
}
function revealLine(line){
  line.started=true;line.progress=1;
  const circle=line.svg.classList.contains('early-price-ring');
  const circleIndex=circle?[...line.svg.parentElement.parentElement.children].indexOf(line.svg.parentElement):0;
  line.paths.forEach(({path},index)=>{
    path.style.strokeDashoffset='0';
    if(!path.animate)return;
    const animation=path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:circle?1500:1100,delay:circleIndex*130+index*100,easing,fill:'backwards'});
    animation.onfinish=()=>{path.style.strokeDasharray='none';line.animations=line.animations.filter(item=>item!==animation);};
    line.animations.push(animation);
  });
}
function render(){
  setActive(viewportReceived&&viewport.enabled&&!reduced.matches);
  if(!active||!viewport.near||document.hidden)return;
  const progressFor=element=>{
    const bounds=element.getBoundingClientRect();
    return bounds.width&&bounds.height?entryProgress(viewport.frameTop+bounds.top,bounds.height,viewport.viewportHeight,viewport.toolbarHeight):0;
  };
  for(const line of lines){
    if(line.started&&line.progress>=1)continue;
    const progress=progressFor(line.svg);
    if(line.svg.dataset.inkLine!=='scroll'){
      if(progress>0&&!line.started)revealLine(line);
      continue;
    }
    line.progress=Math.max(line.progress,progress);
    line.paths.forEach(({path,marker,nonScaling,strokeWidth},index)=>{
      const part=segmentProgress(line.progress,index,line.paths.length);
      if(part>=1){
        path.style.strokeDasharray='none';path.style.strokeDashoffset='0';
        path.style.vectorEffect='';path.style.strokeWidth='';
        if(marker)path.setAttribute('marker-end',marker);
        return;
      }
      // Normalized dashes and non-scaling strokes use different coordinate spaces.
      // Compensate the width while tracing, then return to the original solid stroke.
      if(nonScaling){
        const matrix=path.getScreenCTM();
        const scale=matrix?Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c)):1;
        if(scale>0){path.style.vectorEffect='none';path.style.strokeWidth=String(strokeWidth/scale);}
      }
      path.style.strokeDasharray='1';
      path.style.strokeDashoffset=String(1-part);
      if(marker)path.removeAttribute('marker-end');
    });
  }
  for(const picture of pictures){
    if(picture.started||progressFor(picture.svg)<=.05)continue;
    const bounds=picture.svg.getBoundingClientRect();
    if(viewport.frameTop+bounds.bottom<viewport.toolbarHeight||!picture.path.animate){finishPicture(picture);continue;}
    picture.started=true;picture.path.style.strokeDashoffset='0';
    const small=bounds.width<100;
    picture.animation=picture.path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:small?760:1120,delay:Math.min(picture.index*70,210),easing,fill:'backwards'});
    picture.animation.onfinish=()=>{picture.image.removeAttribute('mask');picture.animation=null;};
  }
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;render();});}}
document.addEventListener('drawing:viewport',event=>{viewportReceived=true;viewport=event.detail;schedule();});
reduced.addEventListener('change',schedule);
document.addEventListener('visibilitychange',schedule);
if(parent===window){
  const standalone=()=>{viewport={...viewport,viewportHeight:innerHeight};schedule();};
  addEventListener('scroll',standalone,{passive:true});addEventListener('resize',standalone);
  addEventListener('pageshow',standalone);
}
// Until the parent controller is ready, leave complete static drawings visible.
setActive(viewportReceived&&viewport.enabled&&!reduced.matches);
if(parent===window)render();
else try{parent.document.dispatchEvent(new Event('site:layout'));}catch{/* Standalone cross-origin previews need no parent notification. */}

})();
(()=>{

// The selected final site is one document: native anchors, one font/layout pass.
for(const root of document.querySelectorAll('[data-block-document]'))root.dataset.drawingMotion=document.documentElement.dataset.drawingMotion;
document.addEventListener('drawing:motion',event=>{
  for(const root of document.querySelectorAll('[data-block-document]'))root.dataset.drawingMotion=event.detail.enabled?'on':'off';
});
document.documentElement.dataset.siteReady='true';
for(const image of document.querySelectorAll('.photo-window img,.s-photo-mask img')){
  const reveal=()=>{delete image.dataset.imagePending;image.dataset.imageReady='true';};
  if(image.complete)reveal();
  else{
    image.dataset.imagePending='true';
    image.addEventListener('load',()=>{if(image.decode)image.decode().catch(()=>{}).then(reveal);else reveal();},{once:true});
    image.addEventListener('error',reveal,{once:true});
  }
}

})();
(()=>{

// A small, shareable comparison of this section only; other blocks stay fixed.
const pricingStudy=document.querySelector('[data-pricing-studies]');
if(pricingStudy){
  const tabs=[...pricingStudy.querySelectorAll('[data-pricing-choice]')];
  const panels=[...pricingStudy.querySelectorAll('[data-pricing-panel]')];
  const name=pricingStudy.querySelector('[data-pricing-title]');
  function choosePricing(value,{focus=false,share=false}={}){
    const selected=tabs.find(tab=>tab.dataset.pricingChoice===String(value))??tabs[0];
    const choice=selected.dataset.pricingChoice;
    for(const tab of tabs){
      const current=tab===selected;
      tab.setAttribute('aria-selected',String(current));
      tab.tabIndex=current?0:-1;
    }
    for(const panel of panels)panel.hidden=panel.dataset.pricingPanel!==choice;
    pricingStudy.dataset.pricingDesign=choice;
    if(name)name.textContent=selected.dataset.pricingName;
    if(focus)selected.focus({preventScroll:true});
    if(share){
      const url=new URL(location.href);
      url.searchParams.set('pricing',choice);
      history.replaceState(null,'',url);
    }
    // Newly visible pencil drawings join the existing viewport animation pass.
    dispatchEvent(new Event('resize'));
  }
  pricingStudy.addEventListener('click',event=>{
    const tab=event.target.closest('[data-pricing-choice]');
    if(tab&&pricingStudy.contains(tab))choosePricing(tab.dataset.pricingChoice,{share:true});
  });
  pricingStudy.addEventListener('keydown',event=>{
    const tab=event.target.closest('[data-pricing-choice]');
    if(!tab)return;
    const index=tabs.indexOf(tab);
    let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next===undefined)return;
    event.preventDefault();
    choosePricing(tabs[next].dataset.pricingChoice,{focus:true,share:true});
  });
  const restore=()=>choosePricing(new URLSearchParams(location.search).get('pricing'));
  addEventListener('popstate',restore);
  restore();
}

})();
(()=>{

// Compare three treatments of the same reviews, preserving the current slide.
const reviewStudy=document.querySelector('[data-review-studies]');
if(reviewStudy){
 const tabs=[...reviewStudy.querySelectorAll('[data-review-choice]')];
 const title=reviewStudy.querySelector('[data-review-title]');
 const panel=reviewStudy.querySelector('#review-style-panel');
 function chooseReview(value,{focus=false,share=false}={}){
  const chosen=tabs.find(tab=>tab.dataset.reviewChoice===String(value))??tabs[0];
  for(const tab of tabs){const active=tab===chosen;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  reviewStudy.dataset.reviewDesign=chosen.dataset.reviewChoice;
  title.textContent=chosen.dataset.reviewName;
  panel.setAttribute('aria-labelledby',chosen.id);
  if(focus)chosen.focus({preventScroll:true});
  if(share){const url=new URL(location.href);url.searchParams.set('reviews',chosen.dataset.reviewChoice);history.replaceState(null,'',url);}
 }
 reviewStudy.addEventListener('click',event=>{const tab=event.target.closest('[data-review-choice]');if(tab&&reviewStudy.contains(tab))chooseReview(tab.dataset.reviewChoice,{share:true});});
 reviewStudy.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-review-choice]');if(!tab)return;
  const index=tabs.indexOf(tab);
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index-1+tabs.length)%tabs.length:undefined;
  if(next===undefined)return;event.preventDefault();chooseReview(tabs[next].dataset.reviewChoice,{focus:true,share:true});
 });
 const restore=()=>chooseReview(new URLSearchParams(location.search).get('reviews'));
 addEventListener('popstate',restore);restore();
}

})();
(()=>{

// Independent visual choices share the same form fields and footer links.
for(const study of document.querySelectorAll('[data-ending-study]')){
 const kind=study.dataset.endingStudy;
 const tabs=[...study.querySelectorAll('[data-ending-choice]')];
 const title=study.querySelector('[data-ending-title]');
 const panel=study.querySelector(`#${kind}-study-panel`);
 function chooseEnding(value,{focus=false,share=false}={}){
  const selected=tabs.find(tab=>tab.dataset.endingChoice===String(value))??tabs[0];
  for(const tab of tabs){const active=tab===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  study.dataset.endingDesign=selected.dataset.endingChoice;
  title.textContent=selected.dataset.endingName;
  panel.setAttribute('aria-labelledby',selected.id);
  if(focus)selected.focus({preventScroll:true});
  if(share){const url=new URL(location.href);url.searchParams.set(kind,selected.dataset.endingChoice);history.replaceState(null,'',url);}
  dispatchEvent(new Event('resize'));
 }
 study.addEventListener('click',event=>{const tab=event.target.closest('[data-ending-choice]');if(tab&&study.contains(tab))chooseEnding(tab.dataset.endingChoice,{share:true});});
 study.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-ending-choice]');if(!tab)return;
  const index=tabs.indexOf(tab),last=tabs.length-1;
  const next=event.key==='Home'?0:event.key==='End'?last:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+last)%tabs.length:undefined;
  if(next===undefined)return;event.preventDefault();chooseEnding(tabs[next].dataset.endingChoice,{focus:true,share:true});
 });
 const restore=()=>chooseEnding(new URLSearchParams(location.search).get(kind));
 addEventListener('popstate',restore);restore();
}

})();
(function bindRequestUi(formatRequest,manageDialog=true) {
  function fitDraft(output) {
    output.style.height='auto';
    const limit=Math.max(220,Math.min(520,window.innerHeight*.65));
    output.style.height=Math.min(limit,Math.max(220,output.scrollHeight+2))+'px';
  }
  window.addEventListener('resize',()=>{
    document.querySelectorAll('.s-draft:not([hidden]) textarea').forEach(fitDraft);
  });
  document.querySelectorAll('.s-consult-form [type=submit]').forEach(button => { button.disabled = false; });
  document.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if(manageDialog&&button?.matches('.s-privacy'))document.querySelector('#studio-privacy').showModal();
    if(manageDialog&&button?.matches('[data-close]'))button.closest('dialog').close();
    if(button?.matches('.s-copy')){const form=button.closest('form'),output=form.elements.namedItem('draft'),status=form.querySelector('[role=status]');try{await navigator.clipboard.writeText(output.value);status.textContent='Текст скопирован.';}catch{output.focus();output.select();status.textContent='Скопируйте выделенный текст вручную.';}}
    if(event.target.matches('#studio-privacy')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}
  });
  document.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('.s-consult-form'))return;event.preventDefault();
    const name=form.elements.namedItem('name'),contact=form.elements.namedItem('contact'),message=form.elements.namedItem('message');
    name.setCustomValidity(name.value.trim()?'':'Укажите ваше имя.');contact.setCustomValidity(contact.value.trim().length>=3?'':'Укажите телефон или Telegram для связи.');
    if(!form.reportValidity())return;
    const text=formatRequest({name:name.value,contact:contact.value,message:message.value});
    if(form.dataset.requestFlow==='telegram'){
      const destination=new URL('https://t.me/inyfid');
      destination.searchParams.set('text',text);
      window.open(destination.href,'_blank','noopener,noreferrer');
      return;
    }
    form.elements.namedItem('draft').value=text;
    const draft=form.querySelector('.s-draft');draft.hidden=false;fitDraft(form.elements.namedItem('draft'));form.querySelector('[role=status]').textContent='Заявка подготовлена. Отправьте её Анастасии самостоятельно.';
    const prepared=new CustomEvent('request:draft',{bubbles:true,cancelable:true});
    if(form.dispatchEvent(prepared))draft.scrollIntoView({block:'nearest',behavior:'instant'});
  });
  document.addEventListener('input',event=>{const form=event.target.closest('.s-consult-form');if(!form||event.target.name==='draft')return;const draft=form.querySelector('.s-draft');if(draft)draft.hidden=true;form.querySelector('[role=status]').textContent='';form.elements.namedItem('name').setCustomValidity('');form.elements.namedItem('contact').setCustomValidity('');});
})(function formatRequest({name,contact,message}) {
  const lines=['Здравствуйте, Анастасия!','',`Меня зовут ${name.trim()}.`,`Связаться со мной: ${contact.trim()}.`];
  if(message.trim())lines.push('','О нашей семье:',message.trim());
  return lines.join('\n');
},false);