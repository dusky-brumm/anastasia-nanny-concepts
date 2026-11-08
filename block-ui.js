// Small public-site interactions, without the former design editor runtime.
document.addEventListener('click',event=>{
  for(const menu of document.querySelectorAll('.s-menu[open]')){
    if(!menu.contains(event.target)||event.target.closest('a'))menu.open=false;
  }
  const dialog=document.querySelector('#studio-privacy');
  if(event.target.closest('.s-privacy'))dialog?.showModal();
  if(event.target.closest('[data-close]'))dialog?.close();
  if(event.target===dialog){
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  }
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  for(const menu of document.querySelectorAll('.s-menu[open]')){
    menu.open=false;menu.querySelector('summary').focus({preventScroll:true});
  }
});
