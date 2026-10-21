import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
function fixture(target='goku'){
 const d=new Duel('ULTIMATE-HIT',false,['ichigo',target]);
 while(d.introRemaining)d.step();
 d.fighters.forEach((f,i)=>Object.assign(f,{x:250+i*400,y:270,state:'idle',moveX:0,moveY:0,think:1e9,critChance:0,dodgeChance:0,blinkChance:0,blockChance:0}));
 return d;
}
function fire(d,ultimate=true,piercing=false){const [f,t]=d.fighters;d.shots.push({id:f.id,ownerUid:f.uid,x:t.x-50,y:270,vx:6000,vy:0,radius:30,life:1,damage:100,ultimate,piercing,hitUids:[]});}
for(const piercing of [false,true]){
 const d=fixture('goku_ultra'),[,t]=d.fighters;
 Object.assign(t,{dodgeChance:100,blinkChance:100,invulnerable:10});
 fire(d,true,piercing);d.step();assert.equal(t.hp,t.max-100);assert.equal(t.evades,0);assert.equal(t.blinks,0);assert.equal(t.skillUses.instinctcounter,0);
}
// Position determines whether it hits: leaving the projectile path avoids damage.
{const d=fixture(),[,t]=d.fighters;fire(d);t.y=450;d.step();assert.equal(t.hp,t.max);}
// Moving via a real blink before impact also avoids a fixed path when landing outside it.
{const d=fixture(),[,t]=d.fighters;fire(d);let n=0;d.rand=()=>n++%2===0?.25:0;assert(d.evade(t,true));assert(t.y>300);d.step();assert.equal(t.hp,t.max);}
// Defense damage modifiers remain; normal projectiles still allow random evasion.
{const d=fixture(),[,t]=d.fighters;Object.assign(t,{dodgeChance:100,blinkChance:100,blockChance:100,blockReduction:50,damageReduction:20});fire(d);d.step();assert.equal(t.hp,t.max-40);}
{const d=fixture(),[,t]=d.fighters;t.dodgeChance=100;fire(d,false);d.step();assert.equal(t.hp,t.max);assert.equal(t.evades,1);}
console.log('Ultimate hits passed: piercing/nonpiercing hits ignore automatic evasion/iframe/passive counter, leaving path by movement/blink escapes, block/armor and ordinary dodges preserved.');
