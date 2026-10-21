import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {TEAM_VOICE_STEPS} from '../dist/src/engine/ultimate-rules.js';
for(const id of ['goku_ultra','sung_jinwoo','ichigo','saber','tatsumaki','boa_hancock','gojo','sukuna']){
 const d=new Duel('TEAM-VOICE',false,[id,'goku'],{},['A','B']);
 while(d.introRemaining)d.step();
 d.fighters.forEach(f=>{f.rage=0;f.think=999;});d.teamUltimate.teams.A.rage=100;
 const tick=d.tick,positions=JSON.stringify(d.fighters.map(f=>[f.x,f.y,f.hp]));
 for(let i=0;i<TEAM_VOICE_STEPS[id]-1;i++){d.step();assert(d.teamUltimate.cinematic);assert.equal(d.tick,tick);assert.equal(JSON.stringify(d.fighters.map(f=>[f.x,f.y,f.hp])),positions);}
 d.step();assert.equal(d.teamUltimate.cinematic,null);assert.equal(d.teamUltimate.attack.phase,'warning');
}
console.log('Team voice timing passed: six leader durations, frozen combat and release after speech.');
