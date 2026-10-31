import {initCommonUI} from '../shared-ui.js?v=436430fd89';
initCommonUI({menuButton:'.menu-toggle',menu:'#mobile-menu',menuMinWidth:document.body.classList.contains('next-02-column')?851:1001,telegramUrl:'https://t.me/inyfid'});
let pricingContextVisible=false;

function findServicePlan(serviceKey) {
  if(!serviceKey) return;
  const plans=[...document.querySelectorAll(`[data-service-plan="${serviceKey}"]`)];
  return plans.find(plan=>!plan.hidden&&plan.getClientRects().length)||plans[0];
}

for(const form of document.querySelectorAll('[data-request-form]')) {
  const field=form.elements.namedItem('service');
  const summary=form.querySelector('[data-request-price-summary]');
  if(!field||!summary) continue;
  const conditions=summary.querySelector('[data-view-conditions]');
  const selectedPlan=()=>findServicePlan(field.selectedOptions[0]?.dataset.serviceKey);
  function updateConditions(plan) {
    if(!conditions) return;
    conditions.href=plan?.id&&!plan.closest('[data-tabs]')?`#${plan.id}`:'#pricing';
    conditions.setAttribute('aria-label',`Посмотреть условия: ${field.value}`);
  }
  let previous=field.value;
  function updatePrice() {
    const price=field.selectedOptions[0]?.dataset.price;
    summary.hidden=!price;
    summary.querySelector('[data-request-price]').textContent=price||'';
    updateConditions(selectedPlan());
    if(field.value!==previous) {
      previous=field.value;
      form.dispatchEvent(new CustomEvent('next:servicechange',{bubbles:true}));
    }
  }
  // Tariff buttons announce their prefill on the form; native selects on the field.
  // Updating a name or contact must not repeat the live price announcement.
  form.addEventListener('change',event=>{
    if(event.target===field||event.target===form) updatePrice();
  });
  conditions?.addEventListener('click',()=>{
    const plan=selectedPlan();
    // The reviewer may have resized the browser since choosing a format.
    updateConditions(plan);
    const tab=plan?.id&&document.querySelector(`[role="tab"][aria-controls="${plan.id}"]`);
    if(tab&&tab.getAttribute('aria-selected')!=='true') tab.click();
  });
  updatePrice();
}

