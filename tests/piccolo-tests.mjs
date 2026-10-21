import assert from 'node:assert/strict';
import {Duel} from './baseline-fixture.mjs';import {DT} from '../dist/sim.js';
import {assetsForPair} from '../dist/assets.js';
import {piccoloShotSocket,piccoloPose,shotScreenPosition} from '../dist/presentation.js';
assert.deepEqual(assetsForPair(['piccolo','goku']),['piccolo','piccolo_vfx','goku']);
assert(!assetsForPair(['goku','vegeta']).includes('piccolo_vfx'));
const uses={special:0,hellzone:0,light:0};
for(const opponent of ['goku','vegeta','broly'])for(let i=0;i<60;i++){
 const pair=i%2?['piccolo',opponent]:[opponent,'piccolo'];
 const d=new Duel('piccolo-'+i,!!(i%2),pair);
 while(!d.result){d.step();for(const f of d.fighters){assert(Number.isFinite(f.x+f.y+f.hp));assert(f.hp>=0&&f.hp<=f.max);assert(f.x>=40&&f.x<=920&&f.y>=65&&f.y<=490);}}
 const p=d.fighters.find(f=>f.id==='piccolo');for(const key in uses)uses[key]+=p.skillUses[key];
 if(i<3){const replay=new Duel('piccolo-'+i,!!(i%2),pair);while(!replay.result)replay.step();assert.deepEqual(d,replay);}
}
for(const key in uses)assert(uses[key]>0,key+' unused');
for(let i=0;i<60;i++){
 const d=new Duel('piccolo-ffa-'+i,false,['piccolo',i%2?'broly':'goku','vegeta']);
 while(!d.result){d.step();for(const f of d.fighters)if(f.hp===0)assert.equal(f.state,'defeat');}
 assert(d.result);
}
// Freeze opponents to verify emission counts, damage, splash, scaling and mirrored sockets.
function staged(skill,stats={}){const d=new Duel('staged',false,['piccolo','goku','vegeta'],stats);const [p,a,b]=d.fighters;Object.assign(p,{x:200,y:270});Object.assign(a,{x:450,y:270,state:'melee',age:-100});Object.assign(b,{x:490,y:310,state:'melee',age:-100});d.act(p,skill,1,0);return d;}
for(const skill of ['special','hellzone','light']){
 const d=staged(skill);let emitted=0;
 for(let i=0;i<95;i++){d.step();emitted=d.events.filter(e=>e.type==='fire'&&e.id==='piccolo').length;}
 assert.equal(emitted,skill==='hellzone'?5:1);
 assert(d.fighters[1].hp<1200);
 if(skill==='light'){assert.equal(d.fighters[1].hp,940);assert.equal(d.fighters[2].hp,1070);}
 const p=d.fighters[0];assert.equal(p.skillUses[skill],1);
}
let d=staged('special',{piccolo:{skillPower:200,cooldown:50}});assert.equal(d.fighters[0].specialCd,5.5);for(let i=0;i<95;i++)d.step();assert.equal(d.fighters[1].hp,600);
for(const face of [-1,1])for(const kind of ['special','hellzone','light','beam']){
 const p={id:'piccolo',x:400,y:260,face,state:kind,age:.8,hit:true},target={x:400+face*220,y:260},distance=kind==='beam'?35:38;
 const s={kind,vx:face*450,vy:0,x:p.x+face*distance,y:p.y,life:kind==='hellzone'?2.1:1.8};
 const muzzle=piccoloPose(p),screen=shotScreenPosition(s,piccoloShotSocket(s,p,target));assert(Math.abs(screen.x-muzzle.x)<1e-9);assert(Math.abs(screen.y-muzzle.y)<1e-9);
}
console.log('Piccolo tests passed: 180 duels, 60 FFA, replay, emissions, splash, damage/cooldown scaling and mirrored shot sockets.',uses);
