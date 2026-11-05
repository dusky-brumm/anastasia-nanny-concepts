(() => {
  const root=document.querySelector('.early-design');
  if(!root)return;
  const initialHash=location.hash;
  if(initialHash&&!new URL(location.href).searchParams.has('compare-scroll')){
    const loaded=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    Promise.all([loaded,document.fonts.ready]).then(()=>requestAnimationFrame(()=>{
      if(location.hash!==initialHash)return;
      const target=document.getElementById(initialHash.slice(1));
      if(!target||!root.contains(target))return;
      const bar=document.querySelector('.pencil-comparison');
      window.scrollTo({top:scrollY+target.getBoundingClientRect().top-(bar?bar.getBoundingClientRect().height+24:24),behavior:'instant'});
    }));
  }
  if(new URL(location.href).searchParams.get('capture')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const groups=new Map();
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      for(const drawing of groups.get(entry.target))drawing.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  },{rootMargin:'48px 0px',threshold:0});
  for(const drawing of root.querySelectorAll('[data-early-art]')){
    if(drawing.hasAttribute('data-chalk-line'))drawing.classList.add('early-reveal');
    const parent=drawing.parentElement;
    if(!groups.has(parent)){groups.set(parent,[]);observer.observe(parent);}
    groups.get(parent).push(drawing);
  }
})();
