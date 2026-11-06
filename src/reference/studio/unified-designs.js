(() => {
  // Saved comparison links must not restore a palette the user has retired.
  const current=new URL(location.href);
  for(const key of [...current.searchParams.keys()]) {
    if(key==='palette'||key.startsWith('color-'))current.searchParams.delete(key);
  }
  if(current.href!==location.href) {
    try {history.replaceState(history.state,'',current);} catch(error) {
      if(error.name!=='SecurityError')throw error;
    }
  }
  for(const track of document.querySelectorAll('[data-design-navigation]')) {
    const active=track.querySelector('a[aria-current]');
    if(!active)continue;
    function revealCurrentDesign(){
      const offset=active.getBoundingClientRect().left-track.getBoundingClientRect().left;
      if(offset<0||offset+active.offsetWidth>track.clientWidth){
        track.scrollLeft+=offset-(track.clientWidth-active.offsetWidth)/2;
      }
    }
    revealCurrentDesign();
    if('ResizeObserver' in window)new ResizeObserver(revealCurrentDesign).observe(track);
  }
  for(const menu of document.querySelectorAll('.imported-design .mobile-menu,.design-site-menu')){
    menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary')?.focus();}});
  }
})();
