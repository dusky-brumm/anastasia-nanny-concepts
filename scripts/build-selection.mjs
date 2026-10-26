import {readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {selectEntries} from '../src/selection/catalog.mjs';
import {selectionToolbar} from '../src/selection/toolbar.mjs';
import {renderSelectionGallery} from '../src/selection/gallery.mjs';

// Replace a generated review panel, including nested divs, without touching site content.
export function replaceReviewPanel(html,panel){
 const match=/<div class="(?:review-toolbar|design-bar)"[^>]*>/.exec(html);
 if(!match)throw new Error('Missing generated review panel');
 const tags=/<\/?div\b[^>]*>/g;
 tags.lastIndex=match.index;
 let depth=0,tag;
 while((tag=tags.exec(html))){
  depth+=tag[0].startsWith('</')?-1:1;
  if(depth===0)return html.slice(0,match.index)+panel+html.slice(tags.lastIndex);
 }
 throw new Error('Unclosed generated review panel');
}

async function htmlFiles(folder){
 const result=[];
 for(const file of await readdir(folder,{withFileTypes:true})){
  const name=path.join(folder,file.name);
  if(file.isDirectory())result.push(...await htmlFiles(name));
  else if(file.name.endsWith('.html'))result.push(name);
 }
 return result;
}

export async function buildSelection(dist,entries){
 const selected=selectEntries(entries);
 const selectedIds=new Set(selected.map(entry=>entry.id));
 const hash=createHash('sha256');
 for(const name of ['collection.js','selection/gallery.css','selection/review.css'])hash.update(await readFile(path.join(dist,name)));
 for(const folder of ['previews','screens']){
  for(const name of (await readdir(path.join(dist,'selection',folder))).sort())hash.update(await readFile(path.join(dist,'selection',folder,name)));
 }
 const version=hash.digest('hex').slice(0,10);
 await writeFile(path.join(dist,'collection.html'),renderSelectionGallery(selected,{version}));
 await writeFile(path.join(dist,'all.html'),renderSelectionGallery(entries,{archive:true,version}));
 const reviewHash=createHash('sha256').update(await readFile(path.join(dist,'selection/review.css'))).digest('hex').slice(0,10);
 for(const entry of selected){
  const filename=path.join(dist,entry.href);
  let html=await readFile(filename,'utf8');
  html=replaceReviewPanel(html,selectionToolbar(entry));
  html=html.replace('</head>',`<link rel="stylesheet" href="../selection/review.css?v=${reviewHash}"></head>`);
  await writeFile(filename,html);
 }
 // Keep saved gallery URLs useful, with a clear way back to the shortlist.
 for(const name of ['mood.html','trio.html','fresh.html','archive.html','screenshots.html']){
  const filename=path.join(dist,name);
  let html=await readFile(filename,'utf8');
  html=html.replace(/(<nav[^>]*>)/, '$1<a href="collection.html" class="shortlist-return">← 12 отобранных дизайнов</a>');
  html=html.replace('</head>',`<link rel="stylesheet" href="selection/review.css?v=${reviewHash}"></head>`);
  await writeFile(filename,html);
 }
 // Hash every local HTML entry point's stylesheet/script; retain existing query params.
 for(const filename of await htmlFiles(dist)){
  let html=await readFile(filename,'utf8');
  html=html.replace(/((?:\.\.\/)?)(collection\.html)(#card-(\d{2}-[a-z]+))/g,(match,prefix,page,fragment,id)=>selectedIds.has(id)?match:`${prefix}all.html${fragment}`);
  html=html.replace(/(<a href="(?:\.\.\/)?all\.html#card-[^"]+">)[^<]+(<\/a>)/g,'$1← Архив всех версий$2');
  html=html.replace(/(<a href="(?:\.\.\/)?collection\.html">)([^<]*15[^<]*)(<\/a>)/g,'$1← 12 отобранных$3');
  const references=[...html.matchAll(/(?:src|href)="([^"#]+\.(?:css|js)(?:\?[^"#]*)?)"/g)];
  for(const [match,reference] of references){
   if(/^(?:https?:)?\/\//.test(reference))continue;
   const [pathname,query='']=reference.split('?');
   const asset=path.resolve(path.dirname(filename),pathname);
   const digest=createHash('sha256').update(await readFile(asset)).digest('hex').slice(0,10);
   const params=new URLSearchParams(query);params.set('v',digest);
   html=html.replace(match,match.replace(reference,`${pathname}?${params}`));
  }
  await writeFile(filename,html);
 }
 console.log(`Selected ${selected.length} distinct designs for collection.html; all ${entries.length} versions remain in all.html.`);
 return selected;
}
