import { test } from 'node:test';
import assert from 'node:assert/strict';

async function withStorage(storage, suffix, check) {
  const previousStorage=globalThis.localStorage;
  const previousWindow=globalThis.window;
  globalThis.localStorage=storage;
  globalThis.window={dispatchEvent:()=>true};
  try {
    const preferences=await import(`../../dist/preferences.js?case=${suffix}`);
    await check(preferences);
  } finally {
    if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage;
    if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
  }
}

test('favourites remain usable when reading browser storage is blocked',async()=>{
  await withStorage({getItem(){throw new Error('Storage blocked');},setItem(){throw new Error('Storage blocked');}},'read-blocked',({toggleFavorite,getFavorites})=>{
    toggleFavorite('07-linen');
    assert.deepEqual(getFavorites(),['07-linen']);
    toggleFavorite('07-linen');
    assert.deepEqual(getFavorites(),[]);
  });
});

test('a failed write does not let an older stored value erase this visit’s choices',async()=>{
  await withStorage({getItem:()=>'[]',setItem(){throw new Error('Quota exceeded');}},'write-blocked',({toggleFavorite,getFavorites})=>{
    toggleFavorite('07-linen');
    toggleFavorite('08-cover');
    assert.deepEqual(getFavorites(),['07-linen','08-cover']);
    toggleFavorite('07-linen');
    assert.deepEqual(getFavorites(),['08-cover']);
  });
});

test('new-series favourites survive a reload without replacing earlier selections',async()=>{
  let saved='["07-linen","02-letter"]';
  await withStorage({getItem:()=>saved,setItem(_key,value){saved=value;}},'mixed-series',async({toggleFavorite,getFavorites})=>{
    toggleFavorite('next-01-air');
    assert.deepEqual(getFavorites(),['07-linen','02-letter','next-01-air']);
    const reloaded=await import('../../dist/preferences.js?case=mixed-series-reloaded');
    assert.deepEqual(reloaded.getFavorites(),['07-linen','02-letter','next-01-air']);
    reloaded.toggleFavorite('next-01-air');
    assert.deepEqual(reloaded.getFavorites(),['07-linen','02-letter']);
  });
});
