import {comparisonPalettes} from './model.js';

export function applyComparisonPalette(doc,id) {
  const theme=comparisonPalettes.find(palette=>palette.id===id);
  const root=doc.documentElement;
  const colors=theme?{
    paper:theme.paper,blue:theme.wash,soft:theme.soft,ink:theme.ink,
    muted:theme.accent,button:theme.button??theme.ink,rose:theme.wine,
    backing:theme.backing??theme.ink,
  }:null;
  root.toggleAttribute('data-comparison-palette',Boolean(theme));
  for(const key of ['paper','blue','soft','ink','muted','button','rose','backing']){
    if(colors)root.style.setProperty('--compare-'+key,colors[key]);
    else root.style.removeProperty('--compare-'+key);
  }
}

export function addPaletteSelect(holder,onChange) {
  const label=document.createElement('label');
  label.className='comparison-theme';
  label.textContent='Палитра ';
  const select=document.createElement('select');
  select.add(new Option('Исходная',''));
  for(const theme of comparisonPalettes)select.add(new Option(theme.name,theme.id));
  select.value=new URLSearchParams(location.search).get('palette')??'';
  if(select.selectedIndex<0)select.value='';
  select.addEventListener('change',()=>onChange(select.value));
  label.append(select);
  holder.append(label);
  return select;
}

export function setPaletteUrl(url,palette) {
  if(palette)url.searchParams.set('palette',palette);
  else url.searchParams.delete('palette');
  return url;
}

export function visibleSection(doc,edge=32) {
  return [...doc.querySelectorAll('main section[id]')].find(section=>section.getBoundingClientRect().bottom>edge)?.id??'';
}

export function mountPagePalette(holder,bar) {
  const initial=new URLSearchParams(location.search).get('palette');
  applyComparisonPalette(document,initial);
  if(!holder||!bar)return;
  const select=addPaletteSelect(bar,palette=>{
    applyComparisonPalette(document,palette);
    history.replaceState(null,'',setPaletteUrl(new URL(location.href),palette));
  });
  bar.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    const url=setPaletteUrl(new URL(link.href),select.value);
    if(link.closest('nav'))url.hash=visibleSection(document,holder.getBoundingClientRect().bottom+32);
    link.href=url.href;
  }));
}
