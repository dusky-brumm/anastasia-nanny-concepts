import {cp,mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const source='src/reference',output='out';
const hash=createHash('sha256');
async function fingerprint(directory){for(const name of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(directory,name.name);if(name.isDirectory())await fingerprint(file);else hash.update(file).update(await readFile(file));}}
await fingerprint(source);const version=hash.digest('hex').slice(0,10);
await mkdir(output,{recursive:true});await cp(source,output,{recursive:true});
const html=(await readFile(path.join(source,'index.html'),'utf8')).replaceAll('__VERSION__',version);
await writeFile(path.join(output,'index.html'),html);
await writeFile(path.join(output,'next.html'),'<!doctype html><html lang="ru"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./"><title>Настя — подбор нянь</title><a href="./">Открыть сайт</a></html>');
console.log(JSON.stringify({output,version}));
