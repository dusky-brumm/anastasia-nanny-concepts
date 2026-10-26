import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { concepts } from '../src/studio/catalog.mjs';
import { heroes } from '../src/studio/heroes.mjs';
import { curatedConcepts } from '../src/curated/catalog.mjs';
import { freshConcepts } from '../src/fresh/catalog.mjs';
import { trioConcepts } from '../src/trio/catalog.mjs';
import { palette,contrast } from '../src/curated/page.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const htmlCheck=spawnSync('python',[path.join(root,'scripts','validate_site.py')],{cwd:root,encoding:'utf8'});
process.stdout.write(htmlCheck.stdout||'');
process.stderr.write(htmlCheck.stderr||'');
if(htmlCheck.status!==0)process.exit(htmlCheck.status||1);

assert.equal(concepts.length,20,'The full objective requires twenty additional directions.');
assert.equal(new Set(concepts.map(item=>item.id)).size,20,'Concept IDs must be unique.');
assert.deepEqual(concepts.map(item=>item.number),Array.from({length:20},(_,index)=>index+7));
const signature=['hero','about','approach','route','reviews','pricing'];
for(let a=0;a<concepts.length;a++)for(let b=a+1;b<concepts.length;b++){
  const differences=signature.filter(key=>concepts[a][key]!==concepts[b][key]).length;
  assert.ok(differences>=3,`${concepts[a].id} and ${concepts[b].id} need more structural differences.`);
}
const available=concepts.filter(item=>typeof heroes[item.hero]==='function');
assert.equal(curatedConcepts.length,15,'The new collection must contain fifteen finalists.');
assert.equal(new Set(curatedConcepts.map(item=>item.hero)).size,15,'Finalist hero compositions must be distinct.');
assert.equal(new Set(curatedConcepts.map(item=>item.paletteName)).size,15,'Finalist palettes must be distinct.');
const requiredOrder=['header','hero','service','about','process','pricing','reviews','request','footer'];
assert.equal(trioConcepts.length,3);
assert.equal(new Set(trioConcepts.map(c=>c.theme)).size,3);
for(const c of trioConcepts){
 const html=await readFile(path.join(root,'dist','trio',`${c.id}.html`),'utf8');
 const text=html.replace(/<br\s*\/?>/g,' ').replace(/<[^>]*>/g,'').replace(/\s+/g,' ');
 assert.deepEqual([...html.matchAll(/data-section="([a-z]+)"/g)].map(m=>m[1]),requiredOrder,`${c.id}: nine-block sequence`);
 for(const value of ['25 000','5 500','6 месяцев','2022','data-request-form','Телефон или Telegram','Готовы обсудить подбор?'])assert.ok((value==='data-request-form'?html:text).includes(value),`${c.id}: missing ${value}`);
 assert.ok(/не ограничено/i.test(text),`${c.id}: unlimited candidates`);
 assert.ok(html.includes(`${c.theme}.css`),`${c.id}: independent stylesheet`);
 assert.ok(!/fresh\.css|heroes\.css|final\.css|polish\.css/.test(html),`${c.id}: earlier presentation styles are not used`);
}
assert.equal(freshConcepts.length,6);
assert.equal(new Set(freshConcepts.map(c=>c.layout)).size,6);
for(const c of freshConcepts){
  const html=await readFile(path.join(root,'dist','fresh',`${c.id}.html`),'utf8');
  assert.deepEqual([...html.matchAll(/data-section="([a-z]+)"/g)].map(m=>m[1]),requiredOrder,`${c.id}: nine-block sequence`);
  for(const text of ['Готовы обсудить подбор?','25 000','5 500','6 месяцев','Количество кандидатов не ограничено.','data-request-form','Telegram Анастасии'])assert.ok(html.includes(text),`${c.id}: missing ${text}`);
  for(const bg of [c.paper,c.soft,c.panel])assert.ok(contrast(c.ink,bg)>=4.5,`${c.id}: body contrast`);
  assert.ok(contrast(c.accent,'#ffffff')>=4.5,`${c.id}: button contrast`);
  assert.ok(!html.includes('final.css')&&!html.includes('heroes.css'),`${c.id}: independently styled`);
}
for(const concept of curatedConcepts){
  const html=await readFile(path.join(root,'dist','final',`${concept.id}.html`),'utf8');
  assert.deepEqual([...html.matchAll(/data-section="([a-z]+)"/g)].map(item=>item[1]),requiredOrder,`${concept.id}: required nine-block sequence`);
  for(const text of ['Готовы обсудить подбор?','25 000','5 500','6 месяцев','Количество кандидатов не ограничено.','data-request-form','Telegram Анастасии'])assert.ok(html.includes(text),`${concept.id}: missing ${text}`);
  const colors=palette(concept);
  for(const background of [colors.paper,colors.soft,colors.panel]){
    assert.ok(contrast(colors.ink,background)>=4.5,`${concept.id}: body contrast`);
    assert.ok(contrast(colors.muted,background)>=4.5,`${concept.id}: secondary text contrast`);
  }
  assert.ok(contrast(colors.accent,colors['on-accent'])>=4.5,`${concept.id}: button contrast`);
}
for(const concept of available){
  const html=await readFile(path.join(root,'dist','studio',`${concept.id}.html`),'utf8');
  for(const requirement of ['ВОВЛЕЧЁННЫЙ ПОДБОР','ПРИВЕТ, Я НАСТЯ','25 000','5 500','6 месяцев','Неограниченное количество кандидатов','name="service"','data-request-form'])assert.ok(html.includes(requirement),`${concept.id}: missing ${requirement}`);
}
async function checkJavaScript(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const filename=path.join(directory,entry.name);
    if(entry.isDirectory())await checkJavaScript(filename);
    else if(entry.name.endsWith('.js')){
      const result=spawnSync(process.execPath,['--check',filename],{encoding:'utf8'});
      assert.equal(result.status,0,result.stderr||`${filename} failed syntax check.`);
    }
  }
}
await checkJavaScript(path.join(root,'dist'));
if(process.argv.includes('--complete')){
  assert.equal(available.length,20,'Not all twenty directions have been implemented.');
  const report=JSON.parse(await readFile(path.join(root,'project-notes','visual-qa.json'),'utf8'));
  for(const concept of concepts){
    const entry=report.concepts?.[concept.id];
    assert.ok(entry?.desktop?.reviewed&&entry?.mobile?.reviewed,`${concept.id}: screenshot review is incomplete.`);
    assert.ok(entry?.interactionsPassed,`${concept.id}: interaction checks are incomplete.`);
    for(const size of ['desktop','mobile']){
      const screenshot=await readFile(path.join(root,entry[size].path));
      assert.ok(screenshot.length>1000,`${concept.id}: missing screenshot bytes.`);
    }
  }
}
console.log(`PASS: 3 independent text-brief designs, 6 fresh concepts and 15 finalists in the required nine-block order, text/button contrast and distinct palettes; ${available.length}/20 archived studio directions; JS syntax verified. ${process.argv.includes('--complete')?'Recorded screenshot and interaction audits passed.':'Screenshot and interaction audits are checked separately.'}`);
