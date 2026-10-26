import {mkdir,writeFile,readFile,readdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {trioConcepts} from '../src/trio/catalog.mjs';
import {renderTrioPage} from '../src/trio/pages.mjs';
import {renderTrioGallery} from '../src/trio/gallery.mjs';

export async function buildTrio(dist){
 const folder=path.join(dist,'trio');await mkdir(folder,{recursive:true});
 const hash=createHash('sha256');
 for(const name of ['base.css','support.css','clear.css','home.css','site.js','gallery.css','selection.js'])hash.update(await readFile(path.join(folder,name)));
 const version=hash.digest('hex').slice(0,10);
 const media=createHash('sha256');
 for(const directory of ['previews','screens']){
  let files=[];try{files=await readdir(path.join(folder,directory));}catch(e){if(e.code!=='ENOENT')throw e;}
  for(const filename of files.sort())media.update(await readFile(path.join(folder,directory,filename)));
 }
 const mediaVersion=media.digest('hex').slice(0,10),entries=[];
 async function available(relative){try{await access(path.join(dist,relative));return `${relative}?v=${mediaVersion}`;}catch(e){if(e.code!=='ENOENT')throw e;return null;}}
 for(const c of trioConcepts){
  await writeFile(path.join(folder,`${c.id}.html`),renderTrioPage(c,version));
  entries.push({...c,edition:'trio',collection:'trio',href:`trio/${c.id}.html`,thumbnail:await available(`trio/previews/${c.id}.webp`),screenshots:{desktop:await available(`trio/screens/${c.id}-desktop.webp`),mobile:await available(`trio/screens/${c.id}-mobile.webp`)}});
 }
 await writeFile(path.join(dist,'trio.html'),renderTrioGallery(entries,version));
 return entries;
}
