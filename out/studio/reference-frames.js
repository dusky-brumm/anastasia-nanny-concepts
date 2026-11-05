(() => {
  const bound=new WeakSet();
  function bindFrames(){
    for(const frame of document.querySelectorAll('iframe[data-reference-frame]')){
      if(bound.has(frame))continue;
      bound.add(frame);
      let observer;
      function loaded(){
        observer?.disconnect();
        const doc=frame.contentDocument;
        const root=doc?.querySelector('[data-reference-block-root]');
        if(!root)return;
        // The parent fits the full block; an inner scrollbar would change its width.
        doc.documentElement.dataset.referenceEmbedded='true';
        let resizeQueued=false;
        function resize(){
          if(!frame.isConnected||!root.getBoundingClientRect().width)return;
          const height=Math.ceil(Math.max(root.getBoundingClientRect().height,root.scrollHeight));
          if(height>0&&frame.height!==String(height))frame.height=String(height);
        }
        function queueResize(){
          if(resizeQueued)return;
          resizeQueued=true;
          requestAnimationFrame(()=>{resizeQueued=false;resize();});
        }
        observer=new ResizeObserver(queueResize);
        observer.observe(root);
        root.querySelectorAll('.s-menu-links,.mobile-menu > nav,.design-site-menu > nav').forEach(menu=>observer.observe(menu));
        doc.addEventListener('toggle',resize,true);
        doc.addEventListener('animationend',queueResize,true);
        doc.fonts.ready.then(resize);
        doc.fonts.addEventListener('loadingdone',queueResize);
        resize();
        doc.addEventListener('click',event=>{
          if(event.target.closest('.s-privacy')){
            event.preventDefault();
            event.stopImmediatePropagation();
            document.getElementById('studio-privacy').showModal();
            return;
          }
          const link=event.target.closest('[data-reference-target]');
          if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
          const target=document.getElementById(link.dataset.referenceTarget);
          if(!target||!frame.closest('[data-assembly-part]'))return;
          event.preventDefault();
          event.stopImmediatePropagation();
          // Close the frame's menu before measuring the parent's destination.
          doc.querySelectorAll('.s-menu[open],.mobile-menu[open],.design-site-menu[open]').forEach(menu=>{menu.open=false;});
          resize();
          location.hash=target.id;
          requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
        },true);
      }
      frame.addEventListener('load',loaded);
      if(frame.contentDocument?.readyState==='complete')loaded();
    }
  }
  bindFrames();
  // Assembly templates enter the document only after their option is selected.
  new MutationObserver(bindFrames).observe(document.body,{childList:true,subtree:true});
})();
