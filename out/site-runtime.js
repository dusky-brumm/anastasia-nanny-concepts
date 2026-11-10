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
// Three reviews per desktop page; one readable review per phone page.
const strip=document.querySelector('[data-open-quotes]');
if(strip){
  const track=strip.querySelector('.s-review-grid'),cards=[...track.children];
  const controls=strip.querySelector('.comparison-quote-controls');
  const dotsRoot=controls.querySelector('.review-slider-dots');
  const previous=controls.querySelector('[data-quote-step="-1"]'),next=controls.querySelector('[data-quote-step="1"]');
  const position=controls.querySelector('.review-slider-status');
  let selected=0,destination=null,queued=false,previousStep=0,pageSize=1,pageCount=cards.length;
  const step=()=>cards[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||0);
  const pageStart=page=>page*pageSize;
  const wrap=page=>(page%pageCount+pageCount)%pageCount;
  const range=page=>{
    const first=pageStart(page)+1,last=Math.min(cards.length,first+pageSize-1);
    return first===last?`Отзыв ${first} из ${cards.length}`:`Отзывы ${first}–${last} из ${cards.length}`;
  };
  function navigation(){
    if(dotsRoot.children.length!==pageCount){
      const fragment=document.createDocumentFragment();
      for(let page=0;page<pageCount;page++){
        const dot=document.createElement('button');
        dot.type='button';dot.dataset.quotePage=String(page);dot.setAttribute('aria-controls',track.id);
        fragment.append(dot);
      }
      dotsRoot.replaceChildren(fragment);
    }
    [...dotsRoot.children].forEach((dot,page)=>dot.setAttribute('aria-label',`Показать ${range(page).toLowerCase()}`));
    previous.setAttribute('aria-label',pageSize===1?'Предыдущий отзыв':'Предыдущая страница отзывов');
    next.setAttribute('aria-label',pageSize===1?'Следующий отзыв':'Следующая страница отзывов');
    controls.hidden=pageCount<2;
    cards.forEach((card,index)=>card.style.scrollSnapAlign=index%pageSize===0?'start':'none');
  }
  function show(page){
    selected=page;
    [...dotsRoot.children].forEach((dot,index)=>{
      if(index===page)dot.setAttribute('aria-current','true');
      else dot.removeAttribute('aria-current');
    });
    const first=pageStart(page),last=first+pageSize;
    cards.forEach((card,index)=>{
      if(index>=first&&index<last)card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden','true');
    });
    const label=range(page);
    if(position.textContent!==label)position.textContent=label;
  }
  function update(){
    queued=false;
    const size=step();
    if(!track.isConnected||!track.clientWidth||!size)return;
    if(destination!==null){
      const target=Math.min(pageStart(destination)*size,Math.max(0,track.scrollWidth-track.clientWidth));
      if(Math.abs(track.scrollLeft-target)>2)return;
      destination=null;
    }
    show(Math.min(pageCount-1,Math.max(0,Math.round(track.scrollLeft/(size*pageSize)))));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  function move(page){
    destination=wrap(page);show(destination);
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.drawingMotion==='off';
    track.scrollTo({left:pageStart(destination)*step(),behavior:reduce?'instant':'smooth'});
    schedule();
  }
  function layout(){
    const size=step(),gap=parseFloat(getComputedStyle(track).columnGap)||0;
    if(!size||!track.clientWidth)return;
    const count=Math.max(1,Math.min(cards.length,Math.round((track.clientWidth+gap)/size)));
    const anchor=pageStart(selected),changed=count!==pageSize;
    pageSize=count;pageCount=Math.ceil(cards.length/pageSize);
    selected=Math.min(pageCount-1,Math.floor(anchor/pageSize));
    navigation();
    if(changed||previousStep&&Math.abs(size-previousStep)>1){
      destination=null;track.scrollTo({left:pageStart(selected)*size,behavior:'instant'});
    }
    previousStep=size;show(selected);schedule();
  }
  cards.forEach((card,index)=>{
    card.setAttribute('role','group');card.setAttribute('aria-roledescription','отзыв');
    card.setAttribute('aria-label',`${index+1} из ${cards.length}`);
  });
  for(const button of [previous,next])button.addEventListener('click',()=>move(selected+Number(button.dataset.quoteStep)));
  dotsRoot.addEventListener('click',event=>{
    const dot=event.target.closest('[data-quote-page]');
    if(dot&&dotsRoot.contains(dot))move(Number(dot.dataset.quotePage));
  });
  track.addEventListener('scroll',schedule,{passive:true});
  for(const event of ['pointerdown','wheel'])track.addEventListener(event,()=>{destination=null;},{passive:true});
  track.addEventListener('keydown',event=>{
    if(event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();move(event.key==='Home'?0:event.key==='End'?pageCount-1:selected+(event.key==='ArrowRight'?1:-1));
  });
  const observer=new ResizeObserver(layout);
  observer.observe(track);cards.forEach(card=>observer.observe(card));
  document.fonts.ready.then(layout);layout();
}

})();
(()=>{const clamp01=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;

// Re-arm only after a visited block has fully cleared the screen, with a small
// margin so its transparent edges and the sticky header cannot cause flicker.
function drawingReplayState(wasVisible,top,height,viewportHeight,toolbarHeight=0){
  const visible=Boolean(wasVisible);
  if(![top,height,viewportHeight,toolbarHeight].every(Number.isFinite)||height<=0||viewportHeight<=toolbarHeight)return {visible,reset:false};
  const edge=Math.max(0,toolbarHeight),bottom=top+height;
  if(bottom>edge&&top<viewportHeight)return {visible:true,reset:false};
  if(bottom<=edge-32||top>=viewportHeight+32)return {visible:false,reset:visible};
  return {visible,reset:false};
}

// The same amount of visible artwork starts a pass from either scroll direction.
function drawingInView(top,height,viewportHeight,toolbarHeight=0){
  if(![top,height,viewportHeight,toolbarHeight].every(Number.isFinite)||height<=0||viewportHeight<=toolbarHeight)return false;
  const edge=Math.max(0,toolbarHeight),part=Math.min(height*.35,(viewportHeight-edge)*.12);
  return top+height>edge+part&&top<viewportHeight-part;
}

// Position alone controls the chalk patches: pausing scroll pauses every change.
function pricingPatchState(top,height,viewportHeight,index=0,toolbarHeight=0){
  if(![top,height,viewportHeight,index,toolbarHeight].every(Number.isFinite)||height<=0||viewportHeight<=toolbarHeight)return null;
  const available=viewportHeight-Math.max(0,toolbarHeight);
  const progress=clamp01((toolbarHeight+available*.94-top)/Math.min(available*.46,height+available*.1));
  const eased=progress*progress*(3-2*progress);
  const phase=(toolbarHeight+available*.65-top)/Math.max(height,available*.55);
  return {scale:.28+.72*eased,radius:38+38*eased,
    x:Math.sin(phase*2.8+index*1.3)*2*eased,
    y:Math.sin(phase*2.1+index*.9)*1.4*eased,
    angle:Math.sin(phase*3+index*1.2)*1.1*eased};
}

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

// Shared timing and pencil passes use normalized 1000 × 1000 coordinates.
const drawingTiming={contour:.25,background:.43,details:.32};
function pencilDuration(kind){
  const serviceDuration={profile:3040,book:3180,interview:3320}[kind];
  const duration=(serviceDuration??3180)/3;
  return serviceDuration?duration*.65:duration;
}
const servicePictureDelay=index=>Math.max(0,index)*20;
const nextServiceDelay=(now,lastStart=-Infinity)=>Math.max(0,lastStart+20-now);
const point=(x,y)=>`${Math.round(x)} ${Math.round(y)}`;

function rows(spacing){
  let d='';
  for(let row=0,y=-250;y<=1250;row++,y+=spacing){
    const reverse=row%2!==0;
    const x=reverse?1250:-250,end=reverse?-250:1250;
    d+=`${row?'L':'M'}${point(x,y-7)}L${point(end,y+7)}`;
  }
  return d;
}

function pencilPasses(details=false){
  return [
    {d:rows(details?45:70),width:details?29:46,angle:-25,start:0,end:.76},
    {d:rows(details?45:70),width:details?64:97,angle:-25,start:.56,end:1},
  ];
}

const pencilArtwork={"07-service-interview.webp":{"contours":["M278 540Q490 515 704 545L698 590Q500 640 280 595 M482 625L475 825Q465 920 405 955L580 955Q522 920 512 825L514 625","M111 490Q20 425 10 520Q5 590 75 820L250 850 M35 535L110 815 M100 870L80 980 M270 860L298 985","M910 490Q1020 420 990 565L904 860L705 875 M961 560L880 820 M890 890L930 980 M705 890L680 980","M165 260Q130 210 145 130Q155 20 235 20Q325 15 335 120L335 215L295 265L275 310 M170 155Q230 185 310 80 M160 295Q110 345 110 545L155 640L275 620L298 500L370 480L410 450L445 475 M155 640L120 790L300 860L410 980L455 930L385 690L280 620 M150 700L340 755 M145 750L360 800","M655 265Q615 215 640 130Q630 20 730 20Q815 15 845 105Q890 155 850 240L815 270 M665 80Q740 205 820 145 M750 295Q850 280 890 510L895 610L795 635L660 610L605 570L610 480L650 325L680 285 M795 635L855 690L800 865L680 880L645 970L550 960L545 900L610 680L680 625 M625 735L575 920 M780 710L690 830"],"size":[512,336],"source_sha256":"8fd7254b7f2473e65c1a13d1386dcd94e56ad2e18e42c933e076ff04a10b6c77","parts":["table","left-chair","right-chair","interviewer","nanny"]},"08-service-recommendation.webp":{"contours":["M766 0L776 0L776 16L797 21L802 94L797 94L792 188L786 188L786 219L781 219L781 250L776 250L776 281L771 281L760 359L844 359L854 370L917 370L917 375L943 375L943 380L958 380L958 385L984 385L984 406L979 406L979 422L974 422L974 443L964 453L964 474L953 484L953 505L948 505L948 526L938 536L938 557L927 568L917 615L901 630L901 651L891 656L891 677L885 677L885 693L880 693L880 708L875 708L875 729L870 729L870 745L859 755L859 781L854 781L854 797L849 797L849 812L844 812L844 839L833 849L833 870L823 875L823 901L818 901L818 917L812 917L812 938L807 938L802 979L792 984L792 1000L781 1000L781 984L656 974L656 969L630 969L630 964L521 958L521 953L484 953L484 948L453 948L453 943L380 938L380 932L359 932L359 927L297 927L281 927L281 922L214 922L214 917L188 917L182 911L193 849L198 849L203 818L219 797L224 750L94 750L94 755L89 750L57 750L57 755L21 750L21 719L16 714L21 714L21 677L26 677L26 641L31 641L31 625L36 625L36 583L42 583L47 505L52 505L52 458L57 458L68 375L73 375L73 354L78 354L83 281L94 271L104 177L109 177L109 156L115 156L115 115L125 104L135 104L135 99L234 83L245 73L297 73L297 68L339 68L339 62L359 62L359 57L417 57L417 52L443 52L443 47L557 42L557 36L604 36L604 31L672 26L672 21L766 16Z"],"size":[375,447],"source_sha256":"eed991a17b970e86f3d14abc9c44192f8e35245156af9cea59b6f1b66acc2542"},"13-step-application.webp":{"contours":["M510 16L557 26L594 62L609 62L646 99L656 99L672 120L682 120L688 130L698 130L708 146L719 146L729 156L776 156L776 151L792 151L792 146L818 146L818 141L844 141L844 135L865 141L870 146L870 188L865 188L865 224L854 234L854 276L875 297L885 297L932 349L943 349L948 365L984 401L984 484L979 484L979 589L984 589L984 641L979 641L979 938L974 938L974 958L964 969L953 969L948 979L870 979L870 984L521 979L286 979L286 984L62 979L62 974L42 969L42 958L31 958L31 948L26 948L26 927L21 927L21 792L16 792L16 781L21 781L21 750L16 750L16 443L21 443L26 417L36 411L36 401L68 370L78 370L78 359L89 349L99 349L109 333L120 333L146 307L156 260L193 255L193 250L208 250L208 245L240 245L307 177L318 177L328 161L339 161L370 125L380 125L411 89L422 89L464 42L474 42L484 26L510 21Z"],"size":[391,363],"source_sha256":"17fd3d0251c9cab3dfff25218cb88a6aa8ef2435cc99c002255a13c6364403e3"},"14-step-nanny-profile.webp":{"contours":["M943 16L969 16L969 21L984 26L984 42L1000 42L1000 68L984 68L984 94L979 94L979 172L974 172L974 203L969 203L969 240L974 240L974 255L969 255L969 682L974 682L969 688L969 729L974 729L974 792L979 792L979 828L984 828L984 906L979 906L974 927L969 932L911 932L911 938L849 938L849 943L771 943L771 948L630 953L630 958L531 958L531 964L469 964L469 969L328 969L328 964L203 969L203 964L172 964L172 969L120 969L120 974L104 974L104 979L62 979L62 984L36 979L31 964L26 964L31 849L26 849L26 792L21 792L21 760L16 760L16 729L21 729L21 688L16 688L16 630L21 630L21 604L16 604L16 573L21 573L16 417L0 417L0 411L16 411L16 385L0 385L0 354L16 354L21 115L26 115L31 94L42 83L62 83L62 78L156 73L156 68L229 62L229 57L375 62L375 68L396 68L396 73L422 73L422 68L552 73L552 68L589 68L589 62L661 62L661 57L734 52L734 47L750 47L750 42L812 42L812 36L849 36L849 31L885 31L885 26L927 26L927 21L943 21Z"],"size":[493,383],"source_sha256":"f77fc26e8dd0702d05ab6ba54c90acb41561e3ade67962823352813d8f95df9b"},"15-step-search-interview.webp":{"contours":["M760 16L802 21L818 36L818 47L828 52L833 78L844 89L844 104L849 104L849 115L859 120L859 130L870 135L870 151L875 151L875 203L896 208L896 219L906 229L906 245L911 245L911 297L906 297L901 318L891 323L891 333L875 349L833 354L833 380L839 380L849 406L859 406L870 422L880 422L885 432L911 443L948 490L948 505L953 505L953 521L958 521L958 536L964 536L964 557L969 557L974 609L979 609L984 682L1000 682L1000 755L979 750L974 688L958 688L958 667L927 667L927 677L906 698L906 724L917 724L911 750L870 792L859 792L854 802L844 802L823 818L818 854L807 859L797 885L781 891L781 896L771 896L766 870L745 870L740 849L729 849L724 823L698 823L693 839L688 833L656 833L651 781L625 781L609 797L609 828L604 828L604 854L599 854L594 901L589 901L589 922L583 922L578 974L573 974L573 984L552 984L552 979L536 979L536 974L521 974L521 969L417 974L401 958L302 958L302 964L281 964L292 911L297 911L307 870L318 859L318 828L307 828L307 802L260 802L255 844L245 849L245 859L219 865L219 875L214 875L214 865L203 865L198 854L167 849L146 828L141 807L130 807L115 792L115 776L99 771L99 729L73 729L73 750L68 750L62 776L57 776L57 786L52 786L36 823L31 823L31 786L0 786L0 740L16 740L21 661L26 661L26 635L31 635L31 615L36 615L47 568L52 568L62 536L73 531L73 521L83 516L83 505L99 495L99 469L104 469L104 453L109 453L109 438L115 438L115 411L68 417L52 401L47 328L42 328L42 312L36 312L42 276L47 276L52 250L68 234L83 234L83 182L89 182L94 156L109 151L109 141L115 141L115 125L120 125L120 109L125 109L125 94L130 94L130 78L141 73L141 62L156 47L167 47L172 36L182 36L188 26L229 26L260 57L260 68L292 94L297 125L318 146L318 167L323 167L323 219L302 219L302 245L307 245L312 276L323 286L318 307L307 312L302 406L292 417L250 417L245 448L240 448L240 490L255 505L255 521L286 547L286 557L297 562L302 589L307 589L333 776L359 776L365 760L411 755L411 750L438 755L453 771L484 771L495 755L521 750L521 745L583 750L583 719L589 719L589 693L594 693L604 604L609 604L609 583L620 578L630 479L635 479L635 458L641 458L651 411L656 411L661 391L672 385L667 302L651 292L651 266L656 266L661 240L667 240L667 203L651 203L651 182L646 182L656 115L661 115L667 89L693 78L693 62L703 57L708 42L734 42Z"],"size":[512,285],"source_sha256":"6ae38dee4f9a7bf5bf87f8d7eabe58447e26f661376e498ef8b9fc8ec4ad1dfe"},"16-step-first-meeting.webp":{"contours":["M302 16L359 16L359 21L401 31L411 42L417 62L432 78L443 78L443 89L453 99L453 125L448 125L448 135L438 146L443 219L427 224L427 240L417 245L406 281L339 276L339 286L323 297L323 328L328 328L328 344L333 344L333 443L339 443L344 469L406 469L427 448L438 448L464 422L469 406L479 406L490 396L531 391L531 385L542 385L542 427L568 427L578 417L604 417L604 396L615 391L615 354L589 349L589 328L615 302L615 286L651 307L667 349L693 349L714 365L714 401L719 406L776 411L797 391L797 380L812 370L812 344L802 344L786 323L786 271L797 266L797 229L792 229L786 203L807 177L833 177L833 172L859 172L859 167L875 167L875 161L896 161L911 177L927 177L943 198L943 214L969 234L974 276L958 297L958 323L948 333L938 333L938 344L932 344L932 375L943 375L958 391L958 422L953 422L953 438L938 453L932 495L917 500L917 573L922 573L922 589L927 589L927 635L911 651L911 667L906 667L901 693L896 693L896 734L901 734L901 771L906 771L906 786L911 786L911 854L917 854L911 932L917 932L917 958L948 958L948 969L979 969L984 964L984 974L901 979L901 984L766 979L766 974L708 979L708 969L755 964L760 938L776 938L776 932L797 927L797 859L797 849L792 849L792 776L786 776L786 755L781 755L781 651L776 651L776 635L750 620L750 583L755 583L755 562L760 562L760 521L734 510L708 484L703 458L688 458L667 443L661 422L635 422L630 432L599 432L594 448L583 448L583 458L573 469L562 469L557 479L547 479L547 484L531 484L531 490L469 484L443 505L443 531L464 536L479 552L484 573L490 573L495 625L490 625L484 661L479 661L479 672L474 672L474 682L458 703L458 719L453 719L453 729L448 729L448 740L443 740L443 750L438 750L438 760L432 760L432 771L427 771L427 781L411 802L411 818L396 839L396 859L385 870L328 865L328 859L302 859L302 854L260 854L255 865L245 865L245 901L255 901L276 922L292 922L292 927L323 938L333 964L344 964L339 974L302 974L302 979L240 979L240 974L125 979L125 974L115 974L115 964L89 964L89 969L62 969L57 964L57 958L83 958L83 953L115 953L115 906L120 906L120 896L135 875L135 849L83 833L57 807L57 797L47 792L47 776L36 766L36 672L26 672L26 651L21 651L16 630L0 630L0 604L16 604L21 573L31 562L42 521L52 510L57 479L62 479L62 469L73 458L73 438L83 432L83 417L89 417L115 354L125 349L135 323L167 297L167 286L177 286L208 255L234 250L234 224L208 224L208 219L182 219L182 229L172 224L172 198L177 198L172 130L177 130L177 120L203 94L240 94L240 68L255 52L255 42L271 36L286 21L302 21Z"],"size":[512,422],"source_sha256":"75ad15e224d71ead2820a5e9a3055f4ced976fb5e74f0bb9b45fb170bf642e37"},"17-step-support.webp":{"contours":["M516 16L557 16L573 31L609 47L615 57L646 62L656 73L688 78L693 89L714 89L714 94L729 94L729 99L750 104L766 120L766 130L781 141L781 151L797 161L797 172L812 177L812 188L823 188L839 208L875 224L880 234L891 234L906 250L906 260L922 271L927 292L938 297L943 323L958 333L969 359L984 375L1000 375L1000 411L984 411L969 432L938 438L938 432L917 432L891 406L870 406L870 401L854 401L844 391L786 396L786 391L771 391L766 380L755 380L745 370L745 359L714 354L703 344L667 344L667 349L656 349L651 359L641 359L630 370L583 375L583 380L557 385L547 401L536 401L536 411L510 432L505 453L479 479L479 495L464 505L464 516L443 531L443 542L427 552L427 562L417 562L396 583L385 583L375 594L333 599L333 604L266 604L240 604L229 615L214 615L208 625L198 625L198 635L188 635L177 646L177 656L167 656L161 677L151 682L146 703L125 724L125 734L120 734L115 755L104 760L99 781L83 792L94 760L104 755L104 740L115 734L115 714L130 693L130 667L125 667L125 651L99 651L99 661L89 661L68 682L73 646L78 646L78 615L62 615L62 609L68 609L68 583L73 583L73 552L78 552L83 521L89 521L94 495L99 495L99 458L73 458L68 479L57 479L52 505L42 505L42 484L57 474L57 458L73 448L73 432L83 427L99 391L115 380L115 370L125 359L135 359L177 318L219 302L234 281L245 281L286 240L297 240L333 198L344 198L349 182L359 182L359 172L380 151L391 151L391 141L406 130L406 120L448 83L448 73L484 36L510 26Z","M698 479L786 484L786 505L781 505L781 516L766 536L750 620L745 620L734 651L724 656L724 667L703 688L646 703L646 708L630 708L609 729L609 745L604 745L594 786L589 786L578 849L573 849L573 906L630 901L635 927L672 927L677 922L677 932L635 943L635 948L625 948L615 958L599 958L599 964L583 964L583 938L557 938L557 943L552 938L510 938L510 943L484 948L484 953L458 964L448 969L448 953L464 948L469 938L479 938L484 927L510 922L510 917L547 917L557 844L562 844L562 823L568 823L568 781L562 781L562 766L557 766L552 750L495 750L495 745L469 740L469 729L453 719L453 708L438 688L438 672L411 646L411 635L432 630L432 625L448 625L448 620L464 620L464 615L505 615L505 620L521 620L552 651L557 677L583 677L589 672L594 604L604 594L615 552L625 547L625 536L667 495L677 495Z","M31 510L42 510L42 521L36 521L21 557L16 562L16 547L21 547L26 526L31 526Z"],"size":[512,327],"source_sha256":"f0510d9eb2c2871dc1c94c2af23563d3d28b19cd90dee7e2542adae39acaf925"},"19-guarantee-calendar.webp":{"contours":["M531 16L562 26L578 42L578 52L589 57L594 125L641 125L651 78L661 73L661 57L677 47L677 36L693 31L693 26L708 26L708 21L740 21L776 57L776 73L781 73L781 89L786 89L781 130L828 130L833 125L833 130L865 130L870 141L880 141L875 234L880 234L880 260L885 260L885 318L891 318L891 344L896 344L901 422L906 422L906 443L911 443L911 495L917 495L927 589L932 589L932 615L938 615L938 656L943 656L948 714L953 714L953 734L958 734L958 755L964 755L969 823L979 833L984 870L1000 870L1000 875L984 875L984 891L974 901L906 911L906 917L880 917L880 922L865 922L865 927L849 927L849 932L828 932L828 938L776 948L745 979L500 969L469 969L469 964L385 964L385 969L375 969L375 964L42 958L42 953L26 953L21 938L16 938L16 891L21 891L21 865L26 865L26 823L31 823L36 771L42 771L42 740L47 740L47 708L52 708L52 682L57 682L62 620L68 620L68 594L73 594L73 568L78 568L83 500L89 500L89 469L94 469L94 443L99 443L99 406L104 406L104 370L109 370L115 318L120 318L120 292L125 292L125 260L130 260L130 240L135 240L135 224L141 224L141 208L146 208L146 182L156 172L156 156L182 151L188 141L266 135L266 104L271 104L276 78L286 73L286 57L302 47L302 36L312 36L318 26L339 26L339 21L359 21L391 47L396 73L401 73L401 94L406 94L406 130L453 125L453 109L458 109L458 94L464 94L464 78L469 78L479 47L500 26L531 21Z","M682 620L698 620L698 635L682 651L682 661L656 682L656 693L635 708L635 719L609 724L604 708L599 708L589 677L604 667L609 682L635 682L635 672L667 646L667 635Z","M531 391L542 396L536 417L484 469L479 490L469 500L453 500L443 490L432 448L448 443L448 453L479 453L479 443Z","M344 391L354 391L349 417L302 464L302 474L281 490L281 500L266 500L255 490L255 479L250 479L240 448L255 443L260 458L286 458L292 443Z","M500 620L510 620L505 646L484 661L484 672L448 708L448 719L422 724L417 708L411 708L401 677L422 672L422 682L448 682L453 667Z","M708 391L724 391L724 406L703 427L703 438L682 453L682 464L661 479L661 490L651 500L641 500L630 490L615 448L630 443L635 453L661 453L677 438L677 427L698 411L698 401L708 401Z","M312 620L323 620L323 635L286 672L286 682L260 703L260 714L245 729L229 714L214 693L214 672L229 672L234 682L260 682L260 672L281 656L281 646Z"],"size":[423,319],"source_sha256":"51ad596cd6083a93ae3fa304fdbdc5628ff0fcc2a73bdfc446b9575146f50f83"},"consultation-cups-hand-pencil-20261110.webp":{"contours":["M214 167L234 167L255 188L286 188L307 208L318 208L323 224L328 224L333 271L328 271L328 307L323 307L323 333L318 333L318 375L312 375L312 396L307 396L307 411L302 411L302 448L339 453L354 469L365 469L370 484L385 495L391 536L443 536L464 562L490 562L510 536L521 536L526 526L542 526L542 521L578 521L578 526L594 526L594 531L620 531L620 510L625 510L625 495L641 479L641 469L667 443L693 432L693 391L682 380L677 292L672 292L672 260L677 260L677 245L682 245L688 229L698 229L719 208L766 203L766 198L792 193L792 188L812 188L818 198L833 198L854 214L875 214L906 245L911 281L948 281L964 297L964 307L974 312L974 339L979 339L979 401L974 401L969 432L953 443L953 453L938 458L938 490L948 495L948 505L969 526L974 573L969 573L964 594L948 604L948 615L938 620L938 630L917 646L896 667L833 672L833 677L812 677L812 682L776 677L766 667L734 667L734 698L740 698L740 714L745 714L750 740L755 740L755 750L766 760L766 776L771 776L760 792L708 797L708 802L688 802L688 807L641 807L641 812L589 818L578 828L552 828L542 839L521 833L510 818L453 818L453 823L422 823L422 828L396 833L396 839L365 839L365 844L333 854L328 865L302 859L302 849L292 839L292 823L286 823L286 807L281 807L281 792L276 792L276 781L266 771L266 755L250 734L250 719L245 719L245 708L229 688L229 672L146 672L146 667L125 667L120 656L94 651L57 615L57 604L47 599L47 589L36 583L36 573L21 557L21 531L26 531L31 505L42 500L42 490L52 479L68 474L68 448L57 448L36 427L36 417L26 406L26 391L21 391L21 354L16 354L21 307L26 307L36 276L52 260L83 260L89 219L125 182L177 177L177 172L214 172Z"],"size":[1774,887],"source_sha256":"55fd149b78376fab7faede964943b0bf01de540be28d24d21caf75e1a9acf075"},"footer-family-matched-20261109.webp":{"contours":["M328 0L479 0L484 21L510 26L516 36L526 36L547 62L557 62L573 78L568 109L552 115L552 120L521 120L505 135L505 151L490 151L484 161L448 177L448 203L469 203L500 229L510 281L516 281L510 359L516 359L521 380L542 396L542 427L557 438L552 453L542 453L542 490L547 490L552 510L589 542L594 562L641 562L677 521L688 521L693 510L714 510L714 479L698 469L703 448L714 443L714 432L734 427L734 401L745 391L766 385L766 375L776 375L776 370L797 370L797 375L844 375L844 370L854 370L854 375L870 375L870 380L896 380L896 385L917 391L938 417L953 417L953 427L979 443L979 458L964 469L964 484L953 495L922 500L922 505L896 516L896 542L906 547L911 568L922 573L932 615L948 620L964 635L964 651L984 667L984 703L1000 703L1000 734L958 745L953 724L943 724L932 714L932 698L922 698L922 693L896 693L891 708L880 708L880 729L875 729L875 745L870 745L870 781L865 781L865 828L859 828L854 859L833 880L833 901L823 906L823 932L828 932L833 948L828 948L828 958L818 958L807 1000L719 1000L719 969L703 958L708 917L698 906L698 880L688 875L688 865L672 849L672 802L667 802L661 745L656 745L661 703L656 703L656 693L641 688L646 667L656 661L656 635L620 635L620 630L583 625L557 604L557 589L552 589L536 589L521 573L521 557L510 552L510 521L490 500L464 500L458 573L453 573L453 594L448 594L443 635L438 635L438 661L432 661L438 760L443 760L448 818L406 823L406 891L411 891L411 901L479 896L490 911L474 932L432 948L422 964L406 964L406 969L354 964L354 953L349 953L349 896L333 880L333 870L328 865L286 865L286 870L250 870L234 885L229 938L255 964L292 974L297 1000L177 1000L177 984L167 974L156 974L146 964L130 964L109 948L115 932L151 901L151 891L161 880L161 854L130 844L125 833L130 833L130 823L141 818L141 807L156 786L161 750L167 750L172 729L193 708L193 667L188 667L177 635L167 630L161 609L151 604L151 583L146 583L146 573L135 562L141 474L115 474L104 484L104 495L94 500L89 547L62 573L62 599L57 604L26 599L16 583L0 583L0 547L21 542L21 531L31 526L42 495L47 495L52 464L57 464L57 432L42 427L42 411L52 406L52 359L73 339L83 339L89 323L104 312L115 266L120 266L135 224L151 208L172 203L172 198L208 193L208 167L193 156L203 83L229 73L229 68L271 68L276 42L292 26L302 26L312 16L328 16Z"],"size":[277,480],"source_sha256":"4b9f817e03037dfcae4a9650d4413e68ef7e58d1173c2df74069e9af272cd73a"},"reviews-book-white-20261110.webp":{"contours":["M615 302L656 302L656 307L714 318L714 323L740 328L740 333L823 328L823 323L865 307L870 328L885 339L885 359L891 359L891 380L896 380L896 401L901 401L901 432L906 432L906 453L911 453L911 479L917 479L922 531L927 531L932 578L938 578L938 599L943 599L953 672L932 688L875 693L875 698L865 698L854 708L833 708L833 714L688 708L688 703L667 703L667 698L651 698L651 693L635 693L635 688L547 688L552 750L557 750L557 760L573 781L573 792L547 792L547 818L536 812L536 797L531 797L531 781L526 781L526 766L521 766L516 703L484 703L469 724L464 734L453 734L453 729L443 729L438 708L427 708L411 693L391 693L391 688L292 682L292 688L266 688L266 693L234 698L224 708L99 714L99 719L83 719L78 729L47 729L42 724L42 693L47 693L47 667L57 656L57 641L68 630L68 615L78 604L78 589L83 589L83 573L89 573L89 557L94 557L94 542L99 542L99 521L104 521L104 505L109 505L109 490L115 490L115 474L120 474L130 417L135 417L135 406L141 406L141 396L151 385L161 385L161 380L172 380L182 370L198 370L208 359L307 359L312 370L344 370L354 359L422 354L422 359L443 359L448 370L464 370L479 391L510 391L510 380L516 380L516 370L526 365L531 349L542 349L552 333L562 333L562 328L573 328L573 323L583 323L583 318L594 318L594 312L604 312Z"],"size":[1200,480],"source_sha256":"70c3163a111574e74bb2eed64ec705e635362c84022ef1166b46f9f4a9da3875"},"service-book-hand-pencil-20261109.webp":{"contours":["M734 16L766 16L771 47L797 47L802 62L807 62L823 188L828 188L833 245L839 245L839 266L844 266L844 297L849 297L854 354L859 354L859 380L865 380L865 406L870 406L870 432L875 432L875 464L880 464L880 490L885 490L885 516L891 516L901 599L906 599L911 661L943 661L958 641L974 641L984 651L984 667L1000 667L1000 703L984 703L984 714L969 729L958 729L938 755L927 755L880 802L870 802L854 823L844 823L833 839L823 839L812 854L802 854L786 875L760 885L745 906L719 917L708 932L698 932L667 964L646 964L646 969L625 969L625 974L573 984L573 974L583 969L594 943L609 932L620 906L635 896L635 885L651 870L661 870L677 849L688 849L698 833L708 833L719 818L729 818L740 802L750 802L760 786L771 786L797 760L807 760L818 745L844 734L849 729L849 703L823 703L823 708L807 708L797 719L693 740L682 750L656 750L656 755L641 755L641 760L625 760L625 766L583 771L583 776L568 776L557 786L526 792L521 802L510 802L510 812L495 828L474 828L453 807L391 807L391 812L349 818L349 823L323 828L312 839L297 839L276 854L260 854L260 859L250 859L250 865L240 865L219 880L203 880L203 885L141 911L125 927L104 927L104 911L99 911L99 896L94 896L94 865L89 865L89 828L83 828L83 797L78 797L73 734L68 734L57 625L52 625L47 568L42 568L42 542L36 542L36 516L31 516L26 458L21 458L16 396L0 396L0 365L16 365L21 333L31 328L31 318L42 318L52 307L52 260L57 260L57 250L104 203L115 203L120 193L130 193L135 182L146 182L146 177L156 177L167 167L182 167L182 161L208 156L208 151L240 151L240 146L312 146L312 151L354 156L354 161L385 172L391 182L417 182L432 167L432 156L453 135L464 135L474 120L484 120L484 115L495 115L495 109L505 109L516 99L531 99L547 83L589 73L589 68L599 68L609 57L672 42L682 31L703 31L703 26L734 21Z"],"size":[640,379],"source_sha256":"64efd522db481f54d26318ce82a9c910d48346fdb3b2233aa6545e5f318e9c56"}};


const pencilNamespace='http://www.w3.org/2000/svg';
const pencilElement=(name,attributes={})=>{
  const element=document.createElementNS(pencilNamespace,name);
  for(const [key,value] of Object.entries(attributes))element.setAttribute(key,String(value));
  return element;
};
let pencilSerial=0;

function pencilClone(source,outline=false){
  const copy=source.cloneNode(true);
  const original=[source,...source.querySelectorAll('*')],cloned=[copy,...copy.querySelectorAll('*')];
  for(let index=0;index<cloned.length;index++){
    const node=cloned[index];node.removeAttribute('id');
    if(outline){
      node.removeAttribute('filter');node.style.opacity='1';node.style.filter='none';
      if(node.matches('path,circle,ellipse,rect,line,polyline,polygon')){
        node.style.setProperty('fill','none','important');node.style.setProperty('stroke','white','important');
        node.style.setProperty('stroke-opacity','1','important');node.style.setProperty('vector-effect','none','important');
      }
    }else if(node.matches('path,circle,ellipse,rect,line,polyline,polygon')){
      const style=getComputedStyle(original[index]);
      for(const property of ['fill','stroke','stroke-width','fill-opacity','stroke-opacity'])node.style.setProperty(property,style.getPropertyValue(property));
      node.style.setProperty('vector-effect','none','important');
    }
  }
  return copy;
}

function pencilImageBox(image,box,natural){
  const value=(name,fallback)=>{const text=image.getAttribute(name),number=parseFloat(text);return Number.isFinite(number)?text.endsWith('%')?number/100*fallback:number:fallback;};
  const x=value('x',0)||0,y=value('y',0)||0,width=value('width',box.width)||box.width,height=value('height',box.height)||box.height;
  const aspect=image.getAttribute('preserveAspectRatio')??'xMidYMid meet';
  if(!natural||aspect.includes('none'))return {x,y,width,height};
  const scale=(aspect.includes('slice')?Math.max:Math.min)(width/natural[0],height/natural[1]);
  const w=natural[0]*scale,h=natural[1]*scale;
  return {x:x+(width-w)*(aspect.includes('xMin')?0:aspect.includes('xMax')?1:.5),y:y+(height-h)*(aspect.includes('YMin')?0:aspect.includes('YMax')?1:.5),width:w,height:h};
}

// SVG masks reveal the original colors in contour, background and detail passes.
function createPencilDrawing(svg,artwork,{paper=false}={}){
  const box=svg.viewBox.baseVal;
  if(!box.width||!box.height||!svg.animate)return null;
  const originalImage=svg.querySelector('image');
  const source=pencilElement('g',{'data-pencil-source':''});
  for(const child of [...svg.children])if(!['defs','title','desc'].includes(child.localName))source.append(child);
  svg.append(source);
  const id=`pencil-art-${++pencilSerial}`,defs=pencilElement('defs');
  const mask=pencilElement('mask',{id,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height,style:'mask-type:alpha'});
  let outlines,footprint;
  if(originalImage){
    const paint=pencilImageBox(originalImage,box,artwork?.size);
    const contour=pencilElement('g',{transform:`${originalImage.getAttribute('transform')??''} translate(${paint.x} ${paint.y}) scale(${paint.width/1000} ${paint.height/1000})`});
    for(const d of artwork?.contours??[])contour.append(pencilElement('path',{d,fill:'none',stroke:'white','stroke-width':26,'stroke-linecap':'round','stroke-linejoin':'round'}));
    mask.append(contour);outlines=[...contour.children];footprint=contour.cloneNode(true);
    while(footprint.children.length>1)footprint.lastElementChild.remove();
  }else{
    const contour=pencilClone(source,true);
    const selector='path,circle,ellipse,rect,line,polyline,polygon';
    const originals=[...source.querySelectorAll(selector)];
    const geometry=originals.map((shape,index)=>{const bounds=shape.getBBox(),style=getComputedStyle(shape);return {index,area:bounds.width*bounds.height,filled:style.fill!=='none'&&style.fill!=='transparent'&&Number(style.fillOpacity)!==0};});
    const filled=geometry.filter(shape=>shape.filled),candidates=filled.length?filled:geometry;
    const largest=Math.max(0,...candidates.map(shape=>shape.area));
    const selected=new Set(candidates.filter(shape=>shape.area>=largest*.35).sort((a,b)=>b.area-a.area).slice(0,4).map(shape=>shape.index));
    outlines=[...contour.querySelectorAll(selector)].filter((shape,index)=>{if(selected.has(index))return true;shape.remove();return false;});
    for(const shape of outlines)shape.style.setProperty('stroke-width',String(Math.max(box.width,box.height)/115),'important');
    mask.append(contour);footprint=contour.cloneNode(true);
  }
  const normalized=pencilElement('g',{transform:`translate(${box.x} ${box.y}) scale(${box.width/1000} ${box.height/1000})`});
  const layers=[];
  for(const [kind,values] of [['background','0 0 0 1 1'],['details','1 1 1 0 0']]){
    const filterId=`${id}-${kind}-filter`,maskId=`${id}-${kind}`;
    const filter=pencilElement('filter',{id:filterId,'color-interpolation-filters':'sRGB',x:'0%',y:'0%',width:'100%',height:'100%'});
    filter.append(pencilElement('feColorMatrix',{type:'saturate',values:0}));
    const transfer=pencilElement('feComponentTransfer');
    for(const channel of ['R','G','B'])transfer.append(pencilElement(`feFunc${channel}`,{type:'discrete',tableValues:values}));
    transfer.append(pencilElement('feFuncA',{type:'linear',slope:100}));filter.append(transfer);defs.append(filter);
    const shade=pencilElement('mask',{id:maskId,maskUnits:'userSpaceOnUse',x:0,y:0,width:1000,height:1000,style:'mask-type:luminance'});
    const imageSpace=pencilElement('g',{transform:`scale(${1000/box.width} ${1000/box.height}) translate(${-box.x} ${-box.y})`});
    imageSpace.append(pencilClone(source));
    const filtered=pencilElement('g',{filter:`url(#${filterId})`});filtered.append(imageSpace);shade.append(filtered);defs.append(shade);
    const layer=pencilElement('g',{mask:`url(#${maskId})`});normalized.append(layer);layers.push({kind,layer});
  }
  const grain=pencilElement('g');normalized.append(grain);mask.append(normalized);defs.append(mask);svg.prepend(defs);
  let paperView,paperHatches;
  if(paper&&footprint.children.length){
    for(const shape of footprint.querySelectorAll('path,circle,ellipse,rect,line,polyline,polygon')){
      shape.style.setProperty('fill','#faf8f2','important');shape.style.setProperty('stroke','none','important');
    }
    const progressId=`${id}-paper-progress`,progress=pencilElement('mask',{id:progressId,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height,style:'mask-type:alpha'});
    paperHatches=pencilElement('g',{transform:normalized.getAttribute('transform')});progress.append(paperHatches);defs.append(progress);
    paperView=pencilElement('g',{mask:`url(#${progressId})`});paperView.style.display='none';
    const paperSpace=pencilElement('g',{transform:normalized.getAttribute('transform')});
    const inkHoles=pencilElement('g',{mask:`url(#${id}-details)`});
    const originalSpace=pencilElement('g',{transform:`scale(${1000/box.width} ${1000/box.height}) translate(${-box.x} ${-box.y})`});
    originalSpace.append(footprint);inkHoles.append(originalSpace);paperSpace.append(inkHoles);paperView.append(paperSpace);svg.insertBefore(paperView,source);
  }
  let animations=[],strokes=[];

  function finish(){
    source.removeAttribute('mask');
    if(paperView)paperView.style.display='none';
    for(const animation of animations){animation.onfinish=null;animation.cancel();}
    animations=[];
  }
  function prepare(){
    finish();strokes=[];
    paperHatches?.replaceChildren();
    for(const {kind,layer} of layers){
      layer.replaceChildren();
      for(const pass of pencilPasses(kind==='details')){
        const path=pencilElement('path',{d:pass.d,fill:'none',stroke:'white','stroke-width':pass.width,'stroke-linecap':'round','stroke-linejoin':'round',transform:`rotate(${pass.angle} 500 500)`});
        layer.append(path);strokes.push({path,kind,start:pass.start,end:pass.end});
        if(kind==='background'&&paperHatches){
          const paperPath=path.cloneNode(true);paperHatches.append(paperPath);strokes.push({path:paperPath,kind,start:pass.start,end:pass.end});
        }
      }
    }
    grain.replaceChildren();
    const finalPass=pencilPasses().at(-1);
    const finalStroke=pencilElement('path',{d:finalPass.d,fill:'none',stroke:'white','stroke-width':finalPass.width,'stroke-linecap':'round',transform:`rotate(${finalPass.angle} 500 500)`});
    grain.append(finalStroke);strokes.push({path:finalStroke,kind:'grain',start:0,end:1});
    for(const path of [...outlines,...strokes.map(stroke=>stroke.path)]){
      path.setAttribute('pathLength','1');path.style.strokeDasharray='1';path.style.strokeDashoffset='1';
    }
    source.setAttribute('mask',`url(#${id})`);
    if(paperView)paperView.style.display='';
  }
  function start({delay=0,duration=1060,onFinish=()=>{}}={}){
    const lengths=outlines.map(path=>Math.max(1,path.getTotalLength?.()??1));
    const sum=lengths.reduce((a,b)=>a+b,0)||1;
    let at=0;
    outlines.forEach((path,index)=>{
      const time=duration*drawingTiming.contour*lengths[index]/sum;
      animations.push(path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{delay:delay+at,duration:time,easing:'linear',fill:'forwards'}));at+=time;
    });
    for(const stroke of strokes){
      const start=stroke.kind==='background' ? drawingTiming.contour : stroke.kind==='details' ? drawingTiming.contour+drawingTiming.background : .92;
      const span=stroke.kind==='background' ? drawingTiming.background : stroke.kind==='details' ? drawingTiming.details : .08;
      const animation=stroke.path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{
        delay:delay+duration*(start+span*stroke.start),duration:duration*span*(stroke.end-stroke.start),easing:'linear',fill:'forwards',
      });
      animations.push(animation);
    }
    animations.at(-1).onfinish=()=>{finish();onFinish();};
  }
  return {svg,source,originalImage,prepare,start,finish};
}


