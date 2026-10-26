import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {directions} from '../src/atelier/catalog.mjs';
import {renderGallery} from '../src/atelier/gallery.mjs';

export async function buildAtelier(dist){
 const hash=createHash('sha256');
 for(const name of ['base.css','site.js','gallery.css','gallery.js',...directions.map(d=>`${d.id}.css`)])hash.update(name).update(await readFile(path.join(dist,'atelier',name)));
 for(const folder of ['previews','screens']){
  let names=[];try{names=await readdir(path.join(dist,'atelier',folder));}catch(error){if(error.code!=='ENOENT')throw error;}
  for(const name of names.sort())hash.update(name).update(await readFile(path.join(dist,'atelier',folder,name)));
 }
 const version=hash.digest('hex').slice(0,10);
 for(const d of directions){const {render}=await import(`../src/atelier/${d.id}.mjs`);await writeFile(path.join(dist,d.href),render(version).replace(/[ \t]+$/gm,''));}
 await writeFile(path.join(dist,'atelier.html'),renderGallery(version));
 for(const name of ['restart.html','collection.html']){
  const filename=path.join(dist,name);let html=await readFile(filename,'utf8');
  if(!html.includes('href="atelier.html"'))html=html.replace(/(<header[^>]*>)/,'$1<a href="atelier.html" style="font:600 12px/1.7 Arial,sans-serif;text-decoration:underline;text-underline-offset:3px">Новая серия: шесть вариантов ↗</a>');
  await writeFile(filename,html);
 }
 console.log('Built six complete reference-led layouts with distinct compositions and straight section boundaries.');
 return {version,directions};
}
