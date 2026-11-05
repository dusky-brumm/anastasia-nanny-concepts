(() => {
  const root=document.querySelector('.illustrated-site');
  if(!root)return;
  for(const menu of root.querySelectorAll('.mobile-menu')){
    menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
    menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}});
  }
  // A direct section link must land below the comparison bar after fonts settle.
  const initialHash=location.hash;
  if(initialHash&&!new URL(location.href).searchParams.has('compare-scroll')){
    const loaded=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    Promise.all([loaded,document.fonts.ready]).then(()=>requestAnimationFrame(()=>{
      if(location.hash!==initialHash)return;
      const target=document.getElementById(initialHash.slice(1));
      if(!target||!root.contains(target))return;
      const bar=document.querySelector('.pencil-comparison');
      const offset=bar?bar.getBoundingClientRect().height+24:24;
      window.scrollTo({top:scrollY+target.getBoundingClientRect().top-offset,behavior:'instant'});
    }));
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const groups=new Map();
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      for(const drawing of groups.get(entry.target))drawing.classList.add('chalk-visible');
      observer.unobserve(entry.target);
    }
  },{threshold:0,rootMargin:'64px 0px'});
  for(const drawing of root.querySelectorAll('svg:not(.cafe-crop)')){
    if(drawing.parentElement.closest('svg'))continue;
    const line=drawing.matches('.chalk-mark,.underline,.arc,.thread-line,.drawing-line,.row-divider,.album-thread,.album-corners,.letter-contour,.journal-spine,.chalk-form-line,.chalk-footer-picture')||drawing.closest('.flow-path,.notes-thread,.snapshots-thread,.studies-thread,.care-divider,.payment-connector,.snapshots-thread');
    drawing.classList.add(line?'chalk-reveal':'chalk-illustration');
    const container=drawing.parentElement;
    if(!groups.has(container)){groups.set(container,[]);observer.observe(container);}
    groups.get(container).push(drawing);
  }
})();