const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let search=location.search;
try{if(parent!==window)search=parent.location.search;}catch{/* Standalone previews use their own preference. */}
const params=new URLSearchParams(search);
let viewport={enabled:drawingEnabled({choice:params.get('motion'),capture:params.get('capture')==='1'}),frameTop:0,viewportHeight:innerHeight,toolbarHeight:0,near:true};
let active,queued=false,viewportReceived=parent===window;
const easing='cubic-bezier(.22,1,.36,1)';
const serviceStarts=new Map();
const pricePatches=[...document.querySelectorAll('#pricing .pn-3 .pn-term')];
const patchProperties=['--pn-growth','--pn-radius','--pn-x','--pn-y','--pn-wobble'];
const siteHeader=parent===window?document.querySelector('[data-block-document=header]'):null;
const drawingGroup=element=>element.closest('[data-block]')??element.closest('[data-block-document]')??element.parentElement;

const lines=[...document.querySelectorAll('svg[data-ink-line]')].map(svg=>({
  svg,group:drawingGroup(svg),progress:0,started:false,runs:0,animations:[],
  paths:[...svg.querySelectorAll(':scope>path,[data-ink-stroke],g>path')].map(path=>{
    const marker=path.getAttribute('marker-end'),nonScaling=getComputedStyle(path).vectorEffect==='non-scaling-stroke';
    const strokeWidth=parseFloat(getComputedStyle(path).strokeWidth)||2.2;
    path.setAttribute('pathLength','1');path.style.strokeDasharray='1';
    return {path,marker,nonScaling,strokeWidth};
  }),
}));

