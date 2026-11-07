// One-time, idempotent export of drawings originally embedded in CSS data URLs.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const catalogPath='src/site/artwork-catalog.json';
const catalog=JSON.parse(await readFile(catalogPath,'utf8'));
const seen=new Set();
let index=0;
await mkdir('src/site/artwork/css-drawings',{recursive:true});
async function extract(directory){
  for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()){await extract(file);continue;}
    if(!file.endsWith('.css'))continue;
    const css=await readFile(file,'utf8');
    for(const [,quote,encoded] of css.matchAll(/url\((["'])data:image\/svg\+xml,([\s\S]*?)\1\)/g)){
      const svg=decodeURIComponent(encoded)+'\n';
      const sha256=createHash('sha256').update(svg).digest('hex');
      if(seen.has(sha256))continue;
      seen.add(sha256);index++;
      const name=`css-drawings/element-${String(index).padStart(2,'0')}.svg`;
      const destination='artwork/'+name;
      await writeFile('src/site/'+destination,svg);
      if(!catalog.some(item=>item.file===destination))catalog.push({id:'css-'+index,file:destination,title:`Меловая линия или фактура ${index}`,group:'Линии и фактуры из оформления',source:file.replaceAll('\\','/'),sha256});
    }
  }
}
await extract('src/reference');
await writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({cssDrawings:index,total:catalog.length}));
