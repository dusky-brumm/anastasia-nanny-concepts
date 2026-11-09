// Compare three treatments of the same reviews, preserving the current slide.
const reviewStudy=document.querySelector('[data-review-studies]');
if(reviewStudy){
 const tabs=[...reviewStudy.querySelectorAll('[data-review-choice]')];
 const title=reviewStudy.querySelector('[data-review-title]');
 const panel=reviewStudy.querySelector('#review-style-panel');
 function chooseReview(value,{focus=false,share=false}={}){
  const chosen=tabs.find(tab=>tab.dataset.reviewChoice===String(value))??tabs[0];
  for(const tab of tabs){const active=tab===chosen;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  reviewStudy.dataset.reviewDesign=chosen.dataset.reviewChoice;
  title.textContent=chosen.dataset.reviewName;
  panel.setAttribute('aria-labelledby',chosen.id);
  if(focus)chosen.focus({preventScroll:true});
  if(share){const url=new URL(location.href);url.searchParams.set('reviews',chosen.dataset.reviewChoice);history.replaceState(null,'',url);}
 }
 reviewStudy.addEventListener('click',event=>{const tab=event.target.closest('[data-review-choice]');if(tab&&reviewStudy.contains(tab))chooseReview(tab.dataset.reviewChoice,{share:true});});
 reviewStudy.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-review-choice]');if(!tab)return;
  const index=tabs.indexOf(tab);
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index-1+tabs.length)%tabs.length:undefined;
  if(next===undefined)return;event.preventDefault();chooseReview(tabs[next].dataset.reviewChoice,{focus:true,share:true});
 });
 const restore=()=>chooseReview(new URLSearchParams(location.search).get('reviews'));
 addEventListener('popstate',restore);restore();
}
