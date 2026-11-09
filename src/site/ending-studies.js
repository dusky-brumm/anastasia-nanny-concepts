// Independent visual choices share the same form fields and footer links.
for(const study of document.querySelectorAll('[data-ending-study]')){
 const kind=study.dataset.endingStudy;
 const tabs=[...study.querySelectorAll('[data-ending-choice]')];
 const title=study.querySelector('[data-ending-title]');
 const panel=study.querySelector(`#${kind}-study-panel`);
 function chooseEnding(value,{focus=false,share=false}={}){
  const selected=tabs.find(tab=>tab.dataset.endingChoice===String(value))??tabs.find(tab=>tab.dataset.endingChoice===study.dataset.endingDefault)??tabs[0];
  for(const tab of tabs){const active=tab===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  study.dataset.endingDesign=selected.dataset.endingChoice;
  title.textContent=selected.dataset.endingName;
  panel.setAttribute('aria-labelledby',selected.id);
  if(focus)selected.focus({preventScroll:true});
  if(share){const url=new URL(location.href);url.searchParams.set(kind,selected.dataset.endingChoice);history.replaceState(null,'',url);}
  dispatchEvent(new Event('resize'));
 }
 study.addEventListener('click',event=>{const tab=event.target.closest('[data-ending-choice]');if(tab&&study.contains(tab))chooseEnding(tab.dataset.endingChoice,{share:true});});
 study.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-ending-choice]');if(!tab)return;
  const index=tabs.indexOf(tab),last=tabs.length-1;
  const next=event.key==='Home'?0:event.key==='End'?last:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+last)%tabs.length:undefined;
  if(next===undefined)return;event.preventDefault();chooseEnding(tabs[next].dataset.endingChoice,{focus:true,share:true});
 });
 const restore=()=>chooseEnding(new URLSearchParams(location.search).get(kind));
 addEventListener('popstate',restore);restore();
}

// Compare only the drawing; keep the same form and its entered values.
const consultation=document.querySelector('#apply[data-consultation-art]');
if(consultation){
 const choices=[...consultation.querySelectorAll('[data-consultation-choice]')];
 function chooseDrawing(value){
  const selected=choices.find(button=>button.dataset.consultationChoice===String(value))??choices[0];
  consultation.dataset.consultationArt=selected.dataset.consultationChoice;
  for(const button of choices)button.setAttribute('aria-pressed',String(button===selected));
 }
 consultation.addEventListener('click',event=>{
  const button=event.target.closest('[data-consultation-choice]');
  if(!button||!consultation.contains(button))return;
  chooseDrawing(button.dataset.consultationChoice);
  const url=new URL(location.href);
  url.searchParams.set('tea',button.dataset.consultationChoice);
  history.replaceState(null,'',url);
 });
 const restoreDrawing=()=>chooseDrawing(new URLSearchParams(location.search).get('tea'));
 addEventListener('popstate',restoreDrawing);restoreDrawing();
}