// Enhancement only: every example and service remains readable without JS.
for(const group of document.querySelectorAll('[data-tabs]')) {
  const tabs=[...group.querySelectorAll('[role="tab"]')];
  function activate(tab,focus=false,selectService=false) {
    const previous=tabs.find(item=>item.getAttribute('aria-selected')==='true');
    for(const item of tabs) {
      const selected=item===tab;
      item.setAttribute('aria-selected',String(selected));
      item.tabIndex=selected?0:-1;
      const panel=document.getElementById(item.getAttribute('aria-controls'));
      if(panel) { panel.hidden=!selected; panel.inert=!selected; }
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
    if(selectService&&previous!==tab) group.dispatchEvent(new CustomEvent('next:tabchange',{bubbles:true,detail:{panelId:tab.getAttribute('aria-controls')}}));
  }
  for(const [index,tab] of tabs.entries()) {
    tab.addEventListener('click',()=>activate(tab,false,true));
    tab.addEventListener('keydown',event=>{
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey) return;
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

// A shared phone link must resolve to the visible desktop version of its plan.
function alignServiceAnchor({scroll=true,focus=true,revealTab=true}={}) {
  const target=document.getElementById(location.hash.slice(1));
  if(!target?.dataset.servicePlan) return;
  let plan=findServicePlan(target.dataset.servicePlan);
  if(!plan) return;
  let changed=false;
  if(plan.hidden||!plan.getClientRects().length) {
    if(!revealTab) {
      // Resizing follows the current choice instead of reopening an old hash.
      const chosen=plan.closest('[data-tabs]')?.querySelector('[role="tab"][aria-selected="true"]');
      plan=chosen&&document.getElementById(chosen.getAttribute('aria-controls'));
      if(!plan) return;
    } else {
      const tab=document.querySelector(`[role="tab"][aria-controls="${plan.id}"]`);
      if(!tab) return;
      tab.click();
      changed=true;
    }
  }
  if(plan.hidden||!plan.getClientRects().length) return;
  if(plan!==target) {
    const url=new URL(location.href);
    url.hash=plan.id;
    history.replaceState(history.state,'',url.href);
    changed=true;
  }
  const rect=plan.getBoundingClientRect();
  const outside=rect.bottom<=0||rect.y>=innerHeight;
  const needsAlignment=revealTab?changed:outside;
  if(!scroll||!needsAlignment) return;
  const active=document.activeElement;
  const followTab=!focus&&active?.matches('[role="tab"]')&&plan.closest('[data-tabs]')?.contains(active);
  const scrollTarget=followTab?active:plan;
  if(focus) {
    if(!plan.hasAttribute('tabindex')) plan.tabIndex=-1;
    plan.focus({preventScroll:true});
  }
  scrollTarget.scrollIntoView({behavior:'instant',block:'start'});
}
addEventListener('hashchange',()=>alignServiceAnchor());
addEventListener('resize',()=>alignServiceAnchor({
  scroll:pricingContextVisible&&!document.activeElement?.closest('form'),
  focus:false,
  revealTab:false,
}));
alignServiceAnchor();

// Orientation remains available even when all motion is disabled.
const navigationLinks=[...document.querySelectorAll('.site-header nav a[href^="#"]')];
const navigationTargets=[...new Set(navigationLinks.map(link=>link.hash.slice(1)))].map(id=>document.getElementById(id)).filter(Boolean);
let navigationFrame=0;
function updateNavigation() {
  navigationFrame=0;
  let current='';
  const readingLine=Math.min(180,innerHeight*.23);
  for(const section of navigationTargets) if(section.getBoundingClientRect().top<=readingLine) current=section.id;
  for(const link of navigationLinks) {
    if(link.hash===`#${current}`) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  }
  document.documentElement.dataset.currentSection=current||'hero';
  const pricingFocus=document.activeElement?.closest('#pricing');
  const focusRect=pricingFocus&&document.activeElement.getBoundingClientRect();
  pricingContextVisible=current==='pricing'||Boolean(focusRect&&focusRect.bottom>0&&focusRect.y<innerHeight);
}
function scheduleNavigation() { if(!navigationFrame) navigationFrame=requestAnimationFrame(updateNavigation); }
addEventListener('scroll',scheduleNavigation,{passive:true});
addEventListener('focusin',scheduleNavigation);
addEventListener('resize',scheduleNavigation);
addEventListener('hashchange',scheduleNavigation);
document.fonts.ready.then(scheduleNavigation);
scheduleNavigation();

const root=document.documentElement;
const capture=new URLSearchParams(location.search).get('capture')==='1';
root.dataset.capture=String(capture);
if(capture) {
  let timer;
  let assetsReady=false;
  const settled=()=>requestAnimationFrame(()=>{
    if(!assetsReady) return;
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
  const images=[...document.querySelectorAll('img')];
  for(const image of images) image.loading='eager';
  Promise.all([document.fonts.ready,...images.map(image=>image.decode().catch(()=>{}))]).then(()=>{
    root.dataset.captureFonts=JSON.stringify([...document.fonts].filter(font=>font.status==='loaded').map(font=>({family:font.family.replace(/["']/g,''),style:font.style,weight:font.weight})));
    root.dataset.captureFontChecks=JSON.stringify({
      'Golos Text':document.fonts.check('400 16px "Golos Text"','Анастасия Доронина'),
      'Lora':document.fonts.check('400 16px Lora','Найду няню'),
    });
    assetsReady=true;
    settled();
  });
}
