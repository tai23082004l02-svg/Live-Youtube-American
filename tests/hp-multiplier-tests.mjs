import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {DEFAULT_STATS,normalizeHpMultiplier} from '../dist/src/engine/config.js';
assert.equal(normalizeHpMultiplier(Infinity),1);assert.equal(normalizeHpMultiplier(-1),1);assert.equal(normalizeHpMultiplier(999),100);
for(const id of Object.keys(DEFAULT_STATS)){const pair=[id,id==='goku'?'vegeta':'goku'];const a=new Duel('HP',false,pair,{},null,1,10);assert.equal(a.fighters[0].hp,DEFAULT_STATS[id].hp*10);assert.equal(a.fighters[0].max,DEFAULT_STATS[id].hp*10);assert.equal(a.config[id].hp,DEFAULT_STATS[id].hp);assert.equal(a.fighters[0].melee,DEFAULT_STATS[id].melee);const b=new Duel('HP',false,pair,{},null,1,1);assert.equal(b.fighters[0].hp,DEFAULT_STATS[id].hp);}
{const d=new Duel('HP-TEAM',false,['sasuke','sasuke','naruto','naruto'],{sasuke:{hp:2300},naruto:{hp:20000}},['A','A','B','B'],2,10);assert.deepEqual(d.fighters.map(f=>f.max),[23000,23000,200000,200000]);assert.equal(d.arena.scale,2);}
{const d=new Duel('HP-NARUTO',false,['naruto','goku'],{},null,1,10),f=d.fighters[0];f.hp=f.max/2;d.awakenNaruto();assert.equal(f.transformStarted,false);f.hp--;d.awakenNaruto();assert.equal(f.transformStarted,true);}
console.log('Global HP passed: all nine fighters, customized base, team duplicates, separate arena scale, x1 reset, clamp and Naruto threshold.');
