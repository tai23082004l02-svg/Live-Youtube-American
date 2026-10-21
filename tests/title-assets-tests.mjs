import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {drawTitle} from '../dist/src/render/titles.js';
const meta=JSON.parse(readFileSync('dist/assets/ui/titles/meta.json','utf8'));
const labels=['DOWN ARENA','VICTORY','CHAMPION','VS','NEXT BATTLE','TOURNAMENT DRAW','DRAW','REMATCH'];
globalThis.Image=class{complete=true;set src(url){this.url=url;const id=url.split('/').at(-1).replace('.webp',''),m=meta[id];this.naturalWidth=m.width;this.naturalHeight=m.height;}};
let depth=0;const draws=[],ctx={save(){depth++;},restore(){depth--;},drawImage(...a){draws.push(a);}};
for(const label of labels){assert(drawTitle(ctx,label,270,760,420,60));const [im,x,y,w,h]=draws.at(-1);assert(existsSync('dist/'+im.url));assert(w<=420+1e-8&&h<=60+1e-8);assert(y>=730&&y+h<=790);assert(Math.abs(w/h-im.naturalWidth/im.naturalHeight)<1e-8);assert(Math.abs(x+w/2-270)<1e-8);}
assert.equal(drawTitle(ctx,'PAUSED',0,0,100,50),false);assert.equal(depth,0);delete globalThis.Image;
console.log('Title assets passed: all8 files, proportional full-image fitting, centered bounds, unknown label fallback and balanced canvas.');
