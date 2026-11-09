// The drawing treatment changes; the current photograph and story stay in place.
const sceneSection=document.querySelector('[data-about-scenes]');
if(sceneSection){
 const tabs=[...sceneSection.querySelectorAll('[data-scene-choice]')];
 const title=sceneSection.querySelector('[data-scene-title]');
 const panel=sceneSection.querySelector('#about-scene-panel');
 function chooseScene(value,{focus=false,share=false}={}){
  const selected=tabs.find(tab=>tab.dataset.sceneChoice===String(value))??tabs[0];
  for(const tab of tabs){const active=tab===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  sceneSection.dataset.aboutScene=selected.dataset.sceneChoice;
  title.textContent=selected.dataset.sceneName;
  panel.setAttribute('aria-labelledby',selected.id);
  if(focus)selected.focus({preventScroll:true});
  if(share){const url=new URL(location.href);url.searchParams.set('about',selected.dataset.sceneChoice);history.replaceState(null,'',url);}
  dispatchEvent(new Event('resize'));
 }
 sceneSection.addEventListener('click',event=>{const tab=event.target.closest('[data-scene-choice]');if(tab&&sceneSection.contains(tab))chooseScene(tab.dataset.sceneChoice,{share:true});});
 sceneSection.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-scene-choice]');if(!tab)return;
  const index=tabs.indexOf(tab);
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index-1+tabs.length)%tabs.length:undefined;
  if(next===undefined)return;event.preventDefault();chooseScene(tabs[next].dataset.sceneChoice,{focus:true,share:true});
 });
 const restore=()=>chooseScene(new URLSearchParams(location.search).get('about'));
 addEventListener('popstate',restore);restore();
}
