/** Optional presentation effects. No content is hidden while waiting for this module. */
export function initNextMotion({doc=document,view=window}={}) {
  const root=doc.documentElement;
  const button=doc.querySelector('[data-motion-toggle]');
  const params=new URLSearchParams(view.location.search);
  const capture=params.get('capture')==='1'||params.get('embed')==='1';
  const reduced=view.matchMedia('(prefers-reduced-motion: reduce)');
  const wide=view.matchMedia('(min-width: 901px)');
  const preferenceKey='anastasia-next-motion';
  let choice=params.get('motion')==='off'?'off':'on';
  try { if(params.get('motion')!=='off'&&view.localStorage.getItem(preferenceKey)==='off') choice='off'; } catch {}
  let enabled=false;
  let routeObserver;
  let routeSeen=false;
  let priceObserver;
  let priceTimer;
  const running=new Set();
  const byElement=new WeakMap();

  function run(element,keyframes,options={}) {
    if(!enabled||!element?.animate) return;
    byElement.get(element)?.cancel();
    const animation=element.animate(keyframes,{duration:170,easing:'cubic-bezier(.2,.65,.3,1)',...options});
    byElement.set(element,animation);
    running.add(animation);
    const finish=()=>{
      running.delete(animation);
      if(byElement.get(element)===animation) byElement.delete(element);
    };
    animation.finished.then(finish,finish);
  }
  function clearPriceObserver() {
    priceObserver?.disconnect(); priceObserver=undefined;
    if(priceTimer) view.clearTimeout(priceTimer);
    priceTimer=undefined;
  }
  function stop() {
    for(const animation of running) animation.cancel();
    running.clear();
    routeObserver?.disconnect(); routeObserver=undefined;
    if(routeSeen) doc.querySelector('.air-route')?.removeAttribute('data-flow');
    clearPriceObserver();
  }
  function setupRoute() {
    if(!enabled||routeSeen||!wide.matches||!view.IntersectionObserver||routeObserver) return;
    const route=doc.querySelector('.air-route');
    if(!route) return;
    routeObserver=new view.IntersectionObserver(entries=>{
      if(!enabled||!entries.some(entry=>entry.isIntersecting)) return;
      routeSeen=true;
      route.dataset.flow='played';
      routeObserver.disconnect(); routeObserver=undefined;
    },{threshold:.25});
    routeObserver.observe(route);
  }
  function updateLinks() {
    for(const link of doc.querySelectorAll('.review-switch a, .review-start>a')) {
      const url=new URL(link.href,view.location.href);
      if(choice==='off') url.searchParams.set('motion','off');
      else url.searchParams.delete('motion');
      link.href=url.href;
    }
  }
  function wideChange() {
    if(!wide.matches) {
      routeObserver?.disconnect(); routeObserver=undefined;
      if(routeSeen) doc.querySelector('.air-route')?.removeAttribute('data-flow');
    } else setupRoute();
  }
  function update() {
    enabled=!capture&&!reduced.matches&&choice!=='off';
    root.dataset.nextMotion=enabled?'on':'off';
    root.dataset.motionReady='true';
    if(!enabled) stop(); else setupRoute();
    if(button) {
      button.hidden=capture;
      button.disabled=reduced.matches;
      button.setAttribute('aria-pressed',String(enabled));
      button.textContent=reduced.matches?'Без анимации':`Анимация: ${enabled?'вкл':'выкл'}`;
      button.title=reduced.matches?'В системе включено уменьшение движения':'Включить или отключить движение на странице';
    }
    updateLinks();
  }
  function toggle() {
    if(reduced.matches||capture) return;
    choice=enabled?'off':'on';
    try { view.localStorage.setItem(preferenceKey,choice); } catch {}
    const url=new URL(view.location.href);
    if(choice==='off') url.searchParams.set('motion','off'); else url.searchParams.delete('motion');
    view.history.replaceState(view.history.state,'',url.href);
    update();
  }
  function tabChange(event) {
    if(!enabled) return;
    const panel=doc.getElementById(event.detail?.panelId);
    if(panel&&!panel.hidden) run(panel,[{opacity:.7},{opacity:1}]);
  }
  function showPriceFeedback(element) {
    run(element,[
      {boxShadow:'0 0 0 0 rgba(49,90,73,0)'},
      {boxShadow:'0 0 0 4px rgba(49,90,73,.16)',offset:.3},
      {boxShadow:'0 0 0 0 rgba(49,90,73,0)'},
    ],{duration:420});
  }
  function serviceChange(event) {
    clearPriceObserver();
    if(!enabled) return;
    const summary=event.target.querySelector('[data-request-price-summary]');
    if(!summary||summary.hidden) return;
    const bounds=summary.getBoundingClientRect();
    if(bounds.top<view.innerHeight&&bounds.bottom>0) { showPriceFeedback(summary); return; }
    if(!view.IntersectionObserver) return;
    priceObserver=new view.IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)) { clearPriceObserver(); showPriceFeedback(summary); }
    },{threshold:.5});
    priceObserver.observe(summary);
    priceTimer=view.setTimeout(clearPriceObserver,2000);
  }
  function menuChange() {
    const menu=doc.querySelector('#mobile-menu');
    if(menu&&!menu.hidden) run(menu,[{opacity:.7},{opacity:1}],{duration:140});
  }
  const menuButton=doc.querySelector('.menu-toggle');
  const menuObserver=menuButton&&view.MutationObserver?new view.MutationObserver(menuChange):null;
  menuObserver?.observe(menuButton,{attributes:true,attributeFilter:['aria-expanded']});
  button?.addEventListener('click',toggle);
  reduced.addEventListener('change',update);
  wide.addEventListener('change',wideChange);
  doc.addEventListener('next:tabchange',tabChange);
  doc.addEventListener('next:servicechange',serviceChange);
  update();
  return {
    get enabled(){return enabled;},
    destroy(){
      enabled=false; root.dataset.nextMotion='off'; stop();
      menuObserver?.disconnect();
      button?.removeEventListener('click',toggle);
      reduced.removeEventListener('change',update);
      wide.removeEventListener('change',wideChange);
      doc.removeEventListener('next:tabchange',tabChange);
      doc.removeEventListener('next:servicechange',serviceChange);
    },
  };
}

if(typeof document!=='undefined'&&typeof window!=='undefined') initNextMotion();
