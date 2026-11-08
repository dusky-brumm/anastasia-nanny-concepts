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
