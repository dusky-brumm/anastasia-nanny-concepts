import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root='out';const html=await readFile(path.join(root,'index.html'),'utf8');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const url=match[1];if(/^(?:https?:|data:)/.test(url))continue;if(url.startsWith('#')){if(!ids.has(url.slice(1)))throw Error('Missing anchor '+url);continue;}await stat(path.join(root,url.split('?')[0]));}
if(!html.includes('Подберу няню')||!html.includes('Маршрут <span>подбора'))throw Error('Missing reference copy');
for(const file of ['styles.css','fonts.css']){const css=await readFile(path.join(root,file),'utf8');if((css.match(/\{/g)||[]).length!==(css.match(/\}/g)||[]).length)throw Error('Unbalanced CSS '+file);for(const match of css.matchAll(/url\(([^)]+)\)/g)){const url=match[1].replaceAll(/["']/g,'');if(!url.startsWith('data:'))await stat(path.join(root,url));}}
execFileSync(process.execPath,['--check',path.join(root,'app.js')]);
const files=await readdir(root);if(files.includes('collection.html')||files.includes('atelier'))throw Error('Old gallery in publication');
console.log('PASS: reference page, local assets, menu anchors, CSS and JavaScript syntax; old galleries excluded.');
