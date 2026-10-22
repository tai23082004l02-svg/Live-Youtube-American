import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Duel} from '../dist/src/engine/sim.js';
import {gogeta_blue,GOGETA_BLUE_SKILLS} from '../dist/src/characters/gogeta_blue.js';
import {ACTIVE_CHARACTERS} from '../dist/src/characters/index.js';
import {ASSET_MANIFEST} from '../dist/src/engine/assets.js';
import {GOGETA_BLUE_META as META} from '../dist/src/render/gogeta-blue-meta.js';
import {GOGETA_BLUE_VOICE_STEPS,GOGETA_BLUE_VOICE_SECONDS} from '../dist/src/engine/gogeta-blue-voice.js';
import {stepPersonalUltimate,personalDanger} from '../dist/src/engine/personal-ultimate.js';
import {TEAM_VOICE_STEPS} from '../dist/src/engine/ultimate-rules.js';
import {drawGogetaBlueActor,drawGogetaBlueBack,drawGogetaBlueWorld,drawGogetaBlueChat,drawGogetaBlueCinematic,drawGogetaBlueShot,drawGogetaBlueBurst,drawGogetaBlueTeamWorld} from '../dist/src/render/gogeta-blue.js';
assert(ACTIVE_CHARACTERS.gogeta_blue);assert.equal(TEAM_VOICE_STEPS.gogeta_blue,GOGETA_BLUE_VOICE_STEPS);
const voice=JSON.parse(readFileSync('dist/assets/audio/voices/gogeta_blue_ultimate_ja.json'));assert.equal(voice.duration,GOGETA_BLUE_VOICE_SECONDS);assert.equal(voice.steps,GOGETA_BLUE_VOICE_STEPS);assert.equal(voice.steps,Math.ceil(voice.duration*60));assert(voice.duration>0&&voice.duration<=3);assert(readFileSync('dist/assets/audio/voices/gogeta_blue_ultimate_ja.mp3').length>1000);
assert.equal(JSON.parse(readFileSync('art/frames/gogeta_blue/extraction_report.json')).sources.reduce((n,s)=>n+s.nativeFrames,0),84);
for(const key of gogeta_blue.assets){assert(existsSync('dist/'+ASSET_MANIFEST[key]));const m=META[key];for(const b of m.bounds.flat()){assert(b[0]>=30&&b[1]>=30);assert(b[2]<=m.frameSize[0]-30&&b[3]<=m.frameSize[1]-30);}}
function fresh(pair=['gogeta_blue','goku'],teams=null,scale=1,layout=null){const d=new Duel('BLUE-FUSION',false,pair,{},teams,scale,1,layout);while(d.introRemaining)d.step();for(const f of d.fighters){f.state='idle';f.think=999;f.rageLockUntil=1e9;f.rage=0;f.critChance=f.blockChance=f.dodgeChance=f.blinkChance=f.reactionChance=0;f.hp=f.max=20000;f.y=270;}d.fighters[0].x=300;d.fighters[1].x=650;return d;}
const advance=(d,n)=>{for(let i=0;i<n;i++)d.step();};
// Basic combo:84 total, three distinct hits, short final knockback; misses out of range.
{const d=fresh(),[f,t]=d.fighters;t.x=375;d.act(f,'bluecombo',1,0);advance(d,45);assert.equal(t.max-t.hp,84);assert.equal(d.events.filter(e=>e.type==='hit'&&e.sourceUid===f.uid).length,3);assert(t.x>375);assert.equal(f.skillUses.bluecombo,1);}
{const d=fresh(),[f,t]=d.fighters;d.act(f,'bluecombo',1,0);advance(d,45);assert.equal(t.hp,t.max);}
// Meteor travels visibly, never teleports: frame displacement <=900/60; three hits total200.
{const d=fresh(),[f,t]=d.fighters;d.act(f,'meteorassault',1,0);let x=f.x;for(let i=0;i<65;i++){d.step();assert(Math.abs(f.x-x)<=15.01);x=f.x;}assert(f.x>300);assert.equal(t.max-t.hp,200);assert.equal(d.events.filter(e=>e.type==='hit'&&e.sourceUid===f.uid).length,3);assert(f.meteorassaultCd>6);}
{const d=fresh(),[f,t]=d.fighters;f.rootUntil=1000;f.rootX=f.x;f.rootY=f.y;d.act(f,'meteorassault',1,0);advance(d,65);assert.equal(f.x,300);assert.equal(t.hp,t.max);}
// Normal skills can be dodged/blocked and do not hit allies; sphere splash hits nearby enemies.
{const d=fresh(),[f,t]=d.fighters;t.x=375;t.blockChance=100;t.blockReduction=100;d.act(f,'bluecombo',1,0);advance(d,45);assert.equal(t.hp,t.max);}
{const d=fresh(),[f,t]=d.fighters;t.dodgeChance=100;d.act(f,'meteorassault',1,0);advance(d,65);assert.equal(t.hp,t.max);}
{const d=fresh(['gogeta_blue','goku','saber','vegeta'],['A','B','A','B']),[f,t,ally,other]=d.fighters;ally.x=480;other.x=650;other.y=345;d.act(f,'stardustbreaker',1,0);advance(d,100);assert.equal(t.max-t.hp,230);assert.equal(other.max-other.hp,75);assert.equal(ally.hp,ally.max);}
{const d=fresh(),[f,t]=d.fighters;t.x=550;d.act(f,'godpunisher',1,0);advance(d,100);assert.equal(f.blueVolley,5);assert.equal(t.max-t.hp,240);assert.equal(d.events.filter(e=>e.type==='fire'&&e.skill==='godpunisher').length,5);}
// AI closes to melee, uses rush from medium range, and retreats briefly during basic cooldown.
{const d=fresh(),[f,t]=d.fighters;f.meteorassaultCd=0;assert(gogeta_blue.chooseSkill(d,f,t,350,0,350));assert.equal(f.state,'meteorassault');f.state='idle';f.cd=0;t.x=375;gogeta_blue.chooseBasic(d,f,t,75,0,75);assert.equal(f.state,'bluecombo');f.cd=.5;gogeta_blue.chooseBasic(d,f,t,75,0,75);assert(f.moveX<0);gogeta_blue.chooseBasic(d,f,t,400,0,400);assert(f.moveX>0);}
// Voice-time cinematic freezes everyone else, smoothly backs away18 ticks, respects root/bounds.
for(const layout of [null,'portrait']){const d=fresh(['gogeta_blue','goku'],null,1,layout),[f,t]=d.fighters;f.rageLockUntil=0;f.rage=100;f.x=480;t.x=620;d.clampPosition(f);d.clampPosition(t);const x=f.x,tx=t.x;for(let i=0;i<GOGETA_BLUE_VOICE_STEPS;i++){d.step();assert.equal(d.tick,0);assert.equal(t.x,tx);}assert(f.x<x);assert.equal(d.personalUltimate.attack.kind,'fullforce');assert.equal(d.personalUltimate.attack.x,f.x);assert.deepEqual(d.clampPosition({x:f.x,y:f.y}),{x:f.x,y:f.y});}
{const d=fresh(),f=d.fighters[0];f.rootUntil=1000;f.rootX=f.x;f.rootY=f.y;f.rageLockUntil=0;f.rage=100;advance(d,GOGETA_BLUE_VOICE_STEPS);assert.equal(f.x,300);}
// Full-force beam: warning, one840 hit per enemy, ally safety, exit path avoids damage.
function ultimate(){const d=fresh(['gogeta_blue','goku','saber','vegeta'],['A','B','A','B']),[f,t,ally,other]=d.fighters;f.x=400;t.x=600;ally.x=500;other.x=750;f.rageLockUntil=0;f.rage=100;advance(d,GOGETA_BLUE_VOICE_STEPS);return d;}
{const d=ultimate(),[f,t,ally,other]=d.fighters;assert(personalDanger(d,t));other.y=365;assert(!personalDanger(d,other));t.invulnerable=10;t.dodgeChance=t.blinkChance=100;advance(d,120);assert.equal(t.max-t.hp,840);assert.equal(ally.hp,ally.max);assert.equal(other.hp,other.max);assert.equal(d.events.filter(e=>e.type==='hit'&&e.sourceUid===f.uid&&e.uid===t.uid).length,1);assert(f.rage<=5);assert.equal(d.personalUltimate.attack,null);}
{const d=ultimate(),[f,t,,other]=d.fighters;t.y=other.y=375;advance(d,120);assert.equal(t.hp,t.max);assert.equal(other.hp,other.max);}
{const d=ultimate(),f=d.fighters[0];f.hp=0;d.step();assert.equal(d.personalUltimate.attack,null);assert(!d.shots.some(s=>s.kind==='fullforce'));}
// Full frame rendering: no clipped source rectangles and balanced canvas transforms.
const calls=[];let depth=0;const ctx=new Proxy({globalAlpha:1,save(){depth++;},restore(){depth--;assert(depth>=0);},drawImage(im,...args){calls.push([im,...args]);for(const n of args)assert(Number.isFinite(n));}},{get:(t,k)=>k in t?t[k]:()=>{}}),images=Object.fromEntries(gogeta_blue.assets.map(k=>[k,{complete:true,naturalWidth:1,key:k}]));
{const d=fresh(),f=d.fighters[0];for(const state of ['idle','run','guard','hurt','defeat',...Object.keys(GOGETA_BLUE_SKILLS)]){f.state=state;f.age=.4;drawGogetaBlueActor(ctx,images,d,f);}f.state='idle';for(const age of [0,.5,1,1.5,2.49]){f.introAge=age;drawGogetaBlueBack(ctx,images,d,age);drawGogetaBlueActor(ctx,images,d,f);}f.introAge=null;f.rageLockUntil=0;f.rage=100;stepPersonalUltimate(d);drawGogetaBlueCinematic(ctx,images,d);drawGogetaBlueChat(ctx,images,d.personalUltimate.cinematic);for(const kind of ['fullforce','godpunisher','stardustbreaker'])drawGogetaBlueShot(ctx,images,{kind,x:600,y:270,fromX:300,fromY:270,vx:100,vy:0},600,242,1);for(const action of ['fullforce','meteorassault','stardustbreaker','godpunisher'])drawGogetaBlueBurst(ctx,images,{action,x:600,y:242,life:.3,max:.5});drawGogetaBlueWorld(ctx,images,d);for(const args of calls){const m=META[args[0].key];assert.equal(args[3],m.frameSize[0]);assert.equal(args[4],m.frameSize[1]);}assert.equal(depth,0);}
// Real battles terminate and replay identically across layouts/teams, including duplicate Gogetas.
function replay(layout,team){const pair=team?['gogeta_blue','gogeta_blue','madara','gojo']:['gogeta_blue','madara'],d=new Duel('FUSION-REPLAY',false,pair,{},team?['A','A','B','B']:null,1,1,layout);for(let i=0;i<18000&&!d.result;i++)d.step();assert(d.result);assert(d.fighters[0].skillUses.meteorassault>0);for(const f of d.fighters)assert(Number.isFinite(f.x)&&Number.isFinite(f.y)&&f.hp>=0);return JSON.stringify([d.result,d.tick,d.fighters.map(f=>[f.hp,f.x,f.y,f.skillUses])]);}
for(const layout of [null,'portrait'])for(const team of [false,true])assert.equal(replay(layout,team),replay(layout,team));
console.log('Gogeta Blue PASS:84 frames,2s recorded voice,combo/rush travel/miss/root,projectiles/splash/team safety,AI,retreat cinematic,840 beam warning/escape/death,full-cell rendering and deterministic completed battles.');
