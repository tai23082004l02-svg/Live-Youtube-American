import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Duel} from '../dist/src/engine/sim.js';
import {goku_ultra,ultraPose,ULTRA_SKILLS} from '../dist/src/characters/goku_ultra.js';
import {ULTRA_META} from '../dist/src/render/ultra-meta.js';
import {drawUltraActor,drawUltraBack,drawUltraWorld,drawUltraCinematic} from '../dist/src/render/ultra.js';
import {setTeamUltimateEnabled} from '../dist/src/engine/team-ultimate.js';
function fixture(pair=['goku_ultra','goku'],teams=null){const d=new Duel('ULTRA',false,pair,{},teams);while(d.introRemaining)d.step();setTeamUltimateEnabled(d,false);d.fighters.forEach((f,i)=>Object.assign(f,{think:1e9,x:200+i*180,y:270,critChance:0,dodgeChance:0,blinkChance:0,blockChance:0,reactionChance:0}));return d;}
const advance=(d,n)=>{for(let i=0;i<n;i++)d.step();};
let d=fixture(),[f,t]=d.fighters;assert.equal(f.max,1200);assert.equal(f.speed,230);assert.equal(f.rage,0);
d.act(f,'silverrush',1,0);advance(d,67);assert.equal(f.ultraHits,3);assert.equal(t.hp,t.max-200);
d=fixture();[f,t]=d.fighters;f.rootUntil=100;f.rootX=f.x;f.rootY=f.y;d.act(f,'silverrush',1,0);advance(d,67);assert.equal(f.x,200);assert.equal(t.hp,t.max);
d=fixture();[f,t]=d.fighters;d.act(f,'instinctbeam',1,0);advance(d,100);assert.equal(t.hp,t.max-240);assert(f.y>270);assert.equal(f.invulnerable,0);
d=fixture();[f,t]=d.fighters;f.rootUntil=100;f.rootX=f.x;f.rootY=f.y;d.act(f,'instinctbeam',1,0);advance(d,75);assert.equal(f.y,270);assert.equal(t.hp,t.max-240);
// Focus modifies effective dodge/speed without changing saved stats or granting immunity.
d=fixture();[f,t]=d.fighters;d.act(f,'ultrafocus',1,0);advance(d,45);assert.equal(goku_ultra.dodgeChanceBonus(d,f),20);assert.equal(goku_ultra.movementSpeedMultiplier(d,f),1.2);assert.equal(f.dodgeChance,0);assert.equal(f.invulnerable,0);d.tick=f.focusEnd;assert.equal(goku_ultra.dodgeChanceBonus(d,f),0);assert.equal(goku_ultra.movementSpeedMultiplier(d,f),1);
// Passive rolls20% on every eligible hit without stance/cooldown or recursive counters.
d=fixture();[f,t]=d.fighters;t.x=280;f.state='instinctbeam';f.age=.8;f.counterChance=0;const savedCounterChance=f.counterChance;let hits=[],rolls=[];d.roll=p=>{rolls.push(p);return true;};assert(goku_ultra.beforeHit(d,f,t,{},hits));assert.equal(f.state,'instinctbeam');assert.equal(hits.length,1);assert.equal(hits[0].value,110);assert(goku_ultra.beforeHit(d,f,t,{},hits));assert.equal(f.skillUses.instinctcounter,2);assert.deepEqual(rolls,[20,20]);assert.equal(f.counterChance,savedCounterChance);assert.equal(f.instinctcounterCd,undefined);assert.equal(ULTRA_SKILLS.instinctcounter,undefined);assert.equal(f.invulnerable,0);
for(const h of [{guaranteed:true},{counter:true},{ultimate:true}])assert(!goku_ultra.beforeHit(d,f,t,h,[]));
f.rootUntil=100;assert(!goku_ultra.beforeHit(d,f,t,{},[]));f.rootUntil=0;f.petrifyUntil=100;assert(!goku_ultra.beforeHit(d,f,t,{},[]));f.petrifyUntil=0;d.roll=()=>false;const x=f.x;assert(!goku_ultra.beforeHit(d,f,t,{},[]));assert.equal(f.x,x);
d=fixture();[f,t]=d.fighters;t.x=700;d.roll=()=>true;hits=[];assert(goku_ultra.beforeHit(d,f,t,{},hits));assert.equal(hits.length,0);
// Exercise successful passive counter through real hit resolution.
d=fixture();[f,t]=d.fighters;t.x=280;const originalRoll=d.roll.bind(d);d.roll=p=>p===20?true:originalRoll(p);d.act(t,'melee',-1,0);advance(d,35);assert.equal(f.hp,f.max);assert.equal(t.hp,t.max-110);assert(d.events.some(e=>e.type==='ultraCounter'));
// Focus grants20 points once per cast, caps at100 and registers readiness.
d=fixture();[f,t]=d.fighters;f.rage=50;d.act(f,'ultrafocus',1,0);advance(d,45);assert(Math.abs(f.rage-(70+45*2/60))<1e-8);
d=fixture();[f,t]=d.fighters;f.rage=90;d.act(f,'ultrafocus',1,0);advance(d,39);assert.equal(f.rage,100);assert.equal(f.rageReadyTick,d.tick);assert.equal(f.skillUses.ultrafocus,1);
// Shared scheduler freezes exactly 60 steps and Ultimate damage feeds no rage.
d=fixture(['goku_ultra','ichigo','sung_jinwoo']);[f,t]=d.fighters;f.rage=t.rage=100;t.rageReadyTick=1;f.rageReadyTick=0;const snapshot=JSON.stringify([d.tick,d.rng,f.instinctbeamCd]);for(let i=0;i<240;i++){d.step();assert.equal(JSON.stringify([d.tick,d.rng,f.instinctbeamCd]),snapshot);}assert.equal(d.personalUltimate.attack.kind,'supreme');assert.equal(d.personalUltimate.attack.durationSteps,240);assert.equal(f.personalUses,1);assert.equal(t.personalUses,0);t.rage=0;advance(d,130);assert(Math.abs(f.rage-130*2/60)<1e-8);assert(t.hp<t.max);assert(Math.abs(t.rage-130*2/60)<1e-8);assert(d.events.some(e=>e.type==='fire'&&e.skill==='supreme'));
// The beam remains dodgeable, and root prevents its opening dash.
d=fixture();[f,t]=d.fighters;t.dodgeChance=t.blinkChance=100;t.invulnerable=10;f.rage=100;advance(d,320);assert(t.hp<t.max);assert.equal(t.evades,0);assert.equal(t.blinks,0);
d=fixture();[f,t]=d.fighters;f.rootUntil=1000;f.rootX=f.x;f.rootY=f.y;f.rage=100;advance(d,110);assert.equal(f.x,200);assert.equal(f.y,270);
// Death before release cancels the beam.
d=fixture();[f,t]=d.fighters;f.rage=100;advance(d,240);f.hp=0;d.step();assert.equal(d.personalUltimate.attack,null);assert(!d.shots.some(s=>s.kind==='supreme'));
for(const s of ['idle','run','melee','dash','guard','hurt','defeat',...Object.keys(ULTRA_SKILLS)])for(const age of [0,.3,1,20])assert(ultraPose({...f,state:s,age,introAge:null}).frame<6);
for(const age of [0,.69,.7,1.64,1.65,2.49]){const pose=ultraPose({...f,introAge:age});assert(pose.row<3&&pose.frame>=0&&pose.frame<6);}
for(const [key,meta] of Object.entries(ULTRA_META)){const saved=JSON.parse(readFileSync(new URL('../art/frames/goku_ultra/'+key+'.json',import.meta.url)));assert.deepEqual(meta.frameSize,saved.frameSize);}
// Renderer uses complete native cells for both facing directions and custom dialogue.
{const images=Object.fromEntries(Object.keys(ULTRA_META).map(id=>[id,{id,complete:true,naturalWidth:9999}])),calls=[],ctx=new Proxy({drawImage(im,...a){calls.push([im,...a]);}},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});d=fixture();f=d.fighters[0];for(const age of [0,.8,1.8]){f.introAge=age;drawUltraBack(ctx,images,d,age);drawUltraActor(ctx,images,d,f);drawUltraWorld(ctx,images,d);}f.introAge=null;f.rage=100;advance(d,30);drawUltraCinematic(ctx,images,d);for(const [im,...a] of calls){assert.equal(a[2],ULTRA_META[im.id].frameSize[0]);assert.equal(a[3],ULTRA_META[im.id].frameSize[1]);}assert(calls.some(c=>c[0].id==='goku_ultra_dialogue'));}
for(const [pair,teams] of [[['goku_ultra','beerus'],null],[['goku_ultra','ichigo','sung_jinwoo','yugi','naruto'],null],[Array(10).fill('goku_ultra'),Array(5).fill('A').concat(Array(5).fill('B'))]]){const run=()=>{const g=new Duel('ULTRA-REPLAY',false,pair,{},teams);advance(g,40000);assert(g.result);for(const f of g.fighters)assert(Number.isFinite(f.hp+f.x+f.y));return JSON.stringify([g.tick,g.rng,g.fighters,g.events]);};assert.equal(run(),run());}
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.equal((html.match(/<option value="goku_ultra">/g)||[]).length,16);
console.log('Goku Ultra passed: skills, counter/roots/defenses, Focus expiry, rage/Ultimate freeze/shared queue/death, native frames, deterministic FFA and mirrored 5v5.');
