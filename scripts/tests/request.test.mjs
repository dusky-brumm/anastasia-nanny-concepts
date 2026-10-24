import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRequest } from '../../dist/shared-ui.js';

test('request preserves the family context and usable contact information',()=>{
  const message=formatRequest({name:'  Маша и Лёша  ',contact:'  @family_demo ',service:'Личная консультация',message:'Двое детей.\nНужна помощь после школы.'});
  assert.ok(message.includes('Маша и Лёша'));
  assert.ok(message.includes('@family_demo'));
  assert.ok(message.includes('Личная консультация'));
  assert.ok(message.includes('Двое детей.\nНужна помощь после школы.'));
  assert.ok(!message.includes('undefined'));
});

test('an optional empty message does not produce an empty family section',()=>{
  const message=formatRequest({name:'Анна',contact:'+7 900 000 00 00',service:'',message:'   '});
  assert.ok(message.includes('+7 900 000 00 00'));
  assert.ok(message.includes('подбор няни'));
  assert.ok(!message.includes('О нашей семье:'));
  assert.ok(!message.endsWith('\n'));
});

test('names and literal punctuation remain plain message content',()=>{
  const message=formatRequest({name:'Ольга <мама>',contact:'@demo_user',service:'Личный подбор няни',message:'Важно: без "жёстких" методов & с уважением.'});
  assert.ok(message.includes('Ольга <мама>'));
  assert.ok(message.includes('без "жёстких" методов & с уважением.'));
});
