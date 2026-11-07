import {readAboutVariant,storyIndex} from './about-model.js?v=4e8461104c';

export function mountAboutSection(){
  const wrapper=document.querySelector('[data-selected-block=about]');
  const pin=wrapper?.querySelector('.about-pin');
  const frame=wrapper?.querySelector('iframe');
  if(!pin||!frame)return;
  const buttons=[...wrapper.querySelectorAll('[data-about-choice]')];
  const label=wrapper.querySelector('[data-about-design-name]');
  const toolbar=document.querySelector('.font-switcher');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let variant=readAboutVariant(location.search),root,lastConfiguration='',distance=0,queued=false,lastIndex=-1;

  const send=(name,detail)=>root?.dispatchEvent(new CustomEvent(name,{detail}));
  function updateScroll(){
    if(!distance||!root)return;
    const top=toolbar.getBoundingClientRect().height;
    const progress=(top-wrapper.getBoundingClientRect().top)/distance;
    const index=storyIndex(progress,4);
    if(index!==lastIndex){lastIndex=index;send('about:scroll',{index});}
  }
  function layout(){
    queued=false;
    if(!root)return;
    const available=innerHeight-toolbar.getBoundingClientRect().height;
    const scroll=variant.id==='3'&&innerWidth>=1000&&available>=740&&!motion.matches;
    root.style.setProperty('--about-stage-height',Math.max(540,available-pin.querySelector('nav').offsetHeight)+'px');
    const configuration=variant.id+':'+scroll;
    if(configuration!==lastConfiguration){
      lastConfiguration=configuration;
      send('about:configure',{variant:variant.id,scroll});
      lastIndex=-1;
    }
    wrapper.classList.toggle('about-scroll-story',scroll);
    distance=scroll?Math.round(Math.min(340,available*.35))*4:0;
    const height=scroll?Math.ceil(pin.getBoundingClientRect().height+distance)+'px':'';
    if(wrapper.style.height!==height)wrapper.style.height=height;
    updateScroll();
  }
  function scheduleLayout(){
    if(queued)return;
    queued=true;requestAnimationFrame(layout);
  }
  function choose(next,{updateUrl=false}={}){
    variant=next;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.aboutChoice===variant.id)));
    label.textContent=variant.name;
    if(updateUrl){
      const url=new URL(location.href);url.searchParams.set('about',variant.id);history.replaceState(null,'',url);
      requestAnimationFrame(()=>wrapper.scrollIntoView({block:'start',behavior:'instant'}));
    }
    scheduleLayout();
  }
  function loaded(){
    root=frame.contentDocument?.querySelector('[data-about-story]');
    if(!root)return;
    lastConfiguration='';lastIndex=-1;
    root.addEventListener('about:selection',event=>{
      if(!distance||event.detail.source!=='manual')return;
      const target=scrollY+wrapper.getBoundingClientRect().top-toolbar.getBoundingClientRect().height+distance*(event.detail.index+.1)/4;
      window.scrollTo({top:target,behavior:'instant'});
    });
    scheduleLayout();
  }
  buttons.forEach(button=>button.addEventListener('click',()=>choose(readAboutVariant('?about='+button.dataset.aboutChoice),{updateUrl:true})));
  frame.addEventListener('load',loaded);
  if(frame.contentDocument?.readyState==='complete')loaded();
  new ResizeObserver(scheduleLayout).observe(pin);
  new ResizeObserver(scheduleLayout).observe(toolbar);
  window.addEventListener('resize',scheduleLayout);
  window.addEventListener('scroll',()=>{if(distance)requestAnimationFrame(updateScroll);},{passive:true});
  window.addEventListener('popstate',()=>choose(readAboutVariant(location.search)));
  motion.addEventListener('change',scheduleLayout);
  choose(variant);
}
