import {ACTIVE_CHARACTERS} from '../dist/src/characters/index.js';
import {liveCupEntrants} from '../dist/src/engine/live-exhibition.js';
import {drawSpectatorIntro,spectatorIntroAssets} from '../dist/src/render/spectator-intro.js';
import assert from 'node:assert/strict';
import {VerticalArenaUI} from '../dist/src/vertical-arena.js';
import {Grandstand} from '../dist/src/render/grandstand.js';
import {LiveExhibition,exhibitionRoster} from '../dist/src/engine/live-exhibition.js';
import {portraitHorizontalLimits} from '../dist/src/engine/arena.js';
import {Duel} from '../dist/src/engine/sim.js';
import {CHARACTERS} from '../dist/src/characters/index.js';
const names=Object.fromEntries(Object.keys(CHARACTERS).map(id=>[id,id.toUpperCase()]));
const formats=new Set();for(let i=0;i<100;i++){const a=exhibitionRoster(names,'R'+i);formats.add(a.size);assert.equal(new Set(a.players).size,a.size*2);assert.deepEqual(a,exhibitionRoster(names,'R'+i));}assert.deepEqual([...formats].sort(),[1,2,5]);
for(const n of [1,2,5])for(const scale of [1,2,4]){
 const pair=Object.keys(names).slice(0,n*2),teams=pair.map((_,i)=>i<n?'A':'B'),d=new Duel('PORTRAIT',false,pair,{},teams,scale,1,'portrait');assert.equal(d.arena.layout,'portrait');
 const a=d.arena;const within=()=>{for(const f of d.fighters){assert(f.x>=a.minX&&f.x<=a.maxX);assert(f.y>=a.minY&&f.y<=a.maxY);const [left,right]=portraitHorizontalLimits(a,f.y);assert(f.x>=left-1e-8&&f.x<=right+1e-8);assert(Number.isFinite(f.hp));}};within();for(let i=0;i<600&&!d.result;i++){d.step();within();}
 for(const x of [-9999,480,9999])for(const y of [-9999,a.minY,270,a.maxY,9999]){const f=d.clampPosition({x,y}),[left,right]=portraitHorizontalLimits(a,f.y);assert(f.x>=left&&f.x<=right);assert(f.y>=a.minY&&f.y<=a.maxY);assert.deepEqual(d.clampPosition({...f}),f);}assert.equal(d.arena.width,540*scale);
}
class Loader{async load(){return {complete:true,naturalWidth:1000};}retain(ids){this.kept=[...ids];}}
const stand=new Grandstand(names,new Loader());await stand.start('STANDS');assert.equal(stand.ids.filter(Boolean).length,1);
const planned=[...stand.queue.ids];assert.equal(new Set(planned).size,6);
for(let i=1;i<6;i++){stand.tick(9.999);assert.equal(stand.ids.filter(Boolean).length,i);stand.tick(.001);assert.equal(stand.ids.filter(Boolean).length,i+1);assert.equal(stand.ids[i],planned[i]);}
stand.tick(9.999);assert.deepEqual(stand.ids,planned);stand.tick(.001);for(let i=0;i<5;i++)await Promise.resolve();assert.equal(stand.rotations,2);assert.notEqual(stand.ids[0],planned[0]);assert.deepEqual(stand.ids.slice(1),planned.slice(1));
stand.tick(10);assert.notEqual(stand.ids[1],planned[1]);assert.equal(stand.slotBorn[1],70);assert.equal(new Set(stand.ids).size,6);
assert(stand.loader.kept.length>=6);
stand.stop();assert.equal(stand.ids.length,0);assert.equal(stand.loader.kept.length,0);

