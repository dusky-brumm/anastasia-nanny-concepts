(() => {
  for(const select of document.querySelectorAll('[data-design-navigation]')) {
    select.addEventListener('change',()=>{
      const destination=new URL(select.value,location.href);
      const activeLink=[...document.querySelectorAll('.comparison-pairs a')].find(link=>new URL(link.href).pathname===destination.pathname);
      if(activeLink)destination.search=new URL(activeLink.href).search;
      else {
        const palette=document.querySelector('.theme-options [data-palette][aria-pressed="true"]')?.dataset.palette;
        if(palette)destination.searchParams.set('palette',palette);
      }
      destination.hash=location.hash;
      location.assign(destination.href);
    });
  }
  const menu=document.querySelector('.imported-design .mobile-menu');
  menu?.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary')?.focus();}});
})();
