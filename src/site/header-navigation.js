// The sticky wrapper stays in normal flow; only its measured anchor offset changes.
const headerDocument=document.querySelector('[data-block-document="header"]');
const stickyHeader=headerDocument?.querySelector('#header');
if(stickyHeader){
 const links=[...stickyHeader.querySelectorAll('.s-nav a[href^="#"]')];
 const sections=['hero','service','about','process','pricing','reviews','apply','footer']
  .map(id=>document.getElementById(id)).filter(Boolean);
 let queued=false,previousId,previousHeight=0;
 function update(){
  queued=false;
  const height=Math.ceil(stickyHeader.getBoundingClientRect().height);
  if(height!==previousHeight){
   previousHeight=height;
   document.documentElement.style.setProperty('--site-header-height',height+'px');
  }
  headerDocument.dataset.headerScrolled=String(scrollY>8);
  const line=height+Math.min(160,innerHeight*.2);
  let currentId;
  for(const section of sections){
   if(section.getBoundingClientRect().top>line)break;
   currentId=section.id;
  }
  if(currentId===previousId)return;
  previousId=currentId;
  for(const link of links){
   if(link.getAttribute('href')==='#'+currentId)link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  }
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 addEventListener('hashchange',schedule);
 addEventListener('pageshow',schedule);
 new ResizeObserver(schedule).observe(stickyHeader);
 schedule();
}
