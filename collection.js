import entries from './studio/catalog.js?v=616144d250';
import { getFavorites, initFavorites } from './preferences.js';

const cards = [...document.querySelectorAll('[data-card-id]')];
const search = document.querySelector('#design-search');
const category = document.querySelector('#category-filter');
const favoriteView = document.querySelector('[data-favorites-view]');
const collectionButtons = [...document.querySelectorAll('[data-collection-filter]')];
const comparison = new Set();
let collection = 'all';
let favoritesOnly = false;

function filterCards() {
  const saved = new Set(getFavorites());
  const query = search.value.trim().toLocaleLowerCase('ru');
  let visible = 0;
  cards.forEach(card=>{
    const show = (collection==='all'||card.dataset.collection===collection)
      && (category.value==='all'||card.dataset.category===category.value)
      && (!favoritesOnly||saved.has(card.dataset.cardId))
      && card.dataset.search.toLocaleLowerCase('ru').includes(query);
    card.hidden = !show;
    if(show)visible++;
  });
  document.querySelector('#filter-status').textContent = `Показано ${visible} из ${cards.length} направлений${favoritesOnly?' · избранное':''}`;
  document.querySelector('.empty-state').hidden = visible>0;
  document.querySelector('[data-favorites-count]').textContent = saved.size;
}
function resetFilters() {
  search.value=''; category.value='all'; collection='all'; favoritesOnly=false;
  favoriteView.setAttribute('aria-pressed','false');
  collectionButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.collectionFilter==='all')));
  filterCards();
}
search.addEventListener('input',filterCards);
category.addEventListener('change',filterCards);
collectionButtons.forEach(button=>button.addEventListener('click',()=>{
  collection=button.dataset.collectionFilter;
  collectionButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  filterCards();
}));
favoriteView.addEventListener('click',()=>{
  favoritesOnly=!favoritesOnly;
  favoriteView.setAttribute('aria-pressed',String(favoritesOnly));
  filterCards();
});
document.querySelector('[data-reset-filters]').addEventListener('click',resetFilters);
window.addEventListener('favoriteschange',filterCards);
window.addEventListener('storage',filterCards);

function updateComparison() {
  const ids=[...comparison];
  const selected=ids.map(id=>entries.find(entry=>entry.id===id));
  const open=document.querySelector('[data-open-comparison]');
  open.setAttribute('aria-disabled',String(ids.length!==2));
  open.href=ids.length===2?`compare.html?left=${ids[0]}&right=${ids[1]}`:'compare.html';
  document.querySelector('[data-compare-label]').textContent=selected.length?selected.map(entry=>entry.name).join(' + '):'Выберите два варианта для сравнения';
  document.querySelector('[data-clear-comparison]').hidden=ids.length===0;
  document.querySelectorAll('[data-compare-id]').forEach(input=>{input.checked=comparison.has(input.dataset.compareId);});
}
document.querySelectorAll('[data-compare-id]').forEach(input=>input.addEventListener('change',()=>{
  const id=input.dataset.compareId;
  if(input.checked&&comparison.size>=2){input.checked=false;document.querySelector('#comparison-status').textContent='Для сравнения выберите два варианта. Сначала снимите один из выбранных.';return;}
  if(input.checked)comparison.add(id);else comparison.delete(id);
  updateComparison();
}));
document.querySelector('[data-clear-comparison]').addEventListener('click',()=>{comparison.clear();updateComparison();});
document.querySelector('[data-open-comparison]').addEventListener('click',event=>{if(comparison.size!==2){event.preventDefault();document.querySelector('#comparison-status').textContent='Отметьте два варианта для сравнения.';}});
initFavorites();
filterCards();
updateComparison();
