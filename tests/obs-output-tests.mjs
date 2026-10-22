import assert from 'node:assert/strict';
import {configurePortraitOutput,obsMode,startOBSOutput} from '../dist/src/obs-output.js';
const canvas={},transforms=[],ctx={setTransform(...v){transforms.push(v);}};configurePortraitOutput(canvas,ctx);assert.equal(canvas.width,1080);assert.equal(canvas.height,1920);assert.deepEqual(transforms,[[2,0,0,2,0,0]]);assert.equal(ctx.imageSmoothingQuality,'high');
for(const [search,mode] of [['?obs=vote','live_vote'],['?obs=vertical','live_vertical'],['?foo=1&obs=vote&bar=2','live_vote'],['?obs=unknown',null],['?otherobs=vote',null],['',null]])assert.equal(obsMode(search),mode);
const calls=[],doc={addEventListener(name,fn,options){calls.push([name,options]);fn();}},menu={async choose(mode){await Promise.resolve();calls.push(mode);}};
assert.equal(await startOBSOutput({mode:null}),false);assert.equal(await startOBSOutput({mode:'live_vote',menu,start:async()=>calls.push('start'),unlock:()=>calls.push('unlock'),document:doc}),true);assert.deepEqual(calls,['live_vote','start',['pointerdown',{once:true}],'unlock']);
console.log('OBS output PASS:1080x1920 buffer,2x logical drawing,explicit URL modes,ordered autostart,one-gesture audio unlock.');