const elems={};const el=()=>({value:'',checked:false,hidden:false,style:{},children:[],classList:{add(){},remove(){}},append(...c){this.children.push(...c);},set innerHTML(v){this.children=[];},textContent:''});globalThis.document={createElement:el};const $=id=>elems[id]??=el();$('mode').value='live_vertical';$('speed').value='2';
let d={},age=0,portraitView=false,ready=true,toggles=0;
const h={$,names,standLoader:new Loader(),settings:()=>({seed:'VERTICAL',hpMultiplier:2,arenaScale:1}),duel:()=>d,resultAge:()=>age,ready:()=>ready,stop(){},toggleBattle(){toggles++;},portraitURL:id=>id,setPortraitView:v=>portraitView=v,async reset(){const c=u.battleConfig();assert.equal(c.arenaLayout,'portrait');d=new Duel(c.seed,false,c.pair,{},c.teams,c.arenaScale,c.hpMultiplier,c.arenaLayout);age=0;}};
const u=new VerticalArenaUI(h);const settle=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};await u.create();assert.equal(u.phase,'intro');assert(portraitView);assert.equal(u.segment,'exhibition');assert.equal(toggles,1,'combat starts immediately during intro');u.toggle();assert.equal(toggles,2);const frozen=u.age;u.frame(1);assert.equal(u.age,frozen);u.toggle();assert.equal(toggles,3);u.frame(1);assert.equal(u.phase,'intro');const calls=toggles;u.frame(4);assert.equal(u.phase,'battle');assert.equal(toggles,calls,'ending intro must not pause combat');
for(let i=0;i<5;i++){u.frame(5);assert.equal(u.phase,'battle');d.fighters.filter(f=>f.team==='B').forEach(f=>f.hp=0);d.result='teamA';age=5;u.frame(.01);assert.equal(u.phase,'waiting');u.frame(5);await settle();assert.equal(u.phase,i===4?'draft':'intro');}
assert.equal(u.randomDone,5);assert.equal(u.cupNumber,1);assert.equal(u.model.entries.length,8);assert.equal(new Set(u.model.entries.map(e=>e.players[0])).size,8);
u.toggle();const before=u.age;u.frame(80);assert.equal(u.age,before);u.toggle();u.frame(8);await settle();assert.equal(u.phase,'intro');
for(let i=0;i<7;i++){u.frame(5);d.fighters.filter(f=>f.team==='B').forEach(f=>f.hp=0);d.result='teamA';age=5;u.frame(.01);assert.equal(u.phase,i===6?'complete':'waiting');if(i<6){u.frame(5);await settle();}}
assert.equal(u.completedCups,1);assert.equal(u.totalMatches,12);u.frame(8);await settle();assert.equal(u.segment,'exhibition');assert.equal(u.cycle,2);assert.equal(u.randomDone,0);
// The compositor's last operation must black out the exact bottom quarter.
let balance=0;const fills=[],labels=[];const ctx=new Proxy({globalAlpha:1,createRadialGradient(){return {addColorStop(){}};},save(){balance++;},restore(){balance--;},fillText(value,x,y){labels.push({value,y});},fillRect(...args){fills.push({args,color:this.fillStyle});},createLinearGradient(){return {addColorStop(){}};}},{get:(o,k)=>o[k]??((...args)=>assert(args.filter(v=>typeof v==='number').every(Number.isFinite)))});
for(const phase of ['intro','battle','waiting','draft','complete','error']){
 u.phase=phase;if(phase==='draft'||phase==='complete'){u.beginDraft();u.phase=phase;if(phase==='complete')u.model.champion=0;}if(phase==='waiting')u.segment='exhibition';
 fills.length=0;labels.length=0;u.present(ctx,{},{},false);if(phase==='intro')assert.equal(labels.length,0,'no team introduction or labels at match start');assert(fills.some(f=>f.color==='#000'&&JSON.stringify(f.args)==='[0,720,540,240]'));assert(labels.filter(t=>t.y>=192).every(t=>t.y>=720&&t.y<=960),'status panels stay below arena in '+phase);assert.equal(balance,0);
}
u.leave();assert.equal(portraitView,false);assert.equal($('speed').value,'2');assert.equal(u.active,false);
console.log('Vertical passed: all formats/scales/bounds, deterministic unique teams,60s spectator rotation/cache,5 exhibitions→8-person cup→repeat, pause and black25% in every phase.');

