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
  for(const select of document.querySelectorAll('[data-design-navigation]')) {
    select.addEventListener('change',()=>{
      const destination=new URL(select.value,location.href);
      const activeLink=[...document.querySelectorAll('.comparison-pairs a')].find(link=>new URL(link.href).pathname===destination.pathname);
      if(activeLink){activeLink.click();return;}
      destination.hash=location.hash;
      location.assign(destination.href);
    });
  }
  const menu=document.querySelector('.imported-design .mobile-menu');
  menu?.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary')?.focus();}});
})();
