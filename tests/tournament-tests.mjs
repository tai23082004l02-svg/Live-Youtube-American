import assert from 'node:assert/strict';
import {Tournament,drawEntrants} from '../dist/src/engine/tournament.js';
import {Duel} from '../dist/src/engine/sim.js';
import {setTeamUltimateEnabled} from '../dist/src/engine/team-ultimate.js';
const entries=Array.from({length:8},(_,i)=>({name:'Entrant '+i,players:[['goku','vegeta','naruto','beerus','ichigo','gaara','yugi','broly'][i]]}));
const bracket=new Tournament(entries,{seed:'CUP',format:'single',hpMultiplier:2,teamUltimateEnabled:true,stats:{goku:{hp:2300}}});
entries[0].players[0]='frieza';assert.equal(bracket.entries[0].players[0],'goku');
assert.throws(()=>new Tournament(entries.slice(0,7)));assert.throws(()=>new Tournament(entries.map(e=>({...e,players:[]}))));assert.throws(()=>new Tournament(entries.map(e=>({...e,players:['goku','vegeta']})),{format:'single'}));
const shuffled=drawEntrants(entries,'DRAW');assert.deepEqual(shuffled,drawEntrants(entries,'DRAW'));assert.deepEqual(shuffled.map(e=>e.name).sort(),entries.map(e=>e.name).sort());assert.notDeepEqual(shuffled,drawEntrants(entries,'OTHER'));
const first=bracket.battleConfig();assert.equal(first.teamUltimateEnabled,false);assert.equal(first.hpMultiplier,2);assert.equal(first.stats.goku.hp,2300);assert.equal(bracket.record('draw'),false);assert.equal(bracket.current.index,0);assert.equal(bracket.current.replays,1);assert.notEqual(bracket.battleConfig().seed,first.seed);
for(let i=0;i<7;i++){const m=bracket.current;assert.equal(m.index,i);bracket.record(i%2?'teamB':'teamA',[{team:'A',damage:100,hp:100},{team:'B',damage:50,hp:0}]);}assert.equal(bracket.current,null);assert.equal(bracket.matches.filter(m=>m.winner!==null).length,7);assert.equal(bracket.entries[bracket.champion].wins,3);assert.throws(()=>bracket.record('teamA'));
// Real simulations: mirrored entrants supported; every round starts clean and replays.
for(const format of ['single','teams']){
 const run=()=>{const t=new Tournament(Array.from({length:8},(_,i)=>({name:'Team '+i,players:format==='single'?['goku']:['goku','vegeta']})),{format,seed:'REAL-CUP',teamUltimateEnabled:false});
  const results=[];while(t.current){const c=t.battleConfig(),d=new Duel(c.seed,false,c.pair,c.stats,c.teams,1,1);setTeamUltimateEnabled(d,c.teamUltimateEnabled);assert(d.fighters.every(f=>f.hp===f.max));assert.equal(d.teamUltimate,null);assert.equal(d.personalUltimate,null);for(let n=0;n<40000&&!d.result;n++)d.step();assert(d.result);results.push([d.seed,d.tick,d.result]);t.record(d.result,d.fighters);assert(results.length<50,'rematches must converge');}assert.equal(results.filter(r=>r[2]!=='draw').length,7);return JSON.stringify([results,t.entries,t.champion]);};assert.equal(run(),run());
}
const ten=new Tournament(Array.from({length:8},(_,i)=>({name:'Squad '+i,players:Array(5).fill('ichigo')})),{format:'teams',seed:'TEN',teamUltimateEnabled:true});const cfg=ten.battleConfig(),d=new Duel(cfg.seed,false,cfg.pair,{},cfg.teams);assert.equal(d.fighters.length,10);assert.equal(new Set(d.fighters.map(f=>f.uid)).size,10);assert(d.teamUltimate);assert(d.fighters.every(f=>f.rage===0&&f.hollowEnd===0));
console.log('Tournament passed: 8 entrants/7 matches, seeded draw/manual order, bracket propagation, ties/rematch, snapshot isolation, real solo/team replay, mirrors, fresh HP/rage/buffs and5v5.');
