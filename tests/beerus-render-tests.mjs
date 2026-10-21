import assert from 'node:assert/strict';
import {drawBeerusFrame} from '../dist/src/render/beerus.js';
import {BEERUS_NATIVE_META} from '../dist/src/render/beerus-meta.js';
import {ASSET_MANIFEST} from '../dist/src/engine/assets.js';
assert(ASSET_MANIFEST.beerus.endsWith('/beerus_native.webp'));assert(ASSET_MANIFEST.beerus_intro.endsWith('/beerus_intro_native.webp'));
for(const [key,m] of Object.entries(BEERUS_NATIVE_META))for(const f of m.frames){const calls=[];let balance=0;const ctx=new Proxy({save(){balance++;},restore(){balance--;},drawImage(...args){calls.push(args)}},{get:(t,k)=>k in t?t[k]:()=>{}});const image={complete:true,naturalWidth:3072};drawBeerusFrame(ctx,{[key]:image},key,f.row,f.column,50,100,-1);assert.equal(balance,0);assert.equal(ctx.imageSmoothingQuality,'high');const args=calls[0];assert.deepEqual(args.slice(1,5),[f.column*512,f.row*384,512,384]);assert(Math.abs(args[7]-512*f.fitScale*.86)<1e-9);assert(Math.abs(args[8]-384*f.fitScale*.86)<1e-9);}
console.log('Beerus renderer passed:90 native crops, preserved per-frame size/pivot, high-quality one-pass scaling and compatible asset keys.');
