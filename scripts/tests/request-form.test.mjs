import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {bindSiteRequestUi} from '../../src/site/request-form.js';
import {formatRequest} from '../../src/reference/request.js';

function fixture(fetch, endpoint = '/api/request') {
  const handlers = {}, opened = [], attrs = new Map();
  const fields = Object.fromEntries(Object.entries({name:'Анна', contact:'@family', message:'Ребёнку 3 года'}).map(([key, value]) => [key, {value, readOnly:false, setCustomValidity(value) { this.validity = value; }}]));
  const status = {textContent:'', children:[], append(...nodes) { this.children.push(...nodes); }};
  const button = {firstChild:{textContent:'Оставить заявку '}, disabled:true};
  const form = {
    matches:selector => selector === '.s-consult-form', elements:{namedItem:key => fields[key]},
    reportValidity:() => Object.values(fields).every(field => !field.validity),
    querySelector:selector => selector === '[type=submit]' ? button : status,
    reset() { this.resets = (this.resets ?? 0) + 1; Object.values(fields).forEach(field => { field.value = ''; }); },
    setAttribute:(key, value) => attrs.set(key, value), removeAttribute:key => attrs.delete(key),
  };
  const document = {body:{dataset:{requestEndpoint:endpoint}}, querySelectorAll:() => [button], querySelector:() => ({textContent:''}), addEventListener:(key, fn) => { handlers[key] = fn; }, createElement:() => ({})};
  const context = vm.createContext({document, window:{open:(...args) => opened.push(args)}, fetch, URL, WeakSet, AbortController, setTimeout, clearTimeout});
  vm.runInContext(`(${bindSiteRequestUi.toString()})(${formatRequest.toString()})`, context);
  return {fields, status, button, form, attrs, opened, submit:() => handlers.submit({target:form, preventDefault() {}})};
}

test('confirmed delivery clears the form and blocks a second submission while pending', async () => {
  let finish, calls = 0;
  const ui = fixture(async () => { calls++; return new Promise(resolve => { finish = resolve; }); });
  const first = ui.submit();
  assert.equal(ui.button.disabled, true);
  assert.equal(ui.fields.name.readOnly, true);
  assert.equal(ui.attrs.get('aria-busy'), 'true');
  await ui.submit();
  assert.equal(calls, 1);
  finish(Response.json({ok:true}));
  await first;
  assert.equal(ui.form.resets, 1);
  assert.match(ui.status.textContent, /Заявка отправлена/);
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.fields.name.readOnly, false);
  assert.equal(ui.button.firstChild.textContent, 'Оставить заявку ');
});

test('rejected or interrupted delivery preserves input and offers a populated manual link', async () => {
  for (const failure of [() => Response.json({ok:false}, {status:502}), () => { throw new Error('offline'); }, () => Response.json({ok:false}, {status:429})]) {
    const ui = fixture(async () => failure());
    await ui.submit();
    assert.equal(ui.fields.name.value, 'Анна');
    assert.equal(ui.fields.contact.value, '@family');
    assert.equal(ui.fields.message.value, 'Ребёнку 3 года');
    assert.equal(ui.form.resets, undefined);
    assert.equal(ui.button.disabled, false);
    const link = ui.status.children.at(-1);
    assert.equal(new URL(link.href).hostname, 't.me');
    assert.match(new URL(link.href).searchParams.get('text'), /Ребёнку 3 года/);
  }
});

test('until a bot is connected the form continues opening the Telegram draft', async () => {
  const ui = fixture(() => { throw new Error('Must not send'); }, '');
  await ui.submit();
  assert.equal(ui.opened.length, 1);
  assert.equal(new URL(ui.opened[0][0]).pathname, '/inyfid');
  assert.equal(ui.form.resets, undefined);
});
