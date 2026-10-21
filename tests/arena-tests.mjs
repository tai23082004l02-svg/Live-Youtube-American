import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {createArena,normalizeArenaScale,cameraPoint} from '../dist/src/engine/arena.js';
assert.equal(normalizeArenaScale(NaN),1);assert.equal(normalizeArenaScale(Infinity),1);assert.equal(normalizeArenaScale(-2),1);assert.equal(normalizeArenaScale(10),4);
const pair=['gojo','naruto','sasuke','gogeta','luffy'];
for(const scale of [1,1.5,2,4]){
 const a=new Duel('ARENA-SPAWN',false,pair,{},null,scale),base=new Duel('ARENA-SPAWN',false,pair);
 for(let i=0;i<pair.length;i++){const f=a.fighters[i],b=base.fighters[i];assert(Math.abs(f.x-(480+(b.x-480)*scale))<1e-8);assert(Math.abs(f.y-(270+(b.y-270)*scale))<1e-8);const p=cameraPoint(f.x,f.y,scale);assert(Math.abs(p.x-b.x)<1e-8);assert(Math.abs(p.y-b.y)<1e-8);assert.equal(f.speed,b.speed);assert.equal(f.melee,b.melee);}
 for(const x of [-1e6,480,1e6])for(const y of [-1e6,270,1e6]){const f=a.clampPosition({x,y}),basePoint={x:480+(f.x-480)/scale,y:270+(f.y-270)/scale},clamped=base.clampPosition({...basePoint});assert(Math.abs(basePoint.x-clamped.x)<1e-8&&Math.abs(basePoint.y-clamped.y)<1e-8);}
 const replay=new Duel('ARENA-SPAWN',false,pair,{},null,scale);for(let tick=0;tick<18000&&!a.result;tick++){a.step();replay.step();for(const f of a.fighters){assert(Number.isFinite(f.x+f.y+f.hp));assert(f.y>=a.arena.minY-1e-8&&f.y<=a.arena.maxY+1e-8);}}assert(a.result);assert.deepEqual(a,replay);
}
{const d=new Duel('TELEPORT-WORLD',false,['goku','vegeta'],{},null,3),[f,t]=d.fighters;f.x=1100;t.x=1300;f.y=t.y=270;d.act(f,'teleport',1,0);assert(f.destX>1100);assert.equal(f.destX,t.x-t.face*78);}
{const stats={goku:{dodgeChance:0,blinkChance:0,blockChance:0},gojo:{critChance:0}},d=new Duel('SHOT-WORLD',false,['gojo','goku'],stats,null,3),[f,t]=d.fighters;while(d.introRemaining)d.step();f.x=1050;t.x=1250;f.y=t.y=-30;d.fighters.forEach(f=>{f.think=999;f.moveX=f.moveY=0;});d.shots.push({id:f.id,ownerUid:f.uid,kind:'test',damage:100,radius:30,x:1150,y:-30,vx:300,vy:0,life:1});d.step();assert.equal(d.shots.length,1);for(let i=0;i<25;i++)d.step();assert.equal(t.max-t.hp,100);}
{const teamPair=['gojo','sasuke','gogeta','luffy','naruto','goku','vegeta','broly','piccolo','naruto'],teams=['A','A','A','A','A','B','B','B','B','B'],d=new Duel('BIG-TEAMS',false,teamPair,{},teams,4);for(let i=0;i<24000&&!d.result;i++)d.step();assert(d.result);for(const e of d.events.filter(e=>e.type==='hit'))assert.notEqual(d.fighters.find(f=>f.uid===e.uid).team,d.fighters.find(f=>f.uid===e.sourceUid).team);}
{const a=new Duel('DEFAULT'),b=new Duel('DEFAULT',false,['goku','vegeta'],{},null,1);for(let i=0;i<2000&&!a.result;i++){a.step();b.step();}assert.deepEqual(a,b);}
console.log('Arena scale passed: clamp/limits, enlarged spawns, camera mapping, unchanged stats, projectile and teleport outside old bounds, replay, 4x 5v5 and default compatibility.');
