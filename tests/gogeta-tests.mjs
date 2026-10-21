import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {gogetaPose} from '../dist/src/characters/gogeta.js';
import {assetsForPair} from '../dist/src/engine/assets.js';
import {readFileSync} from 'node:fs';
const stats=Object.fromEntries(['gogeta','goku','vegeta'].map(id=>[id,{hp:20000,dodgeChance:0,blinkChance:0,blockChance:0,critChance:0,reactionChance:0}]));
function setup(pair=['gogeta','goku','gogeta']){const d=new Duel('GOGETA',false,pair,stats,['A','B','A']);d.fighters.forEach((f,i)=>{f.x=300+i*100;f.y=270;f.think=999;f.moveX=f.moveY=0;});return d;}
{const d=setup(['gogeta','goku','vegeta']),[f,t,a]=d.fighters;d.act(f,'bigbang',1,0);for(let i=0;i<180;i++)d.step();assert.equal(t.max-t.hp,300);assert.equal(a.max,a.hp);assert.equal(f.skillUses.bigbang,1);}
{const d=new Duel('PIERCE',false,['gogeta','goku','vegeta'],stats);d.fighters.forEach((f,i)=>{f.x=300+i*100;f.y=270;f.think=999;});d.act(d.fighters[0],'bigbang',1,0);for(let i=0;i<180;i++)d.step();assert(d.fighters.slice(1).every(t=>t.max-t.hp===300));}
{const d=setup(),[f,t,a]=d.fighters;d.act(f,'stardust',1,0);for(let i=0;i<140;i++)d.step();assert.equal(t.max-t.hp,240);assert.equal(a.max,a.hp);assert(d.events.some(e=>e.type==='gogetaImpact'&&e.skill==='stardust'));}
{const d=setup(),[f,t,a]=d.fighters;d.act(f,'meteor',1,0);for(let i=0;i<100;i++)d.step();assert.equal(t.max-t.hp,250);assert.equal(a.max,a.hp);assert(f.x>300);}
{const d=setup(),[f,t,a]=d.fighters;d.act(f,'stardustfall',1,0);for(let i=0;i<120;i++)d.step();assert.equal(d.events.filter(e=>e.type==='fire'&&e.skill==='stardustfall').length,5);assert(t.hp<t.max);assert.equal(a.max,a.hp);}
{const d=new Duel('CD',false,['gogeta','goku'],{gogeta:{cooldown:50}}),f=d.fighters[0];assert.equal(f.bigbangCd,1);d.act(f,'meteor',1,0);assert.equal(f.meteorCd,5.5);}
for(const state of ['idle','run','melee','dash','guard','hurt','defeat','bigbang','stardust','meteor','stardustfall'])for(const age of [0,.4,1,3]){const p=gogetaPose({state,age,combo:1});assert(p.frame>=0&&p.frame<8&&p.row>=0&&p.row<12);}
for(const pair of [['gogeta','sasuke'],['gogeta','gojo'],['gogeta','goku','broly','piccolo','vegeta']]){const a=new Duel('G-REPLAY',false,pair),b=new Duel('G-REPLAY',false,pair);for(let i=0;i<18000&&!a.result;i++){a.step();b.step();}assert(a.result);assert.deepEqual(a,b);assert(a.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)));}
{const pair=['gogeta','gogeta','gojo','sasuke','vegeta','gogeta','goku','piccolo','broly','naruto'],teams=['A','A','A','A','A','B','B','B','B','B'],d=new Duel('G-TEAM',false,pair,{},teams);for(let i=0;i<18000&&!d.result;i++)d.step();assert(d.result);for(const e of d.events.filter(e=>e.type==='hit'))assert.notEqual(d.fighters.find(f=>f.uid===e.uid).team,d.fighters.find(f=>f.uid===e.sourceUid).team);}
assert.deepEqual(assetsForPair(['gogeta','goku']),['gogeta','gogeta_vfx','goku']);
for(const [name,width,height] of [['gogeta',2560,2688],['gogeta_vfx',4096,1536]]){const b=readFileSync('art/atlases/'+name+'.png');assert.equal(b.readUInt32BE(16),width);assert.equal(b.readUInt32BE(20),height);}
console.log('Gogeta passed: four skills, piercing, friendly immunity, five-shot volley, cooldown scale, 8-frame poses, atlas sizes, replay, FFA and 5v5.');
