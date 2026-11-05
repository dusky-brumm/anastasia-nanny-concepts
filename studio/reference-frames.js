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
        function resize(){
          if(!frame.isConnected||!root.getBoundingClientRect().width)return;
          const height=Math.ceil(root.getBoundingClientRect().height);
          if(height>0&&frame.height!==String(height))frame.height=String(height);
        }
        observer=new ResizeObserver(resize);
        observer.observe(root);
        doc.fonts.ready.then(resize);
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
          location.hash=target.id;
          target.scrollIntoView({block:'start'});
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
