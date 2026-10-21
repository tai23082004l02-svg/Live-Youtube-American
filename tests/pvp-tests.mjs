import assert from 'node:assert/strict';
import {Duel} from './baseline-fixture.mjs';
const roster=['goku','vegeta','broly','piccolo'];
for(let i=0;i<100;i++){
 const pair=i%2?roster:[...roster].reverse(),d=new Duel('pvp4-'+i,!!(i%3),pair);
 assert.equal(new Set(d.fighters.map(f=>f.x+','+f.y)).size,4);
 while(!d.result){d.step();for(const f of d.fighters){assert(Number.isFinite(f.x+f.y+f.hp));assert(f.x>=40&&f.x<=920&&f.y>=65&&f.y<=490);assert(f.hp>=0&&f.hp<=f.max);if(f.hp===0)assert.equal(f.state,'defeat');}}
 assert(d.result);assert(['draw',...roster].includes(d.result));
 if(i<4){const replay=new Duel('pvp4-'+i,!!(i%3),pair);while(!replay.result)replay.step();assert.deepEqual(replay,d);}
}
assert.throws(()=>new Duel('invalid',false,[...roster,'goku']));
assert.throws(()=>new Duel('invalid',false,['piccolo','piccolo']));
const d=new Duel('timeout4',false,roster);d.tick=3599;for(const f of d.fighters){f.hp=f.max/2;f.state='melee';f.age=-100;}d.step();assert.equal(d.result,null);
console.log('PVP tests passed: 100 four-player games, spawn separation, invariants, replay and no time limit.');
