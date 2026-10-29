import {getFavorites,initFavorites} from '../preferences.js?v=2';

const cards=[...document.querySelectorAll('[data-design-id]')];
const previewButtons=[...document.querySelectorAll('[data-preview]')];
const favoriteFilter=document.querySelector('[data-favorites-only]');
const queryMode=new URLSearchParams(location.search).get('view');
let mode=queryMode==='mobile'||queryMode==='desktop'?queryMode:(matchMedia('(max-width:600px)').matches?'mobile':'desktop');
let favoritesOnly=false;

function update() {
  const favorites=new Set(getFavorites());
  let shown=0,saved=0;
  for(const card of cards) {
    const favorite=favorites.has(`next-${card.dataset.designId}`);
    if(favorite) saved++;
    card.hidden=favoritesOnly&&!favorite;
    if(!card.hidden) shown++;
  }
  document.querySelector('[data-favorites-count]').textContent=saved;
  document.querySelector('.gallery-empty').hidden=shown>0;
  document.querySelector('#gallery-status').textContent=`Показано ${shown} из ${cards.length}${favoritesOnly?' · избранное':''}`;
}
function setPreview(value) {
  mode=value;
  document.body.classList.toggle('mobile-previews',mode==='mobile');
  for(const image of document.querySelectorAll('.design-preview img')) image.src=image.dataset[mode];
  for(const button of previewButtons) button.setAttribute('aria-pressed',String(button.dataset.preview===mode));
}
for(const button of previewButtons) button.addEventListener('click',()=>setPreview(button.dataset.preview));
favoriteFilter.addEventListener('click',()=>{
  favoritesOnly=!favoritesOnly;
  favoriteFilter.setAttribute('aria-pressed',String(favoritesOnly));
  update();
});
document.querySelector('[data-show-all]').addEventListener('click',()=>{
  favoritesOnly=false; favoriteFilter.setAttribute('aria-pressed','false'); update();
});
window.addEventListener('favoriteschange',update);
window.addEventListener('storage',update);
initFavorites(); setPreview(mode); update();