// Every supported guest uses its native entrance atlas and effect, with full cells.
for(const id of ['sukuna','gojo','beerus','goku_blue','ichigo','sung_jinwoo','goku_ultra','saber','tatsumaki','boa_hancock']){
 const assets=spectatorIntroAssets(id),ims=Object.fromEntries(assets.map(key=>[key,{key,complete:true,naturalWidth:4000}])),drawn=[];let depth=0;
 const c=new Proxy({save(){depth++;},restore(){depth--;},drawImage(...args){drawn.push(args);}}, {get:(o,k)=>o[k]??((...args)=>assert(args.filter(v=>typeof v==='number').every(Number.isFinite)))});
 for(const age of [0,.4,.8,1.2,1.6,2.1,2.49])assert(drawSpectatorIntro(c,ims,id,age,61));
 assert(drawn.some(a=>a[0].key===assets[1]),id+' entrance actor');assert(drawn.some(a=>a[0].key===assets[2]),id+' entrance VFX');assert.equal(depth,0);
 assert.equal(drawSpectatorIntro(c,ims,id,2.5,61),false);
}
assert.deepEqual(spectatorIntroAssets('goku'),['goku']);
console.log('Spectator entrances passed: native character/effect atlases for all8 supported intros, finite full-cell rendering and completion.');

// Stray shots cross the old y0 render boundary and remain through the gallery.
for(const scale of [1,2,4]){
 const d=new Duel('GALLERY-SHOT',false,['goku','vegeta'],{},['A','B'],scale,1,'portrait');
 d.fighters.forEach(f=>{f.think=999;f.moveX=f.moveY=0;});const f=d.fighters[0];
 d.shots.push({id:f.id,ownerUid:f.uid,kind:'test',damage:10,radius:2,x:480,y:d.arena.top+10*scale,vx:0,vy:-300*scale,life:10});
 for(let i=0;i<30;i++)d.step();assert.equal(d.shots.length,1,'shot survives into terrace at scale '+scale);assert(d.shots[0].y<d.arena.top-60*scale);
 for(let i=0;i<100;i++)d.step();assert.equal(d.shots.length,0,'shot cleaned outside full scene');
}
console.log('Gallery projectiles passed: cross former floor boundary, survive above terrace, clean outside scene at1/2/4x.');

// The inactive preview must not composite a previous/horizontal match canvas.
const staleScene={stale:true},sceneDraws=[];
const previewCtx=new Proxy({save(){},restore(){},drawImage(...args){sceneDraws.push(args);}}, {get:(o,k)=>o[k]??(()=>{})});
u.present(previewCtx,staleScene,null,false);assert(!sceneDraws.some(a=>a[0]===staleScene));
console.log('Vertical idle preview passed: stale match layer excluded before Start Live.');

const activeNames=Object.fromEntries(Object.entries(ACTIVE_CHARACTERS).map(([id,c])=>[id,c.name]));assert.equal(Object.keys(activeNames).length,8);
for(let seed=0;seed<100;seed++){const r=exhibitionRoster(activeNames,'SIX-'+seed);assert.equal(r.players.length,r.size*2);for(const team of [r.players.slice(0,r.size),r.players.slice(r.size)])assert.equal(new Set(team).size,r.size);assert(r.players.every(id=>id in activeNames));const cup=liveCupEntrants(activeNames,'SIX-'+seed);assert.equal(cup.length,8);assert.equal(new Set(cup.map(e=>e.players[0])).size,8);}
console.log('Six-fighter roster passed: all formats including unique5-person teams, active-only8-slot cups and seeded repeats.');
