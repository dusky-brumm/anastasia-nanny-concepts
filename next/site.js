import {initCommonUI} from '../shared-ui.js?v=f80a6c9362';
initCommonUI({menuButton:'.menu-toggle',menu:'#mobile-menu',menuMinWidth:document.body.classList.contains('next-02-column')?851:1001});

// Enhancement only: every example and service remains readable without JS.
for(const group of document.querySelectorAll('[data-tabs]')) {
  const tabs=[...group.querySelectorAll('[role="tab"]')];
  function activate(tab,focus=false,selectService=false) {
    for(const item of tabs) {
      const selected=item===tab;
      item.setAttribute('aria-selected',String(selected));
      item.tabIndex=selected?0:-1;
      const panel=document.getElementById(item.getAttribute('aria-controls'));
      if(panel) panel.hidden=!selected;
    }
    const status=group.querySelector('[data-tab-status]');
    if(status) status.textContent=tab.dataset.status||tab.textContent.trim();
    if(selectService&&tab.dataset.formatService) {
      const field=document.querySelector('form select[name="service"]');
      if(field&&field.value!==tab.dataset.formatService) {
        field.value=tab.dataset.formatService;
        field.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }
    if(focus) tab.focus();
  }
  for(const [index,tab] of tabs.entries()) {
    tab.addEventListener('click',()=>activate(tab,false,true));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight') next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=tabs.length-1;
      if(next!==undefined) { event.preventDefault(); activate(tabs[next],true,true); }
    });
  }
  if(tabs.length) activate(tabs.find(tab=>tab.getAttribute('aria-selected')==='true')||tabs[0]);
  group.dataset.enhanced='true';
}

const root=document.documentElement;
const capture=new URLSearchParams(location.search).get('capture')==='1';
root.dataset.capture=String(capture);
if(capture) {
  let timer;
  const settled=()=>requestAnimationFrame(()=>{
    root.dataset.captureReady=location.hash||'#top';
    root.dataset.captureScroll=String(Math.round(scrollY));
  });
  addEventListener('scroll',()=>{
    root.dataset.captureScroll='moving';
    clearTimeout(timer); timer=setTimeout(settled,120);
  },{passive:true});
  addEventListener('scrollend',settled);
  addEventListener('resize',settled);
  addEventListener('hashchange',settled);
  Promise.all([document.fonts.ready,...[...document.querySelectorAll('img[fetchpriority="high"]')].map(img=>img.decode().catch(()=>{}))]).then(settled);
}
