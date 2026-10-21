import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {beerus,beerusPose} from '../dist/src/characters/beerus.js';
import {assetsForPair} from '../dist/src/engine/assets.js';
import {readFileSync} from 'node:fs';
const stats=Object.fromEntries(['beerus','goku','vegeta','naruto'].map(id=>[id,{hp:20000,dodgeChance:0,blinkChance:0,blockChance:0,critChance:0,reactionChance:0}]));
function setup(){const d=new Duel('BEERUS',false,['beerus','goku','beerus'],stats,['A','B','A']);const before=JSON.stringify(d.fighters),rng=d.rng;for(let i=0;i<150;i++)d.step();assert.equal(d.tick,0);assert.equal(d.rng,rng);assert.equal(d.introRemaining,0);assert(d.fighters.filter(f=>f.id==='beerus').every(f=>f.introAge===null));assert.equal(JSON.parse(before)[0].hp,d.fighters[0].hp);d.fighters.forEach((f,i)=>{f.x=300+i*100;f.y=270;f.think=999;});return d;}
for(const [skill,damage] of [['hakai',270],['destruction',240],['divineshock',140]]){const d=setup(),[f,t,a]=d.fighters,x=t.x;d.act(f,skill,1,0);for(let i=0;i<110;i++)d.step();assert.equal(t.max-t.hp,damage,skill);assert.equal(a.hp,a.max);if(skill==='divineshock')assert(t.x>x);}
{const d=new Duel('AREA',false,['beerus','goku','vegeta'],stats);for(let i=0;i<150;i++)d.step();d.fighters.forEach((f,i)=>{f.x=300+i*100;f.y=270;f.think=999;});const [f,t,a]=d.fighters;d.act(f,'destruction',1,0);for(let i=0;i<110;i++)d.step();assert.equal(t.max-t.hp,240);assert.equal(a.max-a.hp,95);}
{const d=setup(),f=d.fighters[0];d.act(f,'destroyerwrath',1,0);for(let i=0;i<80;i++)d.step();const end=f.wrathEnd;assert.equal(beerus.incomingDamageMultiplier(d,f),.8);assert.equal(beerus.outgoingDamageMultiplier(d,f),1.25);assert.equal(f.hp,f.max);const target=d.fighters[1];d.act(f,'hakai',1,0);for(let i=0;i<100;i++)d.step();assert.equal(target.max-target.hp,338);while(d.tick<end)d.step();assert.equal(beerus.incomingDamageMultiplier(d,f),1);assert.equal(beerus.outgoingDamageMultiplier(d,f),1);}
// Guaranteed dodge prevents both damage and the new on-hit knockback.
{const d=setup(),[f,t]=d.fighters;t.dodgeChance=100;d.act(f,'divineshock',1,0);for(let i=0;i<60;i++)d.step();assert.equal(t.hp,t.max);assert(t.evades>0);}
// No instant kill, no damage or displacement through Naruto's protected charge.
{const d=new Duel('NARUTO-PROTECT',false,['beerus','naruto'],stats);for(let i=0;i<150;i++)d.step();const [f,t]=d.fighters;f.think=t.think=999;f.x=350;t.x=430;f.y=t.y=270;t.hp=t.max*.4;d.act(f,'divineshock',1,0);const hp=t.hp;for(let i=0;i<40;i++)d.step();assert.equal(t.hp,hp);assert.equal(t.x,430);}
for(const pair of [['beerus','goku_blue'],['beerus','yugi','gaara','frieza','gojo']]){const a=new Duel('BEERUS-REPLAY',false,pair,{},null,2),b=new Duel('BEERUS-REPLAY',false,pair,{},null,2);for(let i=0;i<25000&&!a.result;i++){a.step();b.step();}assert(a.result);assert.deepEqual(a,b);}
{const pair=Array(10).fill('beerus'),teams=['A','A','A','A','A','B','B','B','B','B'],d=new Duel('BEERUS-TEAM',false,pair,{},teams,2);for(let i=0;i<25000&&!d.result;i++)d.step();assert(d.result);for(const e of d.events.filter(e=>e.type==='hit'))assert.notEqual(d.fighters.find(f=>f.uid===e.uid).team,d.fighters.find(f=>f.uid===e.sourceUid).team);}
for(const state of ['idle','run','melee','dash','guard','hurt','defeat','hakai','destruction','divineshock','destroyerwrath'])for(const age of [0,.5,2,10]){const p=beerusPose({state,age,combo:1});assert(p.frame<6&&p.row<12);}
for(const introAge of [0,1,2.49]){const p=beerusPose({introAge});assert(p.row<3&&p.frame<6);}
assert.equal(assetsForPair(['beerus']).length,4);
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert(html.includes('statPanel_beerus'));assert.equal((html.match(/value="beerus"/g)||[]).length,0);
console.log('Beerus passed: intro, four skills, splash, on-hit knockback/dodge, Naruto protection, buff/expiry, replay, FFA, ten-Beerus 5v5 and UI options.');
