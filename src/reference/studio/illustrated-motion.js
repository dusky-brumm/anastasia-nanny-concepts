(() => {
  const root=document.querySelector('.illustrated-site');
  if(!root)return;
  for(const menu of root.querySelectorAll('.mobile-menu')){
    menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
    menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}});
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const groups=new Map();
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      for(const drawing of groups.get(entry.target))drawing.classList.add('chalk-visible');
      observer.unobserve(entry.target);
    }
  },{threshold:.15});
  for(const drawing of root.querySelectorAll('svg:not(.cafe-crop)')){
    drawing.classList.add('chalk-reveal');
    const container=drawing.parentElement;
    if(!groups.has(container)){groups.set(container,[]);observer.observe(container);}
    groups.get(container).push(drawing);
  }
})();
