import assert from 'node:assert/strict';
import {Duel} from '../dist/sim.js';
import {normalizeStats} from '../dist/config.js';
const neutral={dodgeChance:0,blinkChance:0,critChance:0,blockChance:0,damageReduction:0,aggression:100,reactionChance:100};
function stage(attack={},defense={}){const d=new Duel('combat',false,['goku','vegeta'],{goku:{...neutral,...attack},vegeta:{...neutral,...defense}});for(const [i,f] of d.fighters.entries())Object.assign(f,{x:400+i*100,y:270,state:'melee',age:-100});return d;}
function hit(d){const [p,t]=d.fighters;d.shots.push({id:p.id,ownerUid:p.uid,x:t.x-1,y:t.y,vx:60,vy:0,life:1,damage:100});d.step();}
let d=stage({critChance:100,critDamage:200});hit(d);assert.equal(d.fighters[1].hp,1000);assert(d.events.find(e=>e.type==='hit').critical);
d=stage({critChance:100,critDamage:200},{blockChance:100,blockReduction:50,damageReduction:20});hit(d);assert.equal(d.fighters[1].hp,1120);assert(d.events.find(e=>e.type==='hit').blocked);
d=stage({}, {blockChance:100,blockReduction:100});hit(d);assert.equal(d.fighters[1].hp,1200);
d=stage({}, {dodgeChance:100});hit(d);assert.equal(d.fighters[1].hp,1200);assert.equal(d.fighters[1].evades,1);
d=stage({}, {blinkChance:100,blinkCooldown:6});hit(d);assert.equal(d.fighters[1].hp,1200);assert.equal(d.fighters[1].blinks,1);assert.equal(d.fighters[1].blinkCd,6);assert(d.events.some(e=>e.type==='teleported'&&e.random));
for(let i=0;i<15;i++)d.step();hit(d);assert.equal(d.fighters[1].blinks,1);assert.equal(d.fighters[1].hp,1100);
d=stage();hit(d);assert.equal(d.fighters[1].hp,1100);assert.equal(d.events.filter(e=>['evade','block','teleported'].includes(e.type)).length,0);
assert.equal(normalizeStats({goku:{critDamage:1000,dodgeChance:-5}}).goku.critDamage,400);assert.equal(normalizeStats({goku:{dodgeChance:-5}}).goku.dodgeChance,0);
assert.equal(normalizeStats({goku:{hp:1800}}).goku.critChance,15);
// Default probabilities and movement: replay and team safety under the real settings.
let totals={crits:0,blocks:0,evades:0,blinks:0},tactics=new Set();
for(let i=0;i<80;i++){
 const pair=i%2?['goku','vegeta']:['goku','piccolo','broly','goku'],teams=i%2?null:['A','A','B','B'];
 const d=new Duel('combat-'+i,!!(i%3),pair,{},teams);
 while(!d.result){d.step();for(const f of d.fighters){assert(Number.isFinite(f.x+f.y+f.hp));assert(f.hp>=0&&f.hp<=f.max);assert(f.x>=40&&f.x<=920&&f.y>=65&&f.y<=490);tactics.add(f.tactic);}}
 for(const f of d.fighters)for(const key in totals)totals[key]+=f[key];
 if(teams)for(const e of d.events.filter(e=>e.type==='hit'))assert.notEqual(d.fighters.find(f=>f.uid===e.uid).team,d.fighters.find(f=>f.uid===e.sourceUid).team);
 if(i<4){const replay=new Duel('combat-'+i,!!(i%3),pair,{},teams);while(!replay.result)replay.step();assert.deepEqual(d,replay);}
}
for(const [key,value] of Object.entries(totals))assert(value>0,key);assert(tactics.has('orbit')&&tactics.has('retreat')&&tactics.has('approach'));
console.log('Combat tests passed: exact 0/100% outcomes, crit/block/armor stacking, blink cooldown, migration, 80 default matches and deterministic replay.',totals);

// Cross the old deadline, then continue past two minutes without forced results.
for(const teams of [null,['A','B']]){const d=new Duel('unlimited',false,['goku','vegeta'],{},teams);d.tick=3599;for(const f of d.fighters){f.state='melee';f.age=-10000;}for(let i=0;i<4000;i++)d.step();assert.equal(d.result,null);assert(d.tick>7200);}
console.log('Unlimited matches verified beyond 120 seconds for solo and team modes.');
