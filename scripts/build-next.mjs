import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {designs} from '../src/next/catalog.mjs';
import {renderGallery} from '../src/next/gallery.mjs';

export async function buildNext(dist) {
  const uiVersion=createHash('sha256').update(await readFile(path.join(dist,'shared-ui.js'))).digest('hex').slice(0,10);
  const scriptPath=path.join(dist,'next','site.js');
  const script=await readFile(scriptPath,'utf8');
  const updatedScript=script.replace(/from '\.\.\/shared-ui\.js(?:\?v=[a-f0-9]+)?'/,`from '../shared-ui.js?v=${uiVersion}'`);
  if(updatedScript!==script) await writeFile(scriptPath,updatedScript);
  const hash=createHash('sha256');
  for(const file of ['base.css','fonts.css','site.js','gallery.css','gallery.js',...designs.map(design=>`${design.id}.css`)]) {
    hash.update(file).update(await readFile(path.join(dist,'next',file)));
  }
  for(const file of ['catalog.mjs','common.mjs','gallery.mjs',...designs.map(design=>`${design.id}.mjs`)]) {
    hash.update(file).update(await readFile(new URL(`../src/next/${file}`,import.meta.url)));
  }
  for(const folder of ['previews','screens']) {
    let names=[];
    try { names=await readdir(path.join(dist,'next',folder)); }
    catch(error) { if(error.code!=='ENOENT') throw error; }
    for(const name of names.sort()) hash.update(name).update(await readFile(path.join(dist,'next',folder,name)));
  }
  const version=hash.digest('hex').slice(0,10);
  for(const design of designs) {
    const {render}=await import(`../src/next/${design.id}.mjs`);
    await writeFile(path.join(dist,design.href),render(version).replace(/[ \t]+$/gm,''));
  }
  await writeFile(path.join(dist,'next.html'),renderGallery(version));
  console.log('Built five new complete designs and their desktop/mobile comparison gallery.');
  return {version,designs};
}
