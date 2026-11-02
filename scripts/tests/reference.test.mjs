import test from 'node:test';
import assert from 'node:assert/strict';
import {formatRequest} from '../../src/reference/request.js';
test('request preserves the contact and family context',()=>{const value=formatRequest({name:' Анна ',contact:' @family ',message:'Ребёнку 3 года\nПомощь по будням'});assert.match(value,/Меня зовут Анна\./);assert.match(value,/Связаться со мной: @family\./);assert.match(value,/О нашей семье:\nРебёнку 3 года\nПомощь по будням/);});
test('an optional empty request adds no empty family section',()=>{assert.equal(formatRequest({name:'Анна',contact:'+7 000',message:'  '}),'Здравствуйте, Анастасия!\n\nМеня зовут Анна.\nСвязаться со мной: +7 000.');});
test('literal punctuation is preserved as plain message text',()=>{const value=formatRequest({name:'<Анна>',contact:'@test',message:'<script>пример</script> & вопросы'});assert.match(value,/<script>пример<\/script> & вопросы/);});
