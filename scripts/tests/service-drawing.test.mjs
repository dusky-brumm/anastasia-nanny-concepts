import test from 'node:test';
import assert from 'node:assert/strict';
import {serviceDrawingPlans,serviceDrawingDelay,serviceHatching} from '../../src/site/service-drawing-model.js';

test('service illustrations and captions use a half-second stagger',()=>{
  assert.deepEqual([0,1,2].map(serviceDrawingDelay),[500,1000,1500]);
  assert.deepEqual([0,1,2].map(index=>serviceDrawingDelay(index)+500),[1000,1500,2000]);
});
test('paper comes before its contents and furniture before either woman',()=>{
  const profile=serviceDrawingPlans.profile,book=serviceDrawingPlans.book,interview=serviceDrawingPlans.interview;
  assert.ok(profile.find(p=>p.name==='paper').at<profile.find(p=>p.name==='portrait').at);
  assert.ok(book.find(p=>p.name==='blank-pages').at<book.find(p=>p.name==='book-notes').at);
  const furniture=interview.filter(p=>['table','left-chair','right-chair'].includes(p.name));
  const people=interview.filter(p=>['interviewer','nanny'].includes(p.name));
  assert.ok(Math.max(...furniture.map(p=>p.at+p.duration*.62))<Math.min(...people.map(p=>p.at)));
  for(const parts of Object.values(serviceDrawingPlans)){
    assert.equal(new Set(parts.map(p=>p.name)).size,parts.length);
    for(const p of parts){assert.ok(p.at>=0&&p.duration>0&&p.width>0);assert.ok(p.region.endsWith('Z'));}
  }
});
test('fine overlapping passes cover the whole normalized drawing, including edge grain',()=>{
  const coordinates=serviceHatching().match(/-?\d+/g).map(Number);
  assert.ok(Math.min(...coordinates)<0&&Math.max(...coordinates)>1000);
  assert.ok(coordinates.every(Number.isFinite));
});
