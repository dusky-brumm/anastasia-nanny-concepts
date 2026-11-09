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
  if(svg.hasAttribute('data-service-drawing'))return null;
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
(()=>{// Coordinates follow the existing artwork, normalized to a 1000 × 1000 square.
// Each part traces its contour before short pencil passes reveal its texture.
const part=(name,at,duration,outline,region,width=16,blank=null)=>({name,at,duration,outline,region,width,blank});
const serviceDrawingPlans={
  profile:[
    part('back-paper',0,620,'M230 745L970 380L800 980L170 925L230 745','M230 745L780 365L985 390L810 1000L155 945Z',20),
    part('paper',240,1000,'M30 740L120 105L800 20L690 745L30 740','M0 770L110 80L820 0L710 770Z M210 115L650 115L650 495L210 495Z M130 510H590V655H130Z',18,'M210 115H650V495H210Z M130 510H590V655H130Z'),
    part('portrait',1090,1050,'M230 460Q270 400 350 400L390 335Q330 310 330 240Q310 170 385 145Q450 90 520 150Q575 165 570 230L590 270L560 290Q565 345 510 345L490 395L590 460 M335 270Q265 310 285 235Q245 200 305 190 M345 230Q420 245 510 160','M205 100H665V505H205Z',16),
    part('profile-lines',2070,480,'M155 565Q265 520 355 555T545 550 M155 630Q270 595 365 620T535 615','M125 505H600V665H125Z',22),
    part('check',2440,350,'M825 260L865 305L970 175','M790 160H1000V340H790Z',30),
  ],
  book:[
    part('book-binding',0,650,'M25 330L90 940Q280 820 470 840Q640 760 885 700L785 50 M45 285L115 900Q310 790 475 815Q650 735 870 670','M0 270L85 970L470 865L915 715L805 10L765 15L850 650L470 785L120 865L65 260Z',17),
    part('blank-pages',280,1150,'M60 260Q250 70 400 205L475 785Q300 670 140 865L60 260 M400 205Q545 100 760 30L850 640Q620 670 475 785 M405 225L468 750','M45 250Q250 70 405 190Q560 90 785 0L885 670Q610 710 475 835Q295 740 110 920Z M455 285L750 190L815 570L525 680Z',14,'M455 285L750 190L815 570L525 680Z'),
    part('book-notes',1400,700,'M475 350Q565 275 640 280L720 235 M490 465Q575 395 650 400L730 360','M450 250L770 160L795 455L490 570Z',22),
    part('book-check',2030,340,'M707 520L737 555L775 445','M675 430H805V600H675Z',25),
    part('pencil',2280,650,'M590 985L958 665Q995 620 975 665L625 975L590 985 M620 950L938 680 M650 960L962 700','M565 1000L610 900L925 630Q985 590 1000 665L1000 740L655 1000Z',16),
  ],
  interview:[
    part('table',0,820,'M278 540Q490 515 704 545L698 590Q500 640 280 595 M482 625L475 825Q465 920 405 955L580 955Q522 920 512 825L514 625','M265 520L710 520L720 610L550 640L552 825L610 975L390 995L390 940L455 815L460 640L265 615Z',15),
    part('left-chair',210,900,'M111 490Q20 425 10 520Q5 590 75 820L250 850 M35 535L110 815 M100 870L80 980 M270 860L298 985','M0 455H110L130 625L115 675L155 805L285 810L315 1000H270L250 900L110 895L95 1000H55L75 865L0 585Z',20),
    part('right-chair',440,880,'M910 490Q1020 420 990 565L904 860L705 875 M961 560L880 820 M890 890L930 980 M705 890L680 980','M905 455H1000V610L930 850L905 890L955 1000H905L875 915H725L705 1000H650L680 865L820 795L870 640L905 610Z',20),
    part('interviewer',1250,1300,'M165 260Q130 210 145 130Q155 20 235 20Q325 15 335 120L335 215L295 265L275 310 M170 155Q230 185 310 80 M160 295Q110 345 110 545L155 640L275 620L298 500L370 480L410 450L445 475 M155 640L120 790L300 860L410 980L455 930L385 690L280 620 M150 700L340 755 M145 750L360 800','M115 0H350V285L305 300L320 405L380 420L435 390L475 460L465 535L370 580L310 590L285 625L400 645L485 940L420 1000H300L270 875L110 835L95 625L105 545L95 430L135 280L110 230Z',14),
    part('nanny',1700,1300,'M655 265Q615 215 640 130Q630 20 730 20Q815 15 845 105Q890 155 850 240L815 270 M665 80Q740 205 820 145 M750 295Q850 280 890 510L895 610L795 635L660 610L605 570L610 480L650 325L680 285 M795 635L855 690L800 865L680 880L645 970L550 960L545 900L610 680L680 625 M625 735L575 920 M780 710L690 830','M625 0H855L900 145L875 255L835 285L915 445L920 635L860 660L895 700L830 890L690 905L665 1000H530L515 915L550 795L600 660L645 630L575 595L565 490L605 365L635 290L600 230L600 130Z',14),
    part('interview-notes',2770,300,'M350 530L425 450L460 465L430 535Z M350 405L385 480','M330 380H475V550H330Z',13),
  ],
};

function serviceDrawingDelay(index){return 500+Math.max(0,index)*500;}

// A continuous, close-set zigzag keeps the original dry-pencil pixels intact.
function serviceHatching(spacing=24){
  let d='';
  for(let row=0;row<=Math.ceil(1080/spacing);row++){
    const y=-40+row*spacing,left=row%2?1040:-40,right=row%2?-40:1040;
    d+=`${row?'L':'M'}${left} ${y-5}L${right} ${y+5}`;
  }
  return d;
}


// One drawing per visit. The ordinary artwork and text are the no-JS fallback.
const namespace='http://www.w3.org/2000/svg';
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const node=(name,attributes)=>{const element=document.createElementNS(namespace,name);for(const [key,value] of Object.entries(attributes))element.setAttribute(key,String(value));return element;};
let sequence=0,enabled=false,queued=false;
let frame={frameTop:0,viewportHeight:innerHeight,toolbarHeight:0,near:true};
const drawings=[...document.querySelectorAll('#service [data-service-drawing]')].map(svg=>{
  const plan=serviceDrawingPlans[svg.dataset.serviceDrawing],image=svg.querySelector('image');
  const card=svg.closest('.study'),caption=card?.querySelector('.study-caption'),box=svg.viewBox.baseVal;
  if(!plan||!image||!caption||!image.animate)return null;
  const id=`service-pencil-${++sequence}`,defs=node('defs',{});
  const mask=node('mask',{id,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height,style:'mask-type:alpha'});
  const group=node('g',{transform:`translate(${box.x} ${box.y}) scale(${box.width/1000} ${box.height/1000})`});
  const strokes=[],paper=[];
  for(const [index,part] of plan.entries()){
    const clipId=`${id}-part-${index}`,clip=node('clipPath',{id:clipId,clipPathUnits:'userSpaceOnUse'});
    clip.append(node('path',{d:part.region,'clip-rule':'evenodd'}));defs.append(clip);
    const layer=node('g',{'clip-path':`url(#${clipId})`});
    for(const [hatch,d,width,at,duration] of [
      [false,part.outline,part.width,part.at,part.duration*.62],
      [true,serviceHatching(),32,part.at+part.duration*.36,part.duration*.64],
    ]){
      const path=node('path',{d,fill:'none',stroke:'white','stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1});
      layer.append(path);strokes.push({path,at,duration,hatch});
    }
    group.append(layer);
    if(part.blank){
      const sheet=node('path',{d:part.blank,fill:'#faf8f2',opacity:0,transform:group.getAttribute('transform')});
      svg.insertBefore(sheet,image);paper.push({sheet,at:part.at+200});
    }
  }
  // A final fine pass catches edge grain between the hand-traced parts.
  const last=Math.max(...plan.map(part=>part.at+part.duration));
  const grain=node('path',{d:serviceHatching(18),fill:'none',stroke:'white','stroke-width':26,'stroke-linecap':'round',pathLength:1});
  group.append(grain);strokes.push({path:grain,at:last-100,duration:350,hatch:true});
  mask.append(group);defs.append(mask);svg.prepend(defs);
  return {svg,image,card,caption,id,strokes,paper,animations:[],started:false};
}).filter(Boolean);

function finish(drawing){
  drawing.started=true;
  drawing.image.removeAttribute('mask');
  drawing.caption.style.opacity='';drawing.caption.style.transform='';
  drawing.card.dataset.serviceDrawingState='complete';
  for(const animation of drawing.animations){animation.onfinish=null;animation.cancel();}
  drawing.animations=[];
}
function prepare(drawing){
  if(drawing.started)return;
  for(const {path} of drawing.strokes){path.style.strokeDasharray='1';path.style.strokeDashoffset='1';}
  drawing.image.setAttribute('mask',`url(#${drawing.id})`);
  drawing.caption.style.opacity='0';
  drawing.card.dataset.serviceDrawingState='waiting';
}
function start(drawing,delay){
  drawing.started=true;drawing.card.dataset.serviceDrawingState='drawing';
  for(const {path,at,duration,hatch} of drawing.strokes){
    drawing.animations.push(path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{
      delay:delay+at,duration,easing:hatch?'linear':'cubic-bezier(.4,0,.3,1)',fill:'forwards',
    }));
  }
  const finalStroke=drawing.animations.at(-1);
  for(const {sheet,at} of drawing.paper)drawing.animations.push(sheet.animate([{opacity:0},{opacity:1}],{delay:delay+at,duration:320,fill:'forwards'}));
  drawing.animations.push(drawing.caption.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{
    delay:delay+500,duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'both',
  }));
  // The final stroke owns cleanup; scrolling never restarts a completed picture.
  finalStroke.onfinish=()=>finish(drawing);
}
function render(){
  queued=false;if(!enabled||document.hidden||!frame.near)return;
  const visible=[];
  for(const drawing of drawings){
    if(drawing.started)continue;
    const bounds=drawing.svg.getBoundingClientRect(),top=frame.frameTop+bounds.top,bottom=frame.frameTop+bounds.bottom;
    if(!bounds.width||!bounds.height)continue;
    if(bottom<=frame.toolbarHeight){finish(drawing);continue;}
    if(top<frame.viewportHeight*.88&&bottom>frame.toolbarHeight)visible.push(drawing);
  }
  // Desktop cards share one stagger; narrow layouts wait for each actual entry.
  visible.forEach((drawing,index)=>start(drawing,serviceDrawingDelay(index)));
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
function setEnabled(next){
  enabled=next&&!preference.matches;
  for(const drawing of drawings){if(enabled)prepare(drawing);else finish(drawing);}
  schedule();
}
document.addEventListener('drawing:motion',event=>setEnabled(event.detail.enabled));
document.addEventListener('drawing:viewport',event=>{frame=event.detail;schedule();});
document.addEventListener('visibilitychange',schedule);
preference.addEventListener('change',()=>setEnabled(document.documentElement.dataset.drawingMotion==='on'));
if(parent===window){
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{frame.viewportHeight=innerHeight;schedule();});
  addEventListener('pageshow',schedule);
}
setEnabled(document.documentElement.dataset.drawingMotion==='on');

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

// The sticky wrapper stays in normal flow; only its measured anchor offset changes.
const headerDocument=document.querySelector('[data-block-document="header"]');
const stickyHeader=headerDocument?.querySelector('#header');
if(stickyHeader){
 const links=[...stickyHeader.querySelectorAll('.s-nav a[href^="#"]')];
 const sections=['hero','service','about','process','pricing','reviews','apply','footer']
  .map(id=>document.getElementById(id)).filter(Boolean);
 let queued=false,previousId,previousHeight=0;
 function update(){
  queued=false;
  const height=Math.ceil(stickyHeader.getBoundingClientRect().height);
  if(height!==previousHeight){
   previousHeight=height;
   document.documentElement.style.setProperty('--site-header-height',height+'px');
  }
  headerDocument.dataset.headerScrolled=String(scrollY>8);
  const line=height+Math.min(160,innerHeight*.2);
  let currentId;
  for(const section of sections){
   if(section.getBoundingClientRect().top>line)break;
   currentId=section.id;
  }
  if(currentId===previousId)return;
  previousId=currentId;
  for(const link of links){
   if(link.getAttribute('href')==='#'+currentId)link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  }
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 addEventListener('hashchange',schedule);
 addEventListener('pageshow',schedule);
 new ResizeObserver(schedule).observe(stickyHeader);
 schedule();
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
  const selected=tabs.find(tab=>tab.dataset.endingChoice===String(value))??tabs.find(tab=>tab.dataset.endingChoice===study.dataset.endingDefault)??tabs[0];
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

// Compare only the drawing; keep the same form and its entered values.
const consultation=document.querySelector('#apply[data-consultation-art]');
if(consultation){
 const choices=[...consultation.querySelectorAll('[data-consultation-choice]')];
 function chooseDrawing(value){
  const selected=choices.find(button=>button.dataset.consultationChoice===String(value))??choices[0];
  consultation.dataset.consultationArt=selected.dataset.consultationChoice;
  for(const button of choices)button.setAttribute('aria-pressed',String(button===selected));
 }
 consultation.addEventListener('click',event=>{
  const button=event.target.closest('[data-consultation-choice]');
  if(!button||!consultation.contains(button))return;
  chooseDrawing(button.dataset.consultationChoice);
  const url=new URL(location.href);
  url.searchParams.set('tea',button.dataset.consultationChoice);
  history.replaceState(null,'',url);
 });
 const restoreDrawing=()=>chooseDrawing(new URLSearchParams(location.search).get('tea'));
 addEventListener('popstate',restoreDrawing);restoreDrawing();
}

})();
(()=>{

// The drawing treatment changes; the current photograph and story stay in place.
const sceneSection=document.querySelector('[data-about-scenes]');
if(sceneSection){
 const tabs=[...sceneSection.querySelectorAll('[data-scene-choice]')];
 const title=sceneSection.querySelector('[data-scene-title]');
 const panel=sceneSection.querySelector('#about-scene-panel');
 function chooseScene(value,{focus=false,share=false}={}){
  const selected=tabs.find(tab=>tab.dataset.sceneChoice===String(value))??tabs[0];
  for(const tab of tabs){const active=tab===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  sceneSection.dataset.aboutScene=selected.dataset.sceneChoice;
  title.textContent=selected.dataset.sceneName;
  panel.setAttribute('aria-labelledby',selected.id);
  if(focus)selected.focus({preventScroll:true});
  if(share){const url=new URL(location.href);url.searchParams.set('about',selected.dataset.sceneChoice);history.replaceState(null,'',url);}
  dispatchEvent(new Event('resize'));
 }
 sceneSection.addEventListener('click',event=>{const tab=event.target.closest('[data-scene-choice]');if(tab&&sceneSection.contains(tab))chooseScene(tab.dataset.sceneChoice,{share:true});});
 sceneSection.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-scene-choice]');if(!tab)return;
  const index=tabs.indexOf(tab);
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index-1+tabs.length)%tabs.length:undefined;
  if(next===undefined)return;event.preventDefault();chooseScene(tabs[next].dataset.sceneChoice,{focus:true,share:true});
 });
 const restore=()=>chooseScene(new URLSearchParams(location.search).get('about'));
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