import assert from 'node:assert/strict';
import {Duel} from '../dist/src/engine/sim.js';
import {madara} from '../dist/src/characters/madara.js';
import {stepPersonalUltimate} from '../dist/src/engine/personal-ultimate.js';
function fresh(pair=['madara','goku'],teams=null,scale=1,layout=null){const d=new Duel('MADARA-AI',false,pair,{},teams,scale,1,layout);d.introRemaining=0;for(const f of d.fighters){f.introAge=null;f.rage=0;}return d;}
function decide(d){const f=d.fighters[0],o=d.pickTarget(f);madara.chooseSkill(d,f,o,o.x-f.x,o.y-f.y,Math.hypot(o.x-f.x,o.y-f.y));return f;}
function lock(f){f.truthorbsCd=f.lightfangCd=f.limboCd=f.cd=10;}
// Close enemies trigger retreat even with an offensive skill ready.
{const d=fresh(),[f,o]=d.fighters;f.x=480;f.y=270;o.x=590;o.y=270;lock(f);f.truthorbsCd=0;decide(d);assert.equal(f.state,'run');assert(f.moveX<0);assert.equal(f.skillUses.truthorbs,0);}
// Healthy range strafes rather than closing into melee, even under approach tactic.
{const d=fresh(),[f,o]=d.fighters;f.x=280;f.y=270;o.x=655;o.y=270;lock(f);f.tactic='approach';decide(d);assert.equal(f.moveX,0);assert(Math.abs(f.moveY)>.9);}
// Limbo covers close pressure; it is not repeatedly replaced while alive.
{const d=fresh(),[f,o]=d.fighters;f.x=400;f.y=270;o.x=500;o.y=270;lock(f);f.limboCd=0;decide(d);assert.equal(f.state,'limbo');f.state='idle';f.limboCd=0;f.limboShadows=[{life:5}];decide(d);assert.equal(f.state,'run');}
// Corner escape increases separation, stays inside arena, and cannot repeat before8s.
for(const [scale,layout] of [[1,null],[1,'portrait'],[1.5,null]]){const d=fresh(['madara','goku'],null,scale,layout),[f,o]=d.fighters;Object.assign(f,d.clampPosition({x:-9999,y:-9999}));o.x=f.x+65;o.y=f.y+65;lock(f);const start={x:f.x,y:f.y};decide(d);assert.equal(f.madaraEscapeCd,8);assert(Math.hypot(f.x-o.x,f.y-o.y)>200);assert.deepEqual(d.clampPosition({x:f.x,y:f.y}),{x:f.x,y:f.y});o.x=f.x+60;o.y=f.y;f.state='idle';decide(d);assert.equal(f.madaraEscapeCd,8);madara.tick(f,7.99);assert(f.madaraEscapeCd>0);madara.tick(f,.02);assert.equal(f.madaraEscapeCd,0);assert.notDeepEqual({x:f.x,y:f.y},start);}
// Root blocks escape; engine status guards also block stunned/other incapacitated AI.
{const d=fresh(),[f,o]=d.fighters;Object.assign(f,d.clampPosition({x:-9999,y:-9999}));o.x=f.x+60;o.y=f.y+60;lock(f);f.rootUntil=100;const x=f.x,y=f.y;decide(d);assert.equal(f.x,x);assert.equal(f.y,y);assert.equal(f.madaraEscapeCd,0);}
// Meteor prefers an enemy cluster and excludes allies and dead fighters.
{const d=fresh(['madara','goku','saber','gojo','sukuna'],['A','B','B','A','B']),[f,a,b,ally,dead]=d.fighters;f.x=100;f.y=270;a.x=550;a.y=220;b.x=580;b.y=300;ally.x=200;ally.y=270;dead.hp=0;dead.x=210;dead.y=270;f.rage=100;stepPersonalUltimate(d);assert([a.uid,b.uid].includes(d.personalUltimate.cinematic.targetUid));}
// Real simulation remains finite and deterministic across layouts and multi-fighter modes.
function run(layout,teams){const pair=teams?['madara','saber','goku','gojo']:['madara','goku'],d=fresh(pair,teams?['A','A','B','B']:null,1,layout);for(let i=0;i<3600&&!d.result;i++)d.step();for(const f of d.fighters){assert(Number.isFinite(f.x)&&Number.isFinite(f.y)&&Number.isFinite(f.hp));}assert(d.fighters[0].skillUses.truthorbs>0);return JSON.stringify(d.fighters.map(f=>[f.x,f.y,f.hp,f.skillUses]));}
for(const layout of [null,'portrait'])for(const teams of [false,true])assert.equal(run(layout,teams),run(layout,teams));
console.log('Madara AI PASS: retreat, strafe, Limbo, corner escape8s/root, cluster meteor, deterministic real duels/teams/layouts.');
