import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {CombatSamples} from '../dist/src/combat-samples.js';
const requested=[];globalThis.window={fetch:async url=>{assert(existsSync('dist/'+url));requested.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};}};
const samples=new CombatSamples();samples.load({decodeAudioData:async()=>({duration:.3})});await samples.loading;assert.equal(samples.buffers.size,21);samples.load({});assert.equal(requested.length,21);
for(const id of ['ichigo','saber','sung_jinwoo','sasuke']){assert.equal(samples.pick('melee',false,{id}).group,'sword_swing');assert.equal(samples.pick('hit',false,{source:id}).group,'sword_hit');}
assert.equal(samples.pick('hit',false,{source:'goku'}).group,'punch');assert.equal(samples.pick('hit',true,{source:'broly'}).group,'heavy_hit');assert.equal(samples.pick('hit',false,{source:'saber',attackState:'beam'}).group,'energy_hit');assert.equal(samples.pick('fire',false,{id:'goku'}).group,'energy_launch');assert.equal(samples.pick('block',false,{id:'saber'}).group,'sword_block');assert.equal(samples.pick('end',false,{}),null);
const variants=Array.from({length:4},()=>samples.pick('hit',false,{source:'goku'}).buffer);assert.notEqual(variants[0],variants[1]);assert.notEqual(variants[1],variants[2]);assert.equal(variants[0],variants[3]);
const failed=new CombatSamples();window.fetch=async()=>{throw Error('offline');};failed.load({decodeAudioData(){}});await failed.loading;assert.equal(failed.pick('hit',false,{id:'goku'}),null);
delete globalThis.window;console.log('Combat samples passed:21 assets, single cached preload, weapon/fist/energy/block routing,3 variations, offline fallback.');
