import {addPaletteSelect,applyComparisonPalette,setPaletteUrl,visibleSection} from '../studio/theme-controls.js';

(() => {
  const variants = {
    method: {name:'По делу',description:'Крупная типографика, ясная структура и подробности работы.'},
    photo: {name:'Живой кадр',description:'Настоящие фотографии и открытая композиция с крупным семейным кадром.'},
    contrast: {name:'Контраст',description:'Тёмно-зелёный первый экран, выразительный шрифт и голубые акценты.'}
  };
  const frame=document.querySelector('#design-frame');
  const stage=document.querySelector('.review-stage');
  const viewport=document.querySelector('.review-viewport');
  const tabs=Array.from(document.querySelectorAll('[data-design]'));
  const openLink=document.querySelector('#open-design');
  let current='method';
  const palette=addPaletteSelect(document.querySelector('.review-controls'),value=>{
    if(frame.contentDocument)applyComparisonPalette(frame.contentDocument,value);
    history.replaceState(null,'',setPaletteUrl(new URL(location.href),value));
    openLink.href=designUrl(current).href;
  });
  function designUrl(id,embedded=false,section='') {
    const url=setPaletteUrl(new URL('rework/'+id+'.html',location.href),palette.value);
    if(embedded)url.searchParams.set('embed','1');
    url.hash=section;
    return url;
  }
  frame.addEventListener('load',()=>{
    if(frame.contentDocument)applyComparisonPalette(frame.contentDocument,palette.value);
  });
  openLink.addEventListener('click',()=>{
    openLink.href=designUrl(current,false,frame.contentDocument?visibleSection(frame.contentDocument):'').href;
  });
  let mobile=window.matchMedia('(max-width:650px)').matches;
  const resize=()=>{
    const available=stage.clientWidth-(innerWidth<=700?20:38);
    const width=mobile?390:1280;
    const scale=Math.min(1,(available-(mobile?14:0))/width);
    viewport.style.width=(width*scale)+'px';
    viewport.style.height=((mobile?780:940)*scale)+'px';
    frame.style.width=width+'px';
    frame.style.height=(mobile?780:940)+'px';
    frame.style.transform='scale('+scale+')';
    stage.dataset.mobile=String(mobile);
    document.querySelectorAll('[data-device]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.device==='mobile')===mobile)));
  };
  const select=id=>{
    if(!variants[id])return;
    const section=frame.contentDocument?visibleSection(frame.contentDocument):'';
    current=id;
    tabs.forEach(button=>{const selected=button.dataset.design===id;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    const url=designUrl(id,true,section);
    if(frame.src!==url.href)frame.src=url.href;
    frame.title=variants[id].name+' — полный сайт';
    document.querySelector('#design-panel').setAttribute('aria-labelledby','tab-'+id);
    document.querySelector('#design-description').textContent=variants[id].description;
    openLink.href=designUrl(id).href;
  };
  tabs.forEach((button,index)=>{
    button.addEventListener('click',()=>select(button.dataset.design));
    button.addEventListener('keydown',event=>{
      let next=null;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==null){event.preventDefault();tabs[next].focus();select(tabs[next].dataset.design);}
    });
  });
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{mobile=button.dataset.device==='mobile';resize();}));
  new ResizeObserver(resize).observe(stage);
  resize();
  if(palette.value)select(current);
})();
