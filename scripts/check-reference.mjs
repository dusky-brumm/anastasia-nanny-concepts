import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root='out';const html=await readFile(path.join(root,'index.html'),'utf8');
for(const filename of ['index.html','routes.html']){
  const content=await readFile(path.join(root,filename),'utf8');
  const matches=[...content.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const ids=new Set(matches);
  if(ids.size!==matches.length)throw Error('Duplicate IDs in '+filename);
  if(/__\w+__/.test(content))throw Error('Unrendered placeholder in '+filename);
  for(const match of content.matchAll(/(?:href|src)="([^"]+)"/g)){
    const url=match[1];if(/^(?:https?:|data:)/.test(url))continue;
    if(url.startsWith('#')){if(!ids.has(url.slice(1)))throw Error('Missing anchor '+url);continue;}
    await stat(path.join(root,url.split('?')[0]));
  }
}
if(!html.includes('Подберу няню')||!html.includes('Маршрут <span>подбора'))throw Error('Missing reference copy');
for(const file of ['styles.css','fonts.css','journeys.css','routes-gallery.css']){const css=await readFile(path.join(root,file),'utf8');if((css.match(/\{/g)||[]).length!==(css.match(/\}/g)||[]).length)throw Error('Unbalanced CSS '+file);for(const match of css.matchAll(/url\(([^)]+)\)/g)){const url=match[1].replaceAll(/["']/g,'');if(!url.startsWith('data:'))await stat(path.join(root,url));}}
execFileSync(process.execPath,['--check',path.join(root,'app.js')]);
execFileSync(process.execPath,['--check',path.join(root,'journeys.js')]);
const files=await readdir(root);if(files.includes('collection.html')||files.includes('atelier'))throw Error('Old gallery in publication');
console.log('PASS: main page and four route options, local assets, unique IDs, anchors, CSS and JavaScript syntax; old galleries excluded.');