const pictures=[...document.querySelectorAll('svg[data-pencil-art]')].map(svg=>{
  const image=svg.querySelector('image');
  const url=image?.getAttribute('href')??image?.getAttribute('data-pencil-src')??svg.dataset.pencilFile??'';
  const key=url.split(/[?#]/)[0].split('/').pop();
  const drawing=createPencilDrawing(svg,pencilArtwork[key],{paper:!svg.classList.contains('illustration-hatching')&&/book|album|profile|recommendation|application|letter|calendar|tea|cups|chairs/.test(key)});
  if(!drawing)return null;
  const service=svg.hasAttribute('data-service-drawing');
  const caption=service?svg.closest('.study')?.querySelector('.study-caption'):null;
  return {...drawing,key,service,kind:svg.dataset.serviceDrawing,group:drawingGroup(svg),
    caption,captionTargets:caption?[...caption.children]:[],
    ready:!image?.hasAttribute('data-pencil-src'),mediaRequested:false,failed:false,started:false,runs:0,captionStarted:false,captionAnimations:[],fadeAnimation:null,
  };
}).filter(Boolean);

const drawingGroups=new Map();
function groupFor(element){
  if(!drawingGroups.has(element))drawingGroups.set(element,{element,visible:false,lines:[],pictures:[]});
  return drawingGroups.get(element);
}
lines.forEach(line=>groupFor(line.group).lines.push(line));
pictures.forEach(picture=>groupFor(picture.group).pictures.push(picture));

function finishLine(line,remember=true){
  line.animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});line.animations=[];
  for(const {path,marker} of line.paths){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.vectorEffect='';path.style.strokeWidth='';if(marker)path.setAttribute('marker-end',marker);}
  line.svg.dataset.inkState='complete';
  if(remember){line.progress=1;line.started=true;}
}
function resetLine(line){
  line.animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});line.animations=[];
  line.progress=0;line.started=false;line.svg.dataset.inkState='waiting';
  for(const {path,marker} of line.paths){
    path.style.strokeDasharray='1';path.style.strokeDashoffset='1';path.style.vectorEffect='';path.style.strokeWidth='';
    if(marker)path.removeAttribute('marker-end');
  }
}
function clearCaption(picture){
  picture.captionAnimations.forEach(animation=>animation.cancel());picture.captionAnimations=[];
  for(const target of picture.captionTargets){target.style.opacity='';target.style.transform='';}
}
function finishPicture(picture,remember=true){
  picture.finish();clearCaption(picture);
  picture.fadeAnimation?.cancel();picture.fadeAnimation=null;
  if(picture.caption)picture.captionStarted=true;
  picture.svg.dataset.pencilState='complete';
  if(remember)picture.started=true;
}
function preparePicture(picture){
  if(picture.started)return;
  picture.prepare();
  if(!picture.captionStarted)for(const target of picture.captionTargets)target.style.opacity='0';
  picture.svg.dataset.pencilState='waiting';
}
function resetPicture(picture){
  clearCaption(picture);
  picture.fadeAnimation?.cancel();picture.fadeAnimation=null;
  picture.started=false;picture.captionStarted=false;
  delete picture.svg.dataset.pencilElapsed;
  preparePicture(picture);
}
function replayGroups(visibleTop){
  for(const group of drawingGroups.values()){
    const bounds=group.element.getBoundingClientRect();
    if(!bounds.width||!bounds.height)continue;
    const state=drawingReplayState(group.visible,viewport.frameTop+bounds.top,bounds.height,viewport.viewportHeight,visibleTop);
    group.visible=state.visible;
    if(!state.reset)continue;
    serviceStarts.delete(group.element);
    for(const line of group.lines)if(line.started&&line.svg.dataset.inkLine!=='scroll')resetLine(line);
    for(const picture of group.pictures)if(!picture.failed&&(picture.started||picture.captionStarted))resetPicture(picture);
  }
}
function requestMedia(picture){
  if(picture.ready||picture.mediaRequested||!picture.originalImage)return;
  picture.mediaRequested=true;
  picture.originalImage.addEventListener('load',()=>{picture.ready=true;schedule();},{once:true});
  picture.originalImage.addEventListener('error',()=>{picture.ready=true;picture.failed=true;finishPicture(picture);},{once:true});
  for(const image of picture.svg.querySelectorAll('image[data-pencil-src]'))image.setAttribute('href',image.getAttribute('data-pencil-src'));
}
function setActive(next){
  if(active===next)return;
  active=next;document.documentElement.dataset.drawingMotion=active?'on':'off';
  if(!active)for(const patch of pricePatches)for(const property of patchProperties)patch.style.removeProperty(property);
  serviceStarts.clear();
  for(const line of lines){
    if(!active){finishLine(line,false);continue;}
    if(parent===window&&!line.started){
      const bounds=line.svg.getBoundingClientRect(),openingDrawing=(line.svg.classList.contains('hero-underline')&&scrollY<80)||line.svg.classList.contains('classic-arrow-lines');
      if(bounds.top<innerHeight&&bounds.bottom>0&&!openingDrawing){finishLine(line);continue;}
    }
    if(line.svg.dataset.inkLine==='scroll'||!line.started)resetLine(line);
  }
  for(const picture of pictures){if(active)preparePicture(picture);else finishPicture(picture,false);}
  document.dispatchEvent(new CustomEvent('drawing:motion',{detail:{enabled:active}}));
}
function scaleLineStroke({path,nonScaling,strokeWidth}){
  if(!nonScaling)return;
  const matrix=path.getScreenCTM(),scale=matrix?Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c)):1;
  if(scale>0){path.style.vectorEffect='none';path.style.strokeWidth=String(strokeWidth/scale);}
}
function revealLine(line){
  line.started=true;line.progress=1;line.svg.dataset.inkState='drawing';
  line.svg.dataset.inkRun=String(++line.runs);
  const circle=line.svg.classList.contains('early-price-ring'),route=line.svg.classList.contains('classic-arrow-lines');
  const circleIndex=circle?[...line.svg.parentElement.parentElement.children].indexOf(line.svg.parentElement):0;
  line.paths.forEach((stroke,index)=>{
    const {path,marker}=stroke;
    if(!path.animate){finishLine(line);return;}
    scaleLineStroke(stroke);path.style.strokeDashoffset='0';
    const animation=path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:route?520:(circle?1500:1100)/3,delay:route?index*180:(circleIndex*130+index*100)/3,easing,fill:'backwards'});
    animation.onfinish=()=>{
      path.style.strokeDasharray='none';path.style.vectorEffect='';path.style.strokeWidth='';
      if(marker)path.setAttribute('marker-end',marker);
      line.animations=line.animations.filter(item=>item!==animation);
      if(!line.animations.length)line.svg.dataset.inkState='complete';
    };
    line.animations.push(animation);
  });
}
function startCaption(picture,delay=0){
  if(!picture.caption||picture.captionStarted)return;
  picture.captionStarted=true;
  picture.captionAnimations=picture.captionTargets.map(target=>target.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{delay,duration:650/3,easing,fill:'both'}));
}
function startPicture(picture,delay){
  picture.started=true;picture.svg.dataset.pencilState='drawing';
  picture.svg.dataset.pencilRun=String(++picture.runs);
  const duration=pencilDuration(picture.kind),startedAt=performance.now();
  const softService=picture.service;
  picture.svg.dataset.pencilDelay=String(delay);picture.svg.dataset.pencilDuration=String(duration);
  if(softService){
    const opacity=Number(getComputedStyle(picture.svg).opacity);
    picture.fadeAnimation=picture.svg.animate([{opacity:opacity*.35},{opacity}],{delay,duration:duration*.65,easing:'ease-out',fill:'backwards'});
  }
  startCaption(picture,delay+(softService?duration*.35:500));
  picture.start({delay,duration,onFinish:()=>{picture.svg.dataset.pencilElapsed=String(Math.round(performance.now()-startedAt));finishPicture(picture);}});
}
function isDisplayed(picture,bounds){
  return bounds.width>0&&bounds.height>0&&bounds.right>0&&bounds.left<innerWidth&&!picture.svg.closest('[hidden],li[aria-hidden="true"]')&&getComputedStyle(picture.svg).visibility!=='hidden';
}
function render(){
  setActive(viewportReceived&&viewport.enabled&&!reduced.matches);
  if(document.hidden)return;
  const comparisonBar=parent===window?document.querySelector('.surface-study-bar'):null;
  const visibleTop=Math.max(viewport.toolbarHeight,siteHeader?.getBoundingClientRect().bottom??0,comparisonBar?.getBoundingClientRect().bottom??0);
  if(active)replayGroups(visibleTop);
  if(!viewport.near)return;
  if(active)pricePatches.forEach((patch,index)=>{
    const bounds=patch.getBoundingClientRect();
    const state=pricingPatchState(viewport.frameTop+bounds.top,bounds.height,viewport.viewportHeight,index,viewport.toolbarHeight);
    if(!state)return;
    const values=[state.scale.toFixed(4),state.radius.toFixed(3)+'%',state.x.toFixed(3)+'px',state.y.toFixed(3)+'px',state.angle.toFixed(3)+'deg'];
    patchProperties.forEach((property,i)=>{if(patch.style.getPropertyValue(property)!==values[i])patch.style.setProperty(property,values[i]);});
  });
  if(active)for(const line of lines){
    const bounds=line.svg.getBoundingClientRect(),top=viewport.frameTop+bounds.top;
    if(line.svg.dataset.inkLine!=='scroll'){
      if(!line.started&&bounds.width&&drawingInView(top,bounds.height,viewport.viewportHeight,visibleTop))revealLine(line);
      continue;
    }
    line.progress=bounds.width&&bounds.height?entryProgress(top,bounds.height,viewport.viewportHeight,viewport.toolbarHeight):0;
    line.paths.forEach(({path,marker,nonScaling,strokeWidth},index)=>{
      const part=segmentProgress(line.progress,index,line.paths.length);
      if(part>=1){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.vectorEffect='';path.style.strokeWidth='';if(marker)path.setAttribute('marker-end',marker);return;}
      scaleLineStroke({path,nonScaling,strokeWidth});
      path.style.strokeDasharray='1';path.style.strokeDashoffset=String(1-part);if(marker)path.removeAttribute('marker-end');
    });
    line.svg.dataset.inkState=line.progress>=1?'complete':line.progress>0?'drawing':'waiting';
  }
  const groups=new Map();
  for(const picture of pictures){
    if(picture.started&&picture.ready)continue;
    const bounds=picture.svg.getBoundingClientRect();if(!isDisplayed(picture,bounds))continue;
    const top=viewport.frameTop+bounds.top,bottom=viewport.frameTop+bounds.bottom;
    if(top<viewport.viewportHeight+240&&bottom>viewport.toolbarHeight)requestMedia(picture);
    const inView=drawingInView(top,bounds.height,viewport.viewportHeight,visibleTop);
    if(active&&picture.caption&&!picture.captionStarted&&!inView){
      const captionInView=picture.captionTargets.some(target=>{
        const captionBounds=target.getBoundingClientRect();
        return drawingInView(viewport.frameTop+captionBounds.top,captionBounds.height,viewport.viewportHeight,visibleTop);
      });
      if(captionInView)startCaption(picture);
    }
    if(!active||picture.started||!picture.ready)continue;
    if(!inView)continue;
    if(!groups.has(picture.group))groups.set(picture.group,[]);groups.get(picture.group).push(picture);
  }
  const now=performance.now();
  for(const visible of groups.values())visible.forEach((picture,index)=>{
    const delay=picture.service?nextServiceDelay(now,serviceStarts.get(picture.group)):160+index*100;
    if(picture.service)serviceStarts.set(picture.group,now+delay);
    startPicture(picture,delay);
  });
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;render();});}}

