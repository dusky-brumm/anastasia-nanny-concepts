import {selection} from './catalog.mjs';

export function selectionToolbar(concept){
  const index=selection.findIndex(item=>item.id===concept.id);
  if(index<0)return '';
  const choice=selection[index],previous=selection[(index+selection.length-1)%selection.length],next=selection[(index+1)%selection.length];
  return `<nav class="selection-bar" data-review-ui aria-label="Просмотр 12 отобранных дизайнов"><a class="selection-back" href="../collection.html#card-${choice.id}">← Галерея 12 дизайнов</a><div class="selection-switch"><a href="../${previous.href}" aria-label="Предыдущий дизайн: ${previous.name}">←</a><span>${String(index+1).padStart(2,'0')} / 12 · ${choice.name}</span><a href="../${next.href}" aria-label="Следующий дизайн: ${next.name}">→</a></div><button type="button" data-favorite-id="${choice.id}" data-favorite-name="${choice.name}" aria-pressed="false">♡ В избранное</button></nav>`;
}
