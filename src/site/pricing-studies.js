// A small, shareable comparison of this section only; other blocks stay fixed.
const pricingStudy=document.querySelector('[data-pricing-studies]:not([data-pricing-fixed])');
if(pricingStudy){
  const tabs=[...pricingStudy.querySelectorAll('[data-pricing-choice]')];
  const panels=[...pricingStudy.querySelectorAll('[data-pricing-panel]')];
  const name=pricingStudy.querySelector('[data-pricing-title]');
  function choosePricing(value,{focus=false,share=false}={}){
    const selected=tabs.find(tab=>tab.dataset.pricingChoice===String(value))??tabs[0];
    const choice=selected.dataset.pricingChoice;
    for(const tab of tabs){
      const current=tab===selected;
      tab.setAttribute('aria-selected',String(current));
      tab.tabIndex=current?0:-1;
    }
    for(const panel of panels)panel.hidden=panel.dataset.pricingPanel!==choice;
    pricingStudy.dataset.pricingDesign=choice;
    if(name)name.textContent=selected.dataset.pricingName;
    if(focus)selected.focus({preventScroll:true});
    if(share){
      const url=new URL(location.href);
      url.searchParams.set('pricing',choice);
      history.replaceState(null,'',url);
    }
    // Newly visible pencil drawings join the existing viewport animation pass.
    dispatchEvent(new Event('resize'));
  }
  pricingStudy.addEventListener('click',event=>{
    const tab=event.target.closest('[data-pricing-choice]');
    if(tab&&pricingStudy.contains(tab))choosePricing(tab.dataset.pricingChoice,{share:true});
  });
  pricingStudy.addEventListener('keydown',event=>{
    const tab=event.target.closest('[data-pricing-choice]');
    if(!tab)return;
    const index=tabs.indexOf(tab);
    let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next===undefined)return;
    event.preventDefault();
    choosePricing(tabs[next].dataset.pricingChoice,{focus:true,share:true});
  });
  const restore=()=>choosePricing(new URLSearchParams(location.search).get('pricing'));
  addEventListener('popstate',restore);
  restore();
}
