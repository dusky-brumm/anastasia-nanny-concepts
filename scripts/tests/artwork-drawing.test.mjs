import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {drawingTiming,pencilDuration,servicePictureDelay,nextServiceDelay,pencilPasses} from '../../src/site/hatching-model.js';
import {pencilArtwork} from '../../src/site/pencil-artwork-data.js';

test('the selected long strokes are faster and service starts are 20ms apart',()=>{
  for(const [kind,previous] of Object.entries({profile:3040,book:3180,interview:3320})){
    assert.equal(pencilDuration(kind),previous/3*.65);
  }
  assert.equal(pencilDuration(),3180/3,'Other site illustrations retain their duration');
  assert.deepEqual([0,1,2].map(servicePictureDelay),[0,20,40]);
  assert.equal(drawingTiming.contour+drawingTiming.background+drawingTiming.details,1);
});
test('the selected pencil strokes cover the illustration with overlapping finishing passes',()=>{
  const passes=[pencilPasses(),pencilPasses(true)];
  for(const treatment of passes){
    assert.ok(treatment.length>1);
    assert.equal(treatment[0].start,0);assert.equal(treatment.at(-1).end,1);
    for(const pass of treatment){
      assert.ok(pass.width>0&&pass.start>=0&&pass.end<=1&&pass.end>pass.start);
      const numbers=pass.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.ok(numbers.every(Number.isFinite));assert.ok(Math.min(...numbers)<0&&Math.max(...numbers)>1000);
    }
    assert.ok(treatment.at(-1).width>treatment[0].width,'The finishing pass closes the initial pencil gaps');
  }
});
test('cards entering on separate frames keep a 20ms activation gap without delaying already separated entries',()=>{
  assert.equal(nextServiceDelay(100),0);
  assert.equal(nextServiceDelay(100,100),20);
  assert.equal(nextServiceDelay(100,120),40);
  assert.equal(nextServiceDelay(120,100),0);
  assert.equal(nextServiceDelay(3000,1100),0);
});
test('every final raster illustration has contours from its actual unchanged image file',async()=>{
  const assets=JSON.parse(await readFile(new URL('../../docs/pencil-artwork-assets.json',import.meta.url)));
  assert.equal(assets.length,12);assert.equal(Object.keys(pencilArtwork).length,assets.length);
  for(const file of assets){
    const data=pencilArtwork[path.basename(file)];assert.ok(data?.contours.length,file);
    assert.ok(data.size.length===2&&data.size.every(value=>value>0),file);
    const bytes=await readFile(new URL('../../src/site/'+file,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),data.source_sha256,`Regenerate contours for changed artwork: ${file}`);
  }
});
test('the interview starts with furniture before drawing either woman',()=>{
  const data=pencilArtwork['07-service-interview.webp'];
  assert.deepEqual(data.parts,['table','left-chair','right-chair','interviewer','nanny']);
  assert.equal(data.parts.length,data.contours.length);
});
