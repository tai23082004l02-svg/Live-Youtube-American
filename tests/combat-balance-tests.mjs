import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {normalizeStats,DEFAULT_STATS} from '../dist/src/engine/config.js';
import {Duel} from '../dist/src/engine/sim.js';
import {recordPersonalDamage} from '../dist/src/engine/personal-ultimate.js';
import {recordTeamDamage} from '../dist/src/engine/team-ultimate.js';

assert.equal(DEFAULT_STATS.saber.hp,1400);
assert.equal(DEFAULT_STATS.saber.blockChance,40);
for(const s of Object.values(DEFAULT_STATS))assert.equal(s.blinkCooldown,3);
const app=readFileSync(new URL('../dist/src/app.js',import.meta.url),'utf8');
const migration=app.slice(app.indexOf('let appliedStats;'),app.indexOf('let arenaScale='));
function load(saved){
 const data=new Map([['down-arena-stats-v1',JSON.stringify(saved)]]);
 const context=vm.createContext({normalizeStats,window:{localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}}});
 vm.runInContext(migration,context);
 return {read:()=>vm.runInContext('appliedStats',context),data,context};
}
let loaded=load({saber:{hp:1150,blockChance:18,blinkCooldown:6},goku:{blinkCooldown:6}});
assert.equal(loaded.read().saber.hp,1400);assert.equal(loaded.read().saber.blockChance,40);assert.equal(loaded.read().goku.blinkCooldown,3);
loaded=load({saber:{hp:1800,blockChance:65,blinkCooldown:9},goku:{blinkCooldown:2}});
assert.equal(loaded.read().saber.hp,1800);assert.equal(loaded.read().saber.blockChance,65);assert.equal(loaded.read().saber.blinkCooldown,9);assert.equal(loaded.read().goku.blinkCooldown,2);
loaded.data.set('down-arena-stats-v1',JSON.stringify({saber:{hp:1150,blockChance:18,blinkCooldown:6}}));
vm.runInContext(migration.replace("let appliedStats;",""),loaded.context);assert.equal(loaded.read().saber.hp,1150,'one-time migration preserves later custom settings');

// Unclamped blink distance, cooldown expiry, root restriction and ordinary sidestep.
for(let seed=0;seed<20;seed++){
 const d=new Duel('BLINK-BALANCE-'+seed,false,['goku','vegeta'],{},null,2);
 const f=d.fighters[0];f.x=480;f.y=270;d.fighters[1].x=50;d.fighters[1].y=65;
 const x=f.x,y=f.y;assert(d.evade(f,true));const distance=Math.hypot(f.x-x,f.y-y);
 assert(distance>=140-1e-9&&distance<=250+1e-9);assert.equal(f.blinkCd,3);
 f.rootUntil=d.tick+100;assert.equal(d.evade(f,true),false);
}
// No lock after spending either meter; regular damage can refill immediately.
for(const personal of [true,false]){
 const d=new Duel('RAGE-RESTART',false,personal?['saber','goku']:['goku','vegeta'],{},personal?null:['A','B']);
 while(d.introRemaining)d.step();d.fighters.forEach(f=>{f.think=1e9;f.state='idle';f.moveX=f.moveY=0;});
 const [f,t]=d.fighters,meter=personal?f:d.teamUltimate.teams.A;meter.rage=100;
 for(let n=0;n<120;n++)d.step();assert.equal(d.tick,0);assert.equal(personal?f.rageLockUntil:meter.lockUntil,0);
 const before=meter.rage;(personal?recordPersonalDamage:recordTeamDamage)(d,f,t,100);assert(meter.rage>before);
 const after=meter.rage;(personal?recordPersonalDamage:recordTeamDamage)(d,f,t,100,true);assert.equal(meter.rage,after);
}
console.log('Combat balance passed: saved/default/custom migration, Saber HP/block, 3s farther blink, two-second freeze and immediate rage refill without Ultimate feedback.');
