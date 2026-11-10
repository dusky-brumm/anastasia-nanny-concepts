// Only the guestbook illustration changes; the review carousel stays in place.
const bookRoot=document.querySelector('#reviews .review-book');
if(bookRoot){
  const options=[...bookRoot.querySelectorAll('[data-review-book-option]')];
  const choices=[...bookRoot.querySelectorAll('[data-review-book]')];
  const fromUrl=()=>new URLSearchParams(location.search).get('book')??'1';
  function selectBook(value,replay=false){
    const selected=options.find(option=>option.dataset.reviewBookOption===value)??options[0];
    if(!selected)return;
    for(const option of options)option.hidden=option!==selected;
    for(const button of choices)button.setAttribute('aria-pressed',String(button.dataset.reviewBook===selected.dataset.reviewBookOption));
    bookRoot.dataset.selectedBook=selected.dataset.reviewBookOption;
    if(replay)document.dispatchEvent(new CustomEvent('review:bookchange',{detail:{root:selected}}));
  }
  for(const button of choices)button.addEventListener('click',()=>{
    selectBook(button.dataset.reviewBook,true);
    const url=new URL(location.href);url.searchParams.set('book',bookRoot.dataset.selectedBook);
    history.replaceState(null,'',url);
  });
  addEventListener('popstate',()=>selectBook(fromUrl(),true));
  selectBook(fromUrl());
  bookRoot.querySelector('.review-book-choices').hidden=false;
}
