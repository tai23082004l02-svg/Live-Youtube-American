import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Duel} from '../dist/src/engine/sim.js';
import {DEFAULT_STATS,normalizeStats} from '../dist/src/engine/config.js';
import {prepareStyleTarget,decideFightingStyle,finishStyleAction,defenseOpportunity} from '../dist/src/engine/fighting-style.js';
const values={pursuitChance:70,comboChance:65,counterChance:60,recklessness:55,targetSwitchChance:35};
for(const [id,stats] of Object.entries(DEFAULT_STATS))for(const [k,v] of Object.entries(values))assert.equal(stats[k],v,id+k);
assert.equal(normalizeStats({goku:{comboChance:200,counterChance:-1,recklessness:'bad'}}).goku.comboChance,100);assert.equal(normalizeStats({goku:{counterChance:-1}}).goku.counterChance,0);assert.equal(normalizeStats({goku:{recklessness:'bad'}}).goku.recklessness,55);
function fixture(){const d=new Duel('STYLE',false,['goku','vegeta','piccolo']);d.fighters.forEach((f,i)=>Object.assign(f,{x:300+i*120,y:270,state:'idle',think:0,tactic:'orbit',tacticLeft:1,...Object.fromEntries(Object.keys(values).map(k=>[k,0]))}));return d;}
let d=fixture(),[f,t,n]=d.fighters;f.lastLandedTick=d.tick;f.lastLandedUid=t.uid;f.pursuitChance=100;decideFightingStyle(d,f,t);assert.equal(f.tactic,'approach');assert.equal(f.aiTargetUid,t.uid);const count=d.events.length;decideFightingStyle(d,f,t);assert.equal(d.events.length,count,'one pursuit roll per landed hit');
d=fixture();[f,t]=d.fighters;f.lastLandedTick=0;f.lastLandedUid=t.uid;decideFightingStyle(d,f,t);assert.equal(f.tactic,'orbit');
// Ended actions grant a short opportunity; cast and cooldown values stay intact.
d=fixture();[f,t]=d.fighters;f.comboChance=100;f.cd=2;finishStyleAction(d,f,'melee');decideFightingStyle(d,f,t);assert(f.chainUntil>d.tick);assert.equal(f.cd,2);assert.equal(f.state,'idle');f.state='beam';finishStyleAction(d,f,'melee');assert.equal(f.comboOpportunityUntil,0);
d=fixture();[f,t]=d.fighters;finishStyleAction(d,f,'melee');decideFightingStyle(d,f,t);assert(!f.chainUntil);f.comboChance=100;f.comboOpportunityUntil=1;d.tick=40;decideFightingStyle(d,f,t);assert(!f.chainUntil,'expired combo cannot revive');
d=fixture();[f,t]=d.fighters;defenseOpportunity(d,f,t);f.counterChance=100;decideFightingStyle(d,f,t);assert.equal(f.aiTargetUid,t.uid);assert(f.chainUntil>d.tick);assert.equal(f.state,'idle');assert.equal(f.invulnerable,0);
d=fixture();[f,t]=d.fighters;defenseOpportunity(d,f,t);decideFightingStyle(d,f,t);assert(!f.chainUntil);f.counterChance=100;f.counterOpportunityUntil=1;d.tick=60;decideFightingStyle(d,f,t);assert(!f.chainUntil);
for(const [chance,tactic] of [[0,'retreat'],[100,'approach']]){d=fixture();[f,t]=d.fighters;Object.assign(f,{hp:100,aggression:100,recklessness:chance,tacticLeft:0});decideFightingStyle(d,f,t);assert.equal(f.tactic,tactic);}
// Target changes use slot UIDs, cannot select allies, and never interrupt an active cast.
d=fixture();[f,t,n]=d.fighters;f.aiTargetUid=t.uid;n.x=330;f.targetSwitchChance=0;prepareStyleTarget(d,f);assert.equal(d.pickTarget(f).uid,t.uid);d.tick=36;f.targetSwitchChance=100;prepareStyleTarget(d,f);assert.equal(d.pickTarget(f).uid,n.uid);d.tick=72;f.lastAttackerUid=t.uid;f.lastAttackedTick=70;prepareStyleTarget(d,f);assert.equal(d.pickTarget(f).uid,t.uid);d.tick=108;f.state='beam';f.lastAttackerUid=n.uid;f.lastAttackedTick=108;prepareStyleTarget(d,f);assert.equal(d.pickTarget(f).uid,t.uid);
d=new Duel('TEAM-STYLE',false,['goku','goku','vegeta'],{},['A','A','B']);[f,t,n]=d.fighters;Object.assign(f,{state:'idle',think:0,targetSwitchChance:100,lastAttackerUid:t.uid,lastAttackedTick:0});prepareStyleTarget(d,f);assert.equal(d.pickTarget(f).uid,n.uid);
// Real hits create retaliation data; defense only queues a response, no extra damage.
d=new Duel('STYLE-HIT',false,['goku','vegeta'],{goku:{critChance:0},vegeta:{dodgeChance:0,blinkChance:0,blockChance:100,blockReduction:100}});[f,t]=d.fighters;d.fighters.forEach((f,i)=>Object.assign(f,{state:'melee',age:-10,x:400+i*100,y:270}));d.shots.push({id:f.id,ownerUid:f.uid,x:t.x-1,y:t.y,vx:60,vy:0,life:1,damage:100});d.step();assert.equal(t.hp,t.max);assert.equal(t.counterThreatUid,f.uid);assert(t.counterOpportunityUntil>d.tick);
// AI respects melee cooldown even with 100% chaining and never moves through root.
d=fixture();[f,t]=d.fighters;t.x=f.x+70;Object.assign(f,{chainUntil:100,think:0,cd:10,rootUntil:100,rootX:f.x,rootY:f.y});for(const key of Object.keys(f))if(key.endsWith('Cd'))f[key]=100;d.step();assert.notEqual(f.state,'melee');assert.equal(f.x,f.rootX);assert.equal(f.y,f.rootY);
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');for(const id of Object.keys(DEFAULT_STATS))for(const key of Object.keys(values))assert(html.includes('id="stat_'+id+'_'+key+'"'));
console.log('Fighting styles passed: defaults/migration/limits, 0/100 decisions, opportunity expiry, cooldown/root safety, low HP, stable enemy-slot targets and85 controls.');
