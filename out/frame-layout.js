// Keep the editable blocks seamless without waiting for their photographs.
export function mountBlockFrames(frames,{onReady,onNavigate}){
  const documents=new WeakMap();
  const fits=new WeakMap();
  function bind(frame){
    const doc=frame.contentDocument;
    const root=doc?.querySelector('[data-reference-block-root]');
    if(!root||documents.get(frame)===doc)return;
    documents.set(frame,doc);
    doc.documentElement.dataset.referenceEmbedded='true';
    let queued=false;
    const fit=()=>{
      queued=false;
      if(!frame.isConnected||!root.getBoundingClientRect().width)return;
      const menus=[...doc.querySelectorAll('details[open] nav')];
      const height=Math.ceil(Math.max(root.getBoundingClientRect().height,root.scrollHeight,...menus.map(menu=>menu.getBoundingClientRect().bottom)));
      if(height>0&&frame.height!==String(height))frame.height=String(height);
    };
    const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(fit);}};
    fits.set(frame,fit);
    const observer=new ResizeObserver(schedule);
    observer.observe(root);
    doc.querySelectorAll('.s-menu-links,.mobile-menu>nav,.design-site-menu>nav').forEach(menu=>observer.observe(menu));
    doc.addEventListener('toggle',fit,true);
    doc.addEventListener('load',schedule,true);
    doc.addEventListener('animationend',schedule,true);
    doc.fonts.ready.then(schedule);
    doc.fonts.addEventListener('loadingdone',schedule);
    doc.addEventListener('request:draft',event=>{
      event.preventDefault();fit();
      requestAnimationFrame(()=>{
        fit();
        const draft=doc.querySelector('.s-draft:not([hidden])');
        if(!draft)return;
        const top=frame.getBoundingClientRect().top+draft.getBoundingClientRect().top;
        if(top<24||top+draft.getBoundingClientRect().height>innerHeight-24)window.scrollTo({top:Math.max(0,scrollY+top-24),behavior:'instant'});
        draft.querySelector('textarea')?.focus({preventScroll:true});
      });
    });
    doc.addEventListener('pointerdown',()=>closeMenus(frame),true);
    doc.addEventListener('click',event=>{
      if(event.target.closest('.s-privacy')){
        event.preventDefault();event.stopImmediatePropagation();
        document.getElementById('studio-privacy').showModal();return;
      }
      const link=event.target.closest('[data-reference-target]');
      if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const target=document.getElementById(link.dataset.referenceTarget);
      if(!target)return;
      event.preventDefault();event.stopImmediatePropagation();
      closeMenus();fit();onNavigate(target.id);
    },true);
    fit();onReady(frame);
  }
  function closeMenus(except){
    for(const frame of frames){
      if(frame===except)continue;
      const menus=frame.contentDocument?.querySelectorAll('.s-menu[open],.mobile-menu[open],.design-site-menu[open]');
      menus?.forEach(menu=>{menu.open=false;});
      if(menus?.length)fits.get(frame)?.();
    }
  }
  for(const frame of frames){
    frame.addEventListener('load',()=>bind(frame));
    if(frame.contentDocument?.readyState!=='loading')bind(frame);
  }
  addEventListener('site:block-ready',event=>{if(frames.includes(event.detail?.frame))bind(event.detail.frame);});
  document.addEventListener('pointerdown',()=>closeMenus(),true);
  return {fit:frame=>fits.get(frame)?.()};
}
