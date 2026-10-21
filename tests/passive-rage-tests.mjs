import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {tickPassiveRage,PASSIVE_RAGE_PER_SECOND} from '../dist/src/engine/rage.js';
import {setTeamUltimateEnabled,recordTeamDamage} from '../dist/src/engine/team-ultimate.js';
import {recordPersonalDamage} from '../dist/src/engine/personal-ultimate.js';
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function idle(pair=['sung_jinwoo','ichigo'],teams=null){const d=new Duel('IDLE-RAGE',false,pair,{},teams);d.fighters.forEach(f=>f.think=1e9);return d;}
assert.equal(PASSIVE_RAGE_PER_SECOND,2);
{const d=idle();for(let i=0;i<150;i++)d.step();assert.equal(d.tick,0);assert(d.fighters.every(f=>f.rage===0));for(let i=0;i<3000;i++)d.step();assert.equal(d.tick,3000);assert(d.fighters.every(f=>f.rage===100));assert(d.fighters.every(f=>f.rageReadyTick===3000));assert.equal(d.personalUltimate.cinematic,null);const before=d.fighters.map(f=>f.rage);for(let i=0;i<60;i++){d.step();assert.equal(d.tick,3000);}assert.equal(d.fighters[0].personalUses,1);assert.equal(d.fighters[1].personalUses,0);assert.equal(d.fighters[1].rage,100);}
for(const n of [1,5]){const d=idle(Array(n*2).fill('goku'),Array(n).fill('A').concat(Array(n).fill('B')));for(let i=0;i<1800;i++)d.step();near(d.teamUltimate.teams.A.rage,60);near(d.teamUltimate.teams.B.rage,60);setTeamUltimateEnabled(d,false);d.step();assert.equal(d.teamUltimate,null);}
{const d=idle(['sung_jinwoo','ichigo'],['A','B']);d.introRemaining=0;const f=d.fighters[0],dead=d.fighters[1];f.rageLockUntil=d.teamUltimate.teams.A.lockUntil=900;dead.hp=0;d.tick=899;tickPassiveRage(d,1/60);near(f.rage,0);near(d.teamUltimate.teams.A.rage,0);near(dead.rage,0);near(d.teamUltimate.teams.B.rage,0);d.tick=900;tickPassiveRage(d,1/60);near(f.rage,2/60);near(d.teamUltimate.teams.A.rage,2/60);}
{const d=idle(['sung_jinwoo','ichigo'],['A','B']),[a,b]=d.fighters;d.introRemaining=0;d.tick=60;tickPassiveRage(d,1);recordPersonalDamage(d,a,b,120);near(a.rage,17);near(b.rage,2+80*120/b.max);recordTeamDamage(d,a,b,120);near(d.teamUltimate.teams.A.rage,17);const before=JSON.stringify([a.rage,b.rage,d.teamUltimate]);recordPersonalDamage(d,a,b,500,true);recordTeamDamage(d,a,b,500,true);assert.equal(JSON.stringify([a.rage,b.rage,d.teamUltimate]),before);}
{const a=idle(),b=idle();for(let i=0;i<4000;i++){a.step();b.step();}assert.deepEqual(a,b);}
console.log('Passive rage passed:2/s, exactly50 combat seconds, team-size independent, intro/cinematic freeze, death/lockout/off, additive real damage, no Ultimate feedback and replay.');
