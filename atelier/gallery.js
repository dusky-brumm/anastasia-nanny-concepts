import {getFavorites,initFavorites} from '../preferences.js?v=2';
const cards=[...document.querySelectorAll('[data-design-id]')];
let family='all',favoritesOnly=false;
const favoriteButton=document.querySelector('[data-favorites-view]');
function update(){
 const saved=new Set(getFavorites());let shown=0;
 for(const card of cards){const visible=(family==='all'||card.dataset.family===family)&&(!favoritesOnly||saved.has(card.dataset.designId));card.hidden=!visible;if(visible)shown++;}
 document.querySelector('#filter-status').textContent=`Показано ${shown} из 6 вариантов${favoritesOnly?' · избранное':''}`;
 document.querySelector('[data-favorites-count]').textContent=cards.filter(c=>saved.has(c.dataset.designId)).length;
 document.querySelector('.empty').hidden=shown>0;
}
for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{family=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));update();});
favoriteButton.addEventListener('click',()=>{favoritesOnly=!favoritesOnly;favoriteButton.setAttribute('aria-pressed',String(favoritesOnly));update();});
document.querySelector('[data-reset]').addEventListener('click',()=>{family='all';favoritesOnly=false;favoriteButton.setAttribute('aria-pressed','false');document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));update();});
window.addEventListener('favoriteschange',update);window.addEventListener('storage',update);initFavorites();update();
