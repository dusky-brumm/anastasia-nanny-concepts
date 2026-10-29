import {initFavorites} from '../preferences.js?v=2';
initFavorites();
const selected=new Set(),checks=[...document.querySelectorAll('[data-trio-compare]')];
const link=document.getElementById('pair-open'),label=document.getElementById('pair-label'),status=document.getElementById('pair-status');
checks.forEach(input=>input.addEventListener('change',()=>{
 if(input.checked&&selected.size===2){input.checked=false;status.textContent='Сначала снимите один из двух выбранных дизайнов.';return;}
 if(input.checked)selected.add(input.dataset.trioCompare);else selected.delete(input.dataset.trioCompare);
 const ids=[...selected];link.setAttribute('aria-disabled',String(ids.length!==2));link.href=ids.length===2?`compare.html?left=${ids[0]}&right=${ids[1]}`:'compare.html';
 label.textContent=ids.length===2?'Два дизайна выбраны':ids.length===1?'Выберите ещё один дизайн':'Выберите два дизайна для сравнения';
}));
link.addEventListener('click',event=>{if(selected.size!==2){event.preventDefault();status.textContent='Отметьте два дизайна в подборке.';}});
