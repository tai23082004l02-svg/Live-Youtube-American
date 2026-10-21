import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {assetsForPair} from '../dist/src/engine/assets.js';
import {GOJO_SKILLS,gojoPose} from '../dist/src/characters/gojo.js';
import {GOJO_V2_META} from '../dist/src/render/gojo-v2-meta.js';
import {drawGojoActor,drawGojoBack,drawGojoWorld,drawGojoCinematic,drawGojoShot} from '../dist/src/render/gojo-v2.js';
import {setTeamUltimateEnabled} from '../dist/src/engine/team-ultimate.js';
function fixture(pair=['gojo','goku'],teams=null){const ids=[...new Set(pair)],stats=Object.fromEntries(ids.map(id=>[id,{hp:20000,dodgeChance:0,blinkChance:0,blockChance:0,critChance:0,reactionChance:0,counterChance:0}]));const d=new Duel('GOJO-V2',false,pair,stats,teams);while(d.introRemaining)d.step();setTeamUltimateEnabled(d,false);d.fighters.forEach((f,i)=>{f.x=300+i*200;f.y=270;f.think=999;f.infinityChance=0;f.rage=0;});return d;}
const advance=(d,n)=>{for(let i=0;i<n;i++)d.step();};
for(const skill of Object.keys(GOJO_SKILLS)){const d=fixture(),[f,t]=d.fighters;d.act(f,skill,1,0);advance(d,150);assert.equal(t.max-t.hp,skill==='blue'?105:skill==='red'?165:290,skill);assert(f[skill+'Cd']>0);assert.equal(f.skillUses[skill],1);}
{const d=fixture(['gojo','gojo','goku'],['A','A','B']),[f,ally,t]=d.fighters;ally.x=480;t.x=520;d.act(f,'blue',1,0);advance(d,70);assert.equal(ally.hp,ally.max);assert(t.hp<t.max);}
{const d=fixture(),[f,t]=d.fighters;f.infinityChance=100;const hit=()=>d.shots.push({id:t.id,ownerUid:t.uid,kind:'test',x:f.x-1,y:f.y,vx:60,vy:0,life:1,damage:100,radius:10});hit();d.step();assert.equal(f.max-f.hp,30);assert.equal(f.infinityReady,d.tick+240);hit();d.step();assert.equal(f.max-f.hp,130);assert.equal(d.events.filter(e=>e.type==='infinityGuard').length,1);}
{const d=fixture(),[f,t]=d.fighters;f.rage=100;const start=d.tick;d.step();assert.equal(d.personalUltimate.cinematic.kind,'void');while(d.personalUltimate.cinematic)d.step();assert.equal(d.tick,start);advance(d,160);assert.equal(t.max-t.hp,840);assert.equal(d.personalUltimate.attack,null);assert(f.rage>0);}
{const d=fixture(),[f,t]=d.fighters;f.rage=100;d.step();while(d.personalUltimate.cinematic)d.step();t.x=850;advance(d,160);assert.equal(t.hp,t.max,'leaving domain escapes');}
assert.equal(assetsForPair(['gojo']).length,6);
const images=Object.fromEntries(Object.keys(GOJO_V2_META).map(key=>[key,{key,complete:true,naturalWidth:9999}]));let depth=0;const draws=[];const ctx=new Proxy({save(){depth++;},restore(){depth--;},drawImage(...a){draws.push(a);}}, {get:(o,k)=>o[k]??((...args)=>assert(args.filter(a=>typeof a==='number').every(Number.isFinite)))});
{const d=fixture(),f=d.fighters[0];for(const age of [0,.2,.5,1,1.8,2.49]){f.introAge=age;drawGojoBack(ctx,images,d,age);drawGojoActor(ctx,images,d,f);}f.introAge=null;f.rage=100;d.step();drawGojoActor(ctx,images,d,f);drawGojoCinematic(ctx,images,d);while(d.personalUltimate.cinematic)d.step();advance(d,40);drawGojoBack(ctx,images,d,1);drawGojoWorld(ctx,images,d,1);drawGojoShot(ctx,images,{kind:'purple',vx:1,vy:0},500,250,1);}
assert(draws.some(a=>a[0].key==='gojo_v2_dialogue'));for(const a of draws){const m=GOJO_V2_META[a[0].key];assert.equal(a[3],m.frameSize[0]);assert.equal(a[4],m.frameSize[1]);}assert.equal(depth,0);
for(const state of ['idle','run','melee','dash','guard','hurt','defeat',...Object.keys(GOJO_SKILLS)])for(const age of [0,.5,2,20])assert(gojoPose({state,age,combo:1}).frame<6);
console.log('Gojo v2 passed:3 skills, team safety, Infinity reduction/cooldown, Void freeze/pulses840/escape/rage, native intro/dialogue/shot rendering and finite poses.');
