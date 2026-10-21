import assert from 'node:assert/strict';
import {LiveArenaUI,LIVE_TIMINGS} from '../dist/src/live-arena.js';
import {CHARACTERS} from '../dist/src/characters/index.js';
const elems={};const el=()=>({value:'',checked:false,hidden:false,style:{},children:[],classList:{add(){},remove(){}},append(...c){this.children.push(...c);},set innerHTML(v){this.children=[];},textContent:''});
globalThis.document={createElement:el};const $=id=>elems[id]??=el();$('mode').value='live';$('speed').value='4';
let d={},resultAge=0,toggles=0,clean=false,ready=true,unlocks=0;
const names=Object.fromEntries(Object.keys(CHARACTERS).map(id=>[id,id.toUpperCase()]));
const h={$,names,settings:()=>({seed:'TEST',arenaScale:1,hpMultiplier:2}),ready:()=>ready,duel:()=>d,resultAge:()=>resultAge,stop(){},toggleBattle(){toggles++;},portraitURL:id=>id,unlock(){unlocks++;},setLiveView:v=>clean=v,async reset(){const c=u.battleConfig();d={result:null,fighters:c.pair.map((id,i)=>({uid:String(i),id,team:c.teams[i],hp:200,max:200,damage:10}))};resultAge=0;}};
const u=new LiveArenaUI(h);await u.create();assert.equal(u.phase,'intro');assert(clean);assert.equal(unlocks,1);assert.equal($('speed').value,'1');assert.equal(new Set(u.model.entries.map(e=>e.players[0])).size,8);
const first=u.model,firstSeed=first.settings.seed;assert.equal(first.settings.hpMultiplier,2);
u.frame(2);u.toggle();const age=u.age;u.frame(9);assert.equal(u.age,age);u.toggle();
u.frame(LIVE_TIMINGS.intro);assert.equal(u.phase,'battle');assert.equal(toggles,1);
// A draw replays this bracket slot, including the automatic loading guard.
d.result='draw';resultAge=5;u.frame(.01);assert.equal(u.phase,'waiting');assert.equal(u.model.current.replays,1);u.frame(5);await Promise.resolve();await Promise.resolve();assert.equal(u.phase,'intro');
for(let n=0;n<7;n++){
 u.frame(5);assert.equal(u.phase,'battle');d.fighters[1].hp=0;d.result='teamA';resultAge=4.9;u.frame(.01);assert.equal(u.phase,'battle');resultAge=5;u.frame(.01);assert.equal(u.phase,n===6?'complete':'waiting');
 if(n<6){u.frame(5);await Promise.resolve();await Promise.resolve();assert.equal(u.phase,'intro');}
}
assert.equal(u.completedCups,1);assert.equal(u.totalMatches,8);assert.equal(u.champions.size,1);
u.toggle();u.frame(20);assert.equal(u.model,first);u.toggle();u.frame(8);await Promise.resolve();await Promise.resolve();assert.notEqual(u.model,first);assert.equal(u.cupNumber,2);assert.notEqual(u.model.settings.seed,firstSeed);assert.equal(u.phase,'intro');
// Canvas rendering is finite and balanced without any portraits available.
let balance=0;const ctx=new Proxy({save(){balance++;},restore(){balance--;},createLinearGradient(){return {addColorStop(){}};}},{get:(o,k)=>o[k]??((...args)=>assert(args.filter(v=>typeof v==='number').every(Number.isFinite)))});
for(const phase of ['intro','battle','waiting','complete','loading','error']){u.phase=phase;if(phase==='complete')u.model.champion=0;u.draw(ctx,1);}assert.equal(balance,0);u.model.champion=null;
// Failure is visible and retries explicitly. Stopping invalidates pending loads.
u.phase='waiting';ready=false;await u.next();assert.equal(u.phase,'error');ready=true;await u.next();assert.equal(u.phase,'intro');
u.setView(false);assert.equal(clean,false);u.leave();assert.equal(u.active,false);assert.equal($('speed').value,'4');assert.equal($('speed').disabled,false);
$('mode').value='duel';u.update();assert.equal($('livePanel').hidden,true);
// An old async asset load must never resurrect a stopped session.
$('mode').value='live';let release;h.reset=()=>new Promise(resolve=>release=resolve);const pending=u.create();assert.equal(u.phase,'loading');u.leave();release();await pending;assert.equal(u.model,null);assert.equal(u.phase,'setup');assert.equal(clean,false);
console.log('Live Arena passed: 8 unique entrants, timings/pause, draw replay, 7-match championship, repeat cup, loading/retry, clean view, speed restoration and finite render.');
