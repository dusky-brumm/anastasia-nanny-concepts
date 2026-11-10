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
