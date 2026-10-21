import assert from 'node:assert/strict';import {AssetLoader,assetsForPair} from '../dist/assets.js';
const requested=[];let failNext=false;const factory=()=>({set src(value){requested.push(value);queueMicrotask(()=>failNext?(failNext=false,this.onerror()):this.onload());}});const loader=new AssetLoader(undefined,factory);
assert.deepEqual(assetsForPair(['goku','vegeta']),['goku','vegeta']);assert.deepEqual(assetsForPair(['broly','vegeta']),['broly','broly_vfx','vegeta']);
await Promise.all([loader.loadPair(['goku','vegeta']),loader.loadPair(['goku','vegeta'])]);assert.equal(requested.length,2);assert(!requested.some(u=>u.includes('broly')));
await loader.loadPair(['broly','vegeta']);assert.equal(requested.length,4);loader.retain(assetsForPair(['broly','vegeta']));assert(!loader.loaded.has('goku'));
failNext=true;await assert.rejects(loader.load('goku'));await loader.load('goku');assert(loader.loaded.has('goku'));assert.throws(()=>assetsForPair(['missing','goku']));
console.log('Asset tests passed: pair-only loads, concurrent dedupe, cache eviction, failed load retry.');
