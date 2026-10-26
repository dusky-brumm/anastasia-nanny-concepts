import {initCommonUI} from '../shared-ui.js';
initCommonUI({menuButton:'.menu-toggle',menu:'#mobile-nav'});
// Deterministic screenshots at any viewport; normal pages do not hide content.
const root=document.documentElement;
const capture=new URLSearchParams(location.search).get('capture')==='1';
root.dataset.capture=String(capture);
if(capture){
 let timer;
 const settled=()=>requestAnimationFrame(()=>{root.dataset.captureReady=location.hash||'#top';root.dataset.captureScroll=String(Math.round(scrollY));});
 addEventListener('scroll',()=>{root.dataset.captureScroll='moving';clearTimeout(timer);timer=setTimeout(settled,120);},{passive:true});
 addEventListener('scrollend',settled);addEventListener('resize',settled);addEventListener('hashchange',settled);
 Promise.all([document.fonts.ready,...[...document.querySelectorAll('img[fetchpriority="high"]')].map(img=>img.decode().catch(()=>{}))]).then(settled);
}
