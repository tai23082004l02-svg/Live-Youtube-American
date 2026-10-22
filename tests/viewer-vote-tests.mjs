import assert from 'node:assert/strict';
import {ViewerVote,ViewerMatch} from '../dist/src/engine/viewer-vote.js';
import {ACTIVE_CHARACTERS} from '../dist/src/characters/index.js';
import {Duel} from '../dist/src/engine/sim.js';
import {drawVoteBroadcast,VOTE_LAYOUT} from '../dist/src/render/viewer-vote.js';
const names=Object.fromEntries(Object.entries(ACTIVE_CHARACTERS).map(([id,c])=>[id,c.name]));
const v=new ViewerVote(names,{seed:'DEMO'}),ids=[...v.ids];assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);
assert(v.cast('viewer',1));assert(v.cast(' viewer ',2));assert.equal(v.votes.size,1);assert.equal(v.rows[0].count,0);assert.equal(v.rows[1].count,1);
for(const n of ['0','7','1 hi','11','1.1','',null])assert.equal(v.cast('x',n),false);assert(!v.cast('',1));
assert.equal('remaining' in v,false);assert.deepEqual(v.ids,ids);
v.cast('two',3);v.cast('three',3);v.lock();assert(v.locked);assert.equal(v.winners[0],ids[2]);assert.equal(v.winners[1],ids[1]);assert(!v.cast('late',1));assert.deepEqual(v.lock(),v.winners);assert.equal(new Set(v.winners).size,2);
const zeroA=new ViewerVote(names,{seed:'NONE'}),zeroB=new ViewerVote(names,{seed:'NONE'});assert.deepEqual(zeroA.lock(),zeroB.lock());
const many=Object.fromEntries(Array.from({length:50},(_,i)=>['c'+i,'Fighter '+i]));const seen=new Set();for(let round=1;round<=9;round++){const r=new ViewerVote(many,{seed:'BIG',round});assert.equal(r.ids.length,6);r.ids.forEach(id=>seen.add(id));}assert.equal(seen.size,50);
const two=new ViewerVote({a:'A',b:'B'},{exclude:['a','b']});assert.equal(two.ids.length,2);assert(!two.cast('x',3));
const excluded=new ViewerVote(names,{exclude:ids.slice(0,2)});assert(excluded.ids.every(id=>!ids.slice(0,2).includes(id)));
const match=new ViewerMatch(names,v.winners,'MATCH');const config=match.battleConfig();assert.deepEqual(config.pair,v.winners);assert.equal(config.teams.length,2);assert.equal(config.teamUltimateEnabled,false);assert.equal(match.record('draw'),false);assert(match.battleConfig().seed.endsWith('R1'));assert(match.record('teamA'));assert.equal(match.champion,0);
const d=new Duel(config.seed,false,config.pair,{},config.teams);for(let i=0;i<1000&&!d.result;i++)d.step();assert(d.fighters.every(f=>[f.hp,f.x,f.y].every(Number.isFinite)));
const calls=[],noop=()=>{},ctx=new Proxy({fillText:(...a)=>calls.push(a),drawImage:(...a)=>calls.push(a)},{get:(o,k)=>o[k]||noop,set:(o,k,val)=>(o[k]=val,true)});const u={active:true,ballot:v,h:{names},phase:'battle',matchNumber:1};drawVoteBroadcast(ctx,u,{});assert(calls.some(x=>String(x[0]).includes('YOUTUBE CHAT NOT CONNECTED')));assert(calls.some(x=>x[1]===0&&x[2]===328&&x[3]===540&&x[4]===VOTE_LAYOUT.arenaHeight));
console.log('Viewer vote PASS: bounded rotating roster, stable numbers, replacement/dedup, invalid/late vote rejection, deterministic tie/no-vote fallback, top-two selection, rematch and battle config, portrait composition/demo label.');

// The live scheduler closes on the battle result, not on elapsed time or the victory animation.
const {VotingArenaUI}=await import('../dist/src/voting-arena.js');
function controller(result=null){const u=Object.create(VotingArenaUI.prototype);const d={result,fighters:[]};u.$=id=>id==='mode'?{value:'live_vote'}:{checked:false};u.h={duel:()=>d,resultAge:()=>0,names};u.model=new ViewerMatch(names,Object.keys(names).slice(0,2),'SCHEDULER');u.ballot=new ViewerVote(names);u.phase='battle';u.age=0;u.paused=false;u.totalMatches=0;u.update=()=>{};return {u,d};}
{const {u,d}=controller();u.frame(46);assert(!u.ballot.locked,'long battles keep voting open');assert(u.ballot.cast('viewer',1));u.paused=true;const age=u.age;u.frame(10);assert.equal(u.age,age);u.paused=false;d.result='teamA';u.frame(.01);assert(u.ballot.locked,'locks immediately on result');assert.equal(u.phase,'battle','does not wait for victory animation to lock');assert(!u.ballot.cast('late',2));const expected=[...u.ballot.winners];u.h.resultAge=()=>5;u.frame(.01);assert.equal(u.phase,'waiting');u.prepareMatch=pair=>u.nextPair=pair;u.frame(5);assert.deepEqual(u.nextPair,expected);}
{const {u,d}=controller();u.ballot.cast('viewer',2);const ids=[...u.ballot.ids];d.result='draw';u.h.resultAge=()=>5;u.frame(.01);assert(u.ballot.locked);u.next=()=>u.rematched=true;u.frame(5);assert(u.rematched);assert(!u.ballot.locked);assert.equal(u.ballot.votes.size,1);assert.deepEqual(u.ballot.ids,ids);}
console.log('Battle-end voting PASS: no 45s cutoff, immediate result lock, late rejection, victory/intermission transition, pause and draw-rematch reopening.');
