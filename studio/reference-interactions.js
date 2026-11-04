(() => {
  const carousel=document.querySelector('[data-reference-stories]');
  if(!carousel)return;
  const stories=[...carousel.querySelectorAll('[data-reference-story]')];
  const buttons=[...carousel.querySelectorAll('[data-reference-story-button]')];
  function show(index){
    stories.forEach((story,i)=>{story.hidden=i!==index;});
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  carousel.addEventListener('click',event=>{
    const button=event.target.closest('[data-reference-story-button]');
    if(button)show(Number(button.dataset.referenceStoryButton));
  });
  carousel.querySelector('.reference-story-controls').hidden=false;
  show(0);
})();
