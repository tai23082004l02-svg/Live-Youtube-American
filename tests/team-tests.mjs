import assert from 'node:assert/strict';
import {Duel} from './baseline-fixture.mjs';
const roster=['goku','vegeta','broly','piccolo'];
function create(a,b,seed='team',swap=false){return new Duel(seed,swap,Array.from({length:a+b},(_,i)=>roster[i%4]),{},[...Array(a).fill('A'),...Array(b).fill('B')]);}
for(const [a,b] of [[3,1],[2,2],[5,5]])for(let i=0;i<30;i++){
 const d=create(a,b,'team-'+i,!!(i%2));assert.equal(new Set(d.fighters.map(f=>f.uid)).size,a+b);assert.equal(new Set(d.fighters.map(f=>f.x+','+f.y)).size,a+b);
 while(!d.result){d.step();for(const f of d.fighters){assert(Number.isFinite(f.x+f.y+f.hp));assert(f.hp>=0&&f.hp<=f.max);if(f.hp===0)assert.equal(f.state,'defeat');if(f.targetId)assert.notEqual(d.fighters.find(t=>t.uid===f.targetId).team,f.team);}}
 assert(['draw','teamA','teamB'].includes(d.result));assert(d.result);
 for(const e of d.events.filter(e=>e.type==='hit'))assert.notEqual(d.fighters.find(f=>f.uid===e.uid).team,d.fighters.find(f=>f.uid===e.sourceUid).team);
 if(i<2){const replay=create(a,b,'team-'+i,!!(i%2));while(!replay.result)replay.step();assert.deepEqual(d,replay);}
}
// Duplicate characters across teams, with an ally directly in the projectile path.
let d=new Duel('same',false,['goku','goku','goku'],{},['A','A','B']);let [p,ally,enemy]=d.fighters;
for(const f of d.fighters)Object.assign(f,{y:270,state:'melee',age:-100});p.x=200;ally.x=300;enemy.x=400;
d.shots.push({id:'goku',ownerUid:p.uid,damage:123,radius:20,x:260,y:270,vx:600,vy:0,life:1.8});
for(let i=0;i<20;i++)d.step();assert.equal(ally.hp,1200);assert.equal(enemy.hp,1077);assert.equal(p.damage,123);
// AoE must not hurt a nearby ally.
d=new Duel('wave',false,['broly','goku','goku'],{},['A','A','B']);[p,ally,enemy]=d.fighters;p.x=480;p.y=270;ally.x=410;ally.y=270;enemy.x=550;enemy.y=270;for(const f of [ally,enemy])Object.assign(f,{state:'melee',age:-100});d.act(p,'wave',1,0);for(let i=0;i<45;i++)d.step();assert.equal(ally.hp,1200);assert.equal(enemy.hp,1040);
// Winning with several survivors on one team, simultaneous elimination and normalized timeout.
d=create(3,1);d.fighters[3].hp=0;d.step();assert.equal(d.result,'teamA');
d=create(2,2);for(const f of d.fighters)f.hp=0;d.step();assert.equal(d.result,'draw');
d=create(3,1);d.tick=3599;for(const f of d.fighters)Object.assign(f,{hp:f.max*.5,state:'melee',age:-100});d.step();assert.equal(d.result,null);
d=create(3,1);d.tick=3599;for(const f of d.fighters)Object.assign(f,{hp:f.max*(f.team==='A'?.4:.5),state:'melee',age:-100});d.step();assert.equal(d.result,null);
assert.throws(()=>new Duel('bad',false,['goku','goku'],{},['A','A']));assert.throws(()=>create(6,1));
console.log('Team tests passed: 90 matches (3v1/2v2/5v5), duplicates, replay, friendly projectile/AoE immunity, damage attribution, win and no time limit.');
