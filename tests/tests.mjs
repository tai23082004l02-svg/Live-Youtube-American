import assert from 'node:assert/strict';import {Duel} from './baseline-fixture.mjs';
function run(seed,swap=false){const d=new Duel(seed,swap);while(!d.result){d.step();for(const f of d.fighters){assert(Number.isFinite(f.x)&&Number.isFinite(f.y));assert(f.x>=40&&f.x<=920&&f.y>=65&&f.y<=490);assert(f.hp>=0&&f.hp<=1200);}}return d;}
let wins={goku:0,vegeta:0,draw:0},ticks=0,beams=0,dashes=0;
for(let i=0;i<100;i++){let d=run('test-'+i,i%2===0);wins[d.result]++;ticks+=d.tick;beams+=d.fighters.reduce((s,f)=>s+f.beams,0);dashes+=d.fighters.reduce((s,f)=>s+f.dodges,0);if(i<5)assert.deepEqual(d,run('test-'+i,i%2===0));}
assert(beams>0&&dashes>0);let d=new Duel('hit');Object.assign(d.fighters[0],{x:460,y:270,state:'melee',age:.22,actionX:1,actionY:0});Object.assign(d.fighters[1],{x:510,y:270,state:'melee',age:.22,actionX:-1,actionY:0});d.step();assert.equal(d.fighters[0].hp,1124);assert.equal(d.fighters[1].hp,1124);for(let i=0;i<8;i++)d.step();assert.equal(d.fighters[0].hp,1124);assert.equal(d.fighters[1].hp,1124);
d=new Duel('double');for(const [i,f] of d.fighters.entries())Object.assign(f,{x:460+i*50,y:270,hp:50,state:'melee',age:.22,actionX:i?-1:1,actionY:0});d.step();assert.equal(d.result,'draw');
console.log(JSON.stringify({matches:100,wins,meanSeconds:ticks/100/60,beams,dashes,determinism:'passed',simultaneousDamage:'passed',singleHit:'passed',doubleKO:'passed'},null,2));
