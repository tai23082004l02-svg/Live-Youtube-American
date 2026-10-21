import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Duel} from '../dist/src/engine/sim.js';
import {rengoku,RENGOKU_SKILLS} from '../dist/src/characters/rengoku.js';
import {ACTIVE_CHARACTERS} from '../dist/src/characters/index.js';
import {RENGOKU_META} from '../dist/src/render/rengoku-meta.js';
import {RENGOKU_VOICE_STEPS,RENGOKU_VOICE_SECONDS} from '../dist/src/engine/rengoku-voice.js';
import {stepPersonalUltimate,tickPersonalUltimate} from '../dist/src/engine/personal-ultimate.js';
import {TEAM_VOICE_STEPS} from '../dist/src/engine/ultimate-rules.js';
import {drawTeamUltimateWorld,drawTeamUltimateCinematic} from '../dist/src/render/team-ultimate.js';
import {ULTIMATE_STYLES} from '../dist/src/engine/team-ultimate.js';
import {ASSET_MANIFEST} from '../dist/src/engine/assets.js';
import {rengokuSprite,drawRengokuActor,drawRengokuWorld,drawRengokuCinematic} from '../dist/src/render/rengoku.js';
assert(ACTIVE_CHARACTERS.rengoku);assert.equal(TEAM_VOICE_STEPS.rengoku,Math.ceil(RENGOKU_VOICE_SECONDS*60));assert.equal(RENGOKU_VOICE_STEPS,279);
const voice=JSON.parse(readFileSync('dist/assets/audio/voices/rengoku-voice.json'));assert.equal(voice.duration,RENGOKU_VOICE_SECONDS);assert(readFileSync('dist/assets/audio/voices/rengoku_ultimate_ja.mp3').length>1000);
for(const key of rengoku.assets){assert(existsSync('dist/'+ASSET_MANIFEST[key]));const m=RENGOKU_META[key];assert.equal(m.rows,m.rowCounts.length);for(const bounds of m.bounds.flat()){assert(bounds[0]>=30&&bounds[1]>=30);assert(bounds[2]<=m.frameSize[0]-30&&bounds[3]<=m.frameSize[1]-30);}}
assert.deepEqual(RENGOKU_META.rengoku.rowCounts,[6,6,6,6,5,6,6,5]);
function fresh(teams=false){const d=new Duel('RENGOKU',false,teams?['rengoku','saber','gojo']:['rengoku','gojo'],{},teams?['A','A','B']:null);while(d.introRemaining)d.step();for(const f of d.fighters){f.state='idle';f.think=999;f.rage=0;}return d;}
for(const skill of Object.keys(RENGOKU_SKILLS)){const d=fresh(true),f=d.fighters[0],ally=d.fighters[1],enemy=d.fighters[2];f.x=400;f.y=270;ally.x=enemy.x=480;ally.y=enemy.y=270;d.act(f,skill,80,0);const hits=[];for(let i=0;i<80;i++){f.age+=1/60;rengoku.updateAction(d,f,enemy,hits,80,0,80,1/60);d.tick++;}assert(!hits.some(h=>h.target===ally));if(skill==='flametiger'){assert.equal(d.shots.length,1);assert.equal(d.shots[0].ownerUid,f.uid);}else assert(hits.some(h=>h.target===enemy));assert.equal(f.skillUses[skill],1);}
// Ultimate freezes simulation for the measured voice, then hits each enemy once along its path.
{const d=fresh(true),f=d.fighters[0],ally=d.fighters[1],enemy=d.fighters[2];f.x=300;f.y=270;ally.x=enemy.x=430;ally.y=enemy.y=270;f.rage=100;const tick=d.tick;for(let i=0;i<279;i++)assert(stepPersonalUltimate(d));assert.equal(d.tick,tick);assert.equal(d.personalUltimate.cinematic,null);assert.equal(d.personalUltimate.attack.kind,'purgatory');const hits=[];for(let i=0;i<120;i++){d.tick++;tickPersonalUltimate(d,hits);}assert.equal(hits.filter(h=>h.target===enemy).length,1);assert.equal(hits.filter(h=>h.target===ally).length,0);assert(hits.every(h=>h.ultimate));assert.equal(d.personalUltimate.attack,null);}
// Moving outside the warned corridor avoids the attack; rooted casters cannot teleport.
{const d=fresh(),f=d.fighters[0],t=d.fighters[1];f.x=300;f.y=270;t.x=500;t.y=270;f.rage=100;for(let i=0;i<279;i++)stepPersonalUltimate(d);t.y=460;const hits=[];for(let i=0;i<120;i++){d.tick++;tickPersonalUltimate(d,hits);}assert.equal(hits.length,0);}
{const d=fresh(),f=d.fighters[0];f.rage=100;for(let i=0;i<279;i++)stepPersonalUltimate(d);f.rootUntil=9999;const x=f.x,y=f.y;for(let i=0;i<80;i++){d.tick++;tickPersonalUltimate(d,[]);}assert.deepEqual([f.x,f.y],[x,y]);}
// Seeded replay and representative portrait 5v5 remain finite.
function replay(){const d=new Duel('FLAME-REPLAY',false,['rengoku','gojo']);for(let i=0;i<4000&&!d.result;i++)d.step();return JSON.stringify({fighters:d.fighters,events:d.events,result:d.result});}assert.equal(replay(),replay());
{const ids=['rengoku','saber','gojo','ichigo','sukuna','rengoku','tatsumaki','boa_hancock','goku_ultra','sung_jinwoo'];const d=new Duel('FLAME-TEAMS',false,ids,{},['A','A','A','A','A','B','B','B','B','B'],1,1,'portrait');for(let i=0;i<3000&&!d.result;i++)d.step();for(const f of d.fighters)assert([f.hp,f.x,f.y].every(Number.isFinite));}
// Renderer uses correct full cells including rows with five frames, never crops past atlas.
{const draws=[],noop=()=>{},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),drawImage:(im,...a)=>draws.push([im,...a])},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)}),images={};for(const [key,m] of Object.entries(RENGOKU_META))images[key]={complete:true,naturalWidth:m.frameSize[0]*m.columns,naturalHeight:m.frameSize[1]*m.rows,key};for(const [key,m] of Object.entries(RENGOKU_META))for(let row=0;row<m.rows;row++)rengokuSprite(ctx,images,key,row,99,400,270);for(const [im,x,y,w,h] of draws){assert(x>=0&&y>=0&&x+w<=im.naturalWidth&&y+h<=im.naturalHeight);assert([x,y,w,h].every(Number.isFinite));}const d=fresh(true);const before=JSON.stringify(d.fighters);drawRengokuActor(ctx,images,d,d.fighters[0]);drawRengokuWorld(ctx,images,d,1);drawRengokuCinematic(ctx,images,d);assert.equal(JSON.stringify(d.fighters),before);const f=d.fighters[0];d.teamUltimate.cinematic={leaderUid:f.uid,members:[f.uid],style:ULTIMATE_STYLES.rengoku,elapsed:130,durationSteps:279};drawTeamUltimateCinematic(ctx,images,d,{});d.teamUltimate.cinematic=null;d.teamUltimate.attack={leaderUid:f.uid,style:ULTIMATE_STYLES.rengoku,phase:'travel',launch:0,born:0,x:f.x,y:f.y,targetX:f.x+200,targetY:f.y};d.tick=12;drawTeamUltimateWorld(ctx,images,d,1);d.tick=60;drawTeamUltimateWorld(ctx,images,d,1);}
console.log('Rengoku PASS: assets/padding/row counts, voice timing, 3 skills, team safety, Ultimate freeze/path/escape/root, seeded replay, portrait5v5, renderer bounds and immutability.');
