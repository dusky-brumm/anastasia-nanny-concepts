// One review per slide at every width; native touch scrolling stays available.
const strip=document.querySelector('[data-open-quotes]');
if(strip){
  const track=strip.querySelector('.s-review-grid'),cards=[...track.children];
  const controls=strip.querySelector('.comparison-quote-controls');
  const dots=[...controls.querySelectorAll('[data-quote-index]')];
  const position=controls.querySelector('.review-slider-status');
  let selected=0,destination=null,queued=false,previousStep=0;
  const step=()=>cards[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||0);
  const wrap=index=>(index+cards.length)%cards.length;
  function show(index){
    selected=index;
    dots.forEach((dot,i)=>{
      if(i===index)dot.setAttribute('aria-current','true');
      else dot.removeAttribute('aria-current');
    });
    cards.forEach((card,i)=>{
      if(i===index)card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden','true');
    });
    const label=`Отзыв ${index+1} из ${cards.length}`;
    if(position.textContent!==label)position.textContent=label;
  }
  function update(){
    queued=false;
    const size=step();
    if(!track.isConnected||!track.clientWidth||!size)return;
    if(destination!==null){
      if(Math.abs(track.scrollLeft-destination*size)>2)return;
      destination=null;
    }
    show(Math.min(cards.length-1,Math.max(0,Math.round(track.scrollLeft/size))));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  function move(index){
    destination=wrap(index);show(destination);
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.drawingMotion==='off';
    track.scrollTo({left:destination*step(),behavior:reduce?'instant':'smooth'});
    schedule();
  }
  controls.hidden=cards.length<2;
  cards.forEach((card,index)=>{
    card.setAttribute('role','group');card.setAttribute('aria-roledescription','слайд');
    card.setAttribute('aria-label',`${index+1} из ${cards.length}`);
  });
  controls.querySelectorAll('[data-quote-step]').forEach(button=>button.addEventListener('click',()=>move(selected+Number(button.dataset.quoteStep))));
  dots.forEach(dot=>dot.addEventListener('click',()=>move(Number(dot.dataset.quoteIndex))));
  track.addEventListener('scroll',schedule,{passive:true});
  for(const event of ['pointerdown','wheel'])track.addEventListener(event,()=>{destination=null;},{passive:true});
  track.addEventListener('keydown',event=>{
    if(event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();move(event.key==='Home'?0:event.key==='End'?cards.length-1:selected+(event.key==='ArrowRight'?1:-1));
  });
  const observer=new ResizeObserver(()=>{
    const size=step();
    if(previousStep&&Math.abs(size-previousStep)>1){
      destination=null;track.scrollTo({left:selected*size,behavior:'instant'});
    }
    previousStep=size;schedule();
  });
  observer.observe(track);cards.forEach(card=>observer.observe(card));
  document.fonts.ready.then(schedule);show(0);
}
