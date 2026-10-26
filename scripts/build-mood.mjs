import {mkdir,writeFile,readFile,readdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {moodConcepts} from '../src/mood/catalog.mjs';
import {renderMoodPage} from '../src/mood/pages.mjs';
import {renderMoodGallery} from '../src/mood/gallery.mjs';

export async function buildMood(dist){
 const folder=path.join(dist,'mood');await mkdir(folder,{recursive:true});
 const hash=createHash('sha256');
 for(const name of ['common.css','leaf.css','day.css','veranda.css','site.js','gallery.css','selection.js'])hash.update(await readFile(path.join(folder,name)));
 const version=hash.digest('hex').slice(0,10),media=createHash('sha256');
 for(const directory of ['previews','screens']){
  let files=[];try{files=await readdir(path.join(folder,directory));}catch(e){if(e.code!=='ENOENT')throw e;}
  for(const filename of files.sort())media.update(await readFile(path.join(folder,directory,filename)));
 }
 const mediaVersion=media.digest('hex').slice(0,10),entries=[];
 async function available(relative){try{await access(path.join(dist,relative));return `${relative}?v=${mediaVersion}`;}catch(e){if(e.code!=='ENOENT')throw e;return null;}}
 for(const c of moodConcepts){
  await writeFile(path.join(folder,`${c.id}.html`),renderMoodPage(c,version));
  entries.push({...c,edition:'mood',collection:'mood',href:`mood/${c.id}.html`,thumbnail:await available(`mood/previews/${c.id}.webp`),screenshots:{desktop:await available(`mood/screens/${c.id}-desktop.webp`),mobile:await available(`mood/screens/${c.id}-mobile.webp`)}});
 }
 await writeFile(path.join(dist,'mood.html'),renderMoodGallery(entries,version));
 return entries;
}
