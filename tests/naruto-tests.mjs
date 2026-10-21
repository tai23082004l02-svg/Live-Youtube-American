import assert from 'node:assert/strict';
import {Duel} from './baseline-fixture.mjs';
import {Duel as LiveDuel} from '../dist/sim.js';
import {assetsForPair} from '../dist/assets.js';
assert.deepEqual(assetsForPair(['naruto','naruto']),['naruto','naruto_vfx','naruto_kurama','naruto_transform']);
const uses={rasengan:0,shuriken:0,clones:0};
for(let i=0;i<80;i++){
 const pair=i%2?['naruto','piccolo']:['naruto','goku','broly','vegeta','piccolo'];
 const d=new LiveDuel('naruto-'+i,!!(i%3),pair);
 while(!d.result&&d.tick<18000){d.step();assert(d.clones.length<=2);for(const c of d.clones){const owner=d.fighters.find(f=>f.uid===c.ownerUid);assert(owner&&owner.hp>0);assert(c.life>0);const target=d.pickTarget({...c,uid:owner.uid});if(target)assert.notEqual(target.uid,owner.uid);}}
 assert(d.result);for(const key in uses)uses[key]+=d.fighters[0].skillUses[key];
 if(i<3){const replay=new LiveDuel('naruto-'+i,!!(i%3),pair);while(!replay.result&&replay.tick<18000)replay.step();assert.deepEqual(d,replay);}
}
for(const key in uses)assert(uses[key]>0,key);
function stage(skill){const d=new Duel('stage',false,['naruto','goku','vegeta']);const [n,a,b]=d.fighters;Object.assign(n,{x:300,y:270});Object.assign(a,{x:440,y:270,state:'melee',age:-100});Object.assign(b,{x:500,y:300,state:'melee',age:-100});d.act(n,skill,1,0);return d;}
let d=stage('rasengan');for(let i=0;i<60;i++)d.step();assert.equal(d.fighters[1].hp,1025);assert.equal(d.events.filter(e=>e.type==='rasenganImpact').length,1);
d=stage('shuriken');for(let i=0;i<90;i++)d.step();assert.equal(d.fighters[1].hp,980);assert.equal(d.fighters[2].hp,1110);assert.equal(d.events.filter(e=>e.type==='fire').length,1);
d=stage('clones');for(let i=0;i<35;i++)d.step();assert.equal(d.clones.length,2);const n=d.fighters[0];n.state='melee';n.age=-100;const hp=n.hp;for(let i=0;i<365;i++)d.step();assert.equal(d.clones.length,0);assert.equal(n.hp,hp);assert(n.damage>0);
d=stage('clones');for(let i=0;i<35;i++)d.step();d.fighters[0].hp=0;d.step();assert.equal(d.clones.length,0);
// Two copies on each team: clone credit must use owner UID and never hit allies.
for(let i=0;i<15;i++){const d=new LiveDuel('n-team-'+i,false,['naruto','naruto','naruto','naruto'],{},['A','A','B','B']);while(!d.result&&d.tick<18000){d.step();assert(d.clones.length<=8);}assert(d.result);for(const e of d.events.filter(e=>e.type==='hit'))assert.notEqual(d.fighters.find(f=>f.uid===e.uid).team,d.fighters.find(f=>f.uid===e.sourceUid).team);}
console.log('Naruto tests passed: 80 default duels/5-FFA, 15 duplicate-team matches, skills, splash, clone expiry/death, owner attribution and replay.',uses);

const {narutoShotSocket,shotScreenPosition}=await import('../dist/presentation.js');
for(const face of [-1,1]){const f={x:400,y:270,face},s={x:400+face*36,y:270,vx:face*500,vy:0,radius:30,life:1.8};const screen=shotScreenPosition(s,narutoShotSocket(s,f,{x:400+face*230,y:270}));assert(Math.abs(screen.x-(400+face*58*.86))<1e-9);assert(Math.abs(screen.y-(270-57*.86))<1e-9);}
