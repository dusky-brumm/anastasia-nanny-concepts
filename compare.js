import entries from './studio/catalog.js?v=2ecb0f95b9';

const byId=new Map(entries.map(entry=>[entry.id,entry]));
const params=new URLSearchParams(location.search);
const chosen={left:byId.get(params.get('left'))||entries[0],right:byId.get(params.get('right'))||entries[1]||entries[0]};
if(chosen.left.id===chosen.right.id)chosen.right=entries.find(entry=>entry.id!==chosen.left.id)||chosen.right;

function updatePane(side) {
  const entry=chosen[side];
  const selector=document.querySelector(`[data-pane-choice="${side}"]`);
  selector.value=entry.id;
  const frame=document.querySelector(`[data-pane="${side}"]`);
  const url=new URL(entry.href,location.href);
  url.searchParams.set('embed','1');
  if(frame.getAttribute('src')!==url.href)frame.src=url.href;
  frame.title=`Вариант ${entry.name}`;
  document.querySelector(`[data-pane-link="${side}"]`).href=entry.href;
}
function updateUrl() {
  const url=new URL(location.href);
  url.searchParams.set('left',chosen.left.id);url.searchParams.set('right',chosen.right.id);
  history.replaceState(null,'',url);
}
document.querySelectorAll('[data-pane-choice]').forEach(select=>select.addEventListener('change',()=>{
  const side=select.dataset.paneChoice;
  const other=side==='left'?'right':'left';
  const next=byId.get(select.value);
  if(!next)return;
  if(next.id===chosen[other].id)chosen[other]=chosen[side];
  chosen[side]=next;
  updatePane('left');updatePane('right');updateUrl();
}));
document.querySelectorAll('[data-preview-size]').forEach(button=>button.addEventListener('click',()=>{
  document.body.dataset.previewSize=button.dataset.previewSize;
  document.querySelectorAll('[data-preview-size]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
}));
document.querySelector('[data-copy-comparison]').addEventListener('click',async()=>{
  const status=document.querySelector('#compare-status');
  try{await navigator.clipboard.writeText(location.href);status.textContent='Ссылка на эту пару скопирована.';}
  catch{status.textContent='Не удалось скопировать автоматически. Скопируйте адрес из строки браузера.';}
});
updatePane('left');updatePane('right');updateUrl();
