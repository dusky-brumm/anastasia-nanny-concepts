document.addEventListener('click',event=>{
  const dialog=document.getElementById('studio-privacy');
  if(event.target.closest('[data-close]'))dialog.close();
  if(event.target===dialog){
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  }
});
// Frame heights settle after their fonts and images load. Restore deep links then.
window.addEventListener('load',()=>{
  const target=document.getElementById(location.hash.slice(1));
  if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
});