document.addEventListener('drawing:viewport',event=>{viewportReceived=true;viewport=event.detail;schedule();});
document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
document.addEventListener('scroll',schedule,{passive:true,capture:true});
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','hidden','aria-hidden','data-fonts-ready']});
document.fonts?.ready.then(schedule);
if(parent===window){
  const standalone=()=>{viewport={...viewport,viewportHeight:innerHeight};schedule();};
  addEventListener('scroll',standalone,{passive:true});addEventListener('resize',standalone);addEventListener('pageshow',standalone);
}
setActive(viewportReceived&&viewport.enabled&&!reduced.matches);
if(parent===window)render();
else try{parent.document.dispatchEvent(new Event('site:layout'));}catch{/* Cross-origin previews do not notify a parent. */}

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
(()=>{const surfaceVersions=[
 {id:'original',name:'Белая подложка',detail:'Прежние белые карточки отзывов'},
 {id:'blue',name:'Мягкая белая штриховка',detail:'Более плотный белый фон с лёгкими карандашными штрихами'},
 {id:'green',name:'Меловая фактура',detail:'Прежняя плотная меловая подложка отзывов'},
 {id:'duo',name:'Карандашная фактура',detail:'Прежняя подложка с более заметными карандашными штрихами'},
];
const surfaceVersion=value=>surfaceVersions.find(version=>version.id===value)??null;


// Texture comparisons reuse the original cards and form, including entered values.
const surfaceRoot=document.documentElement;
let surfaceBar;
function chooseSurface(value){
 const version=surfaceVersion(value??'blue');
 if(!version){delete surfaceRoot.dataset.textureStudy;surfaceBar?.remove();surfaceBar=null;return;}
 surfaceRoot.dataset.textureStudy=version.id;
 if(!surfaceBar){
  surfaceBar=document.createElement('nav');
  surfaceBar.className='surface-study-bar';
  surfaceBar.setAttribute('aria-label','Сравнение фактур');
  surfaceBar.innerHTML='<span class="surface-study-caption">Отзывы</span><div class="surface-study-choices" role="group" aria-label="Выбрать версию"></div><span class="surface-study-name" aria-live="polite"></span><div class="surface-study-jumps"><a href="#apply">Заявка</a><a href="#reviews">Отзывы</a></div><button class="surface-study-close" type="button" aria-label="Закрыть сравнение и вернуться к основному сайту">×</button>';
  const group=surfaceBar.querySelector('.surface-study-choices');
  surfaceVersions.forEach((item,index)=>{
   const button=document.createElement('button');
   button.type='button';button.textContent=String(index+1);button.dataset.textureChoice=item.id;
   button.setAttribute('aria-label',`Вариант ${index+1}: ${item.name}`);button.title=item.detail;
   group.append(button);
  });
  const masks=document.createElementNS('http://www.w3.org/2000/svg','svg');
  masks.classList.add('surface-study-masks');masks.setAttribute('aria-hidden','true');masks.setAttribute('focusable','false');
  masks.innerHTML='<defs><filter id="surface-study-grain-contrast" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR data-study-contrast type="linear" slope="3" intercept="-2"/><feFuncG data-study-contrast type="linear" slope="3" intercept="-2"/><feFuncB data-study-contrast type="linear" slope="3" intercept="-2"/></feComponentTransfer><feComponentTransfer><feFuncR data-study-softness type="linear" slope=".28" intercept=".72"/><feFuncG data-study-softness type="linear" slope=".28" intercept=".72"/><feFuncB data-study-softness type="linear" slope=".28" intercept=".72"/><feFuncA data-study-soft-alpha type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><mask id="surface-study-paper-grain" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1" style="mask-type:luminance"><image data-study-grain x="-.05" y="-.2" width="1.1" height="1.4" preserveAspectRatio="none" filter="url(#surface-study-grain-contrast)"/></mask></defs>';
  surfaceBar.append(masks);
  document.body.prepend(surfaceBar);
  surfaceBar.addEventListener('click',event=>{
   const button=event.target.closest('[data-texture-choice]');
   const close=event.target.closest('.surface-study-close');
   if(!button&&!close)return;
   const id=button?.dataset.textureChoice??'off',url=new URL(location.href);
   url.searchParams.set('texture',id);
   history.replaceState(null,'',url);
   chooseSurface(id);
  });
 }
 // Reuse the generated strokes as white pigment, with visible paper gaps.
 const grain=surfaceBar.querySelector('[data-study-grain]');
 if(version.id==='original')grain.removeAttribute('href');
 else grain.setAttribute('href',`media/surface-studies-20261110/form-${version.id}.webp`);
 const contrast=version.id==='green'?2:3;
 for(const channel of surfaceBar.querySelectorAll('[data-study-contrast]')){
  channel.setAttribute('slope',String(contrast));channel.setAttribute('intercept',String(1-contrast));
 }
 // Keep at least72% white pigment in the softer version; only28% is hatch contrast.
 const softness=version.id==='blue'?.28:1;
 for(const channel of surfaceBar.querySelectorAll('[data-study-softness]')){
  channel.setAttribute('slope',String(softness));channel.setAttribute('intercept',String(1-softness));
 }
 const alpha=surfaceBar.querySelector('[data-study-soft-alpha]');
 alpha.setAttribute('slope',version.id==='blue'?'0':'1');
 alpha.setAttribute('intercept',version.id==='blue'?'1':'0');
 for(const button of surfaceBar.querySelectorAll('[data-texture-choice]'))button.setAttribute('aria-pressed',String(button.dataset.textureChoice===version.id));
 surfaceBar.querySelector('.surface-study-name').textContent=version.name;
}
const restoreSurface=()=>chooseSurface(new URLSearchParams(location.search).get('texture'));
addEventListener('popstate',restoreSurface);
restoreSurface();

})();
(function bindSiteRequestUi(formatRequest) {
  const endpoint = document.body.dataset.requestEndpoint;
  const pending = new WeakSet();
  document.querySelectorAll('.s-consult-form [type=submit]').forEach(button => { button.disabled = false; });
  if (endpoint) {
    const privacy = document.querySelector('#studio-privacy p');
    if (privacy) privacy.textContent = 'При нажатии «Оставить заявку» имя, контакт и текст запроса передаются Анастасии через Telegram-бота. Отдельная база заявок на сайте не ведётся.';
  }
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!form.matches('.s-consult-form')) return;
    event.preventDefault();
    if (pending.has(form)) return;
    const fields = ['name', 'contact', 'message'].map(key => form.elements.namedItem(key));
    const [name, contact, message] = fields;
    name.setCustomValidity(name.value.trim() ? '' : 'Укажите ваше имя.');
    contact.setCustomValidity(contact.value.trim().length >= 3 ? '' : 'Укажите телефон или Telegram для связи.');
    if (!form.reportValidity()) return;
    const application = {name: name.value, contact: contact.value, message: message.value, website: ''};
    const destination = new URL('https://t.me/inyfid');
    destination.searchParams.set('text', formatRequest(application));
    if (!endpoint) {
      window.open(destination.href, '_blank', 'noopener,noreferrer');
      return;
    }
    const submit = form.querySelector('[type=submit]');
    const label = submit.firstChild;
    const originalLabel = label.textContent;
    const status = form.querySelector('[role=status]');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    pending.add(form);
    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    fields.forEach(field => { field.readOnly = true; });
    label.textContent = 'Отправляем… ';
    status.textContent = '';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(application),
        credentials: 'same-origin',
        signal: controller.signal,
      });
      if (response.ok && (await response.json()).ok === true) {
        form.reset();
        status.textContent = 'Заявка отправлена. Анастасия свяжется с вами.';
        return;
      }
      status.textContent = response.status === 429
        ? 'Слишком много попыток. Попробуйте через минуту или напишите лично.'
        : 'Не удалось подтвердить отправку. Попробуйте ещё раз или напишите лично.';
    } catch {
      status.textContent = 'Не удалось подтвердить отправку. Попробуйте ещё раз или напишите лично.';
    } finally {
      clearTimeout(timeout);
      pending.delete(form);
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      fields.forEach(field => { field.readOnly = false; });
      label.textContent = originalLabel;
    }
    const link = document.createElement('a');
    link.href = destination.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 's-text-link';
    link.textContent = 'Отправить в Telegram ↗';
    status.append(' ', link);
  });
  document.addEventListener('input', event => {
    const form = event.target.closest('.s-consult-form');
    if (!form || pending.has(form)) return;
    form.elements.namedItem('name').setCustomValidity('');
    form.elements.namedItem('contact').setCustomValidity('');
    form.querySelector('[role=status]').textContent = '';
  });
})(function formatRequest({name,contact,message}) {
  const lines=['Здравствуйте, Анастасия!','',`Меня зовут ${name.trim()}.`,`Связаться со мной: ${contact.trim()}.`];
  if(message.trim())lines.push('','О нашей семье:',message.trim());
  return lines.join('\n');
});