const cards=[...document.querySelectorAll('[data-artwork]')];
const search=document.getElementById('artwork-search');
search.addEventListener('input',()=>{
  const query=search.value.trim().toLocaleLowerCase('ru');
  let visible=0;
  for(const card of cards){card.hidden=!card.dataset.search.includes(query);if(!card.hidden)visible++;}
  for(const group of document.querySelectorAll('[data-art-group]'))group.hidden=!group.querySelector('[data-artwork]:not([hidden])');
  document.getElementById('artwork-count').textContent=`${visible} из ${cards.length} элементов`;
  document.querySelector('.empty').hidden=visible>0;
});
for(const button of document.querySelectorAll('button[data-background]'))button.addEventListener('click',()=>{
  document.body.dataset.background=button.dataset.background;
  for(const option of document.querySelectorAll('button[data-background]'))option.setAttribute('aria-pressed',String(option===button));
});
