import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {render as blue} from '../src/restart/01-blue.mjs';
import {render as sage} from '../src/restart/02-sage.mjs';
import {render as paper} from '../src/restart/03-paper.mjs';
import {renderGallery,designs} from '../src/restart/gallery.mjs';

export async function buildRestart(dist){
 const hash=createHash('sha256');
 for(const file of ['base.css','site.js','gallery.css',...designs.map(d=>`${d.id}.css`)])hash.update(await readFile(path.join(dist,'restart',file)));
 for(const folder of ['previews','screens']){
  let files=[];
  try{files=await readdir(path.join(dist,'restart',folder));}catch(error){if(error.code!=='ENOENT')throw error;}
  for(const file of files.sort())hash.update(await readFile(path.join(dist,'restart',folder,file)));
 }
 const version=hash.digest('hex').slice(0,10);
 for(const [i,render] of [blue,sage,paper].entries())await writeFile(path.join(dist,'restart',`${designs[i].id}.html`),render(version));
 await writeFile(path.join(dist,'restart.html'),renderGallery(version));
 const previousGallery=path.join(dist,'collection.html');
 const previousHtml=await readFile(previousGallery,'utf8');
 if(!previousHtml.includes('href="restart.html"'))await writeFile(previousGallery,previousHtml.replace('<nav aria-label="Галерея">','<nav aria-label="Галерея"><a href="restart.html">Новая серия: три цельных макета ↗</a>'));
 console.log('Built three new cohesive layouts with a 1120px page limit.');
}
