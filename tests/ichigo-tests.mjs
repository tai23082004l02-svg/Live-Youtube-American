import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Duel} from '../dist/src/engine/sim.js';
import {ichigo,ichigoPose} from '../dist/src/characters/ichigo.js';
import {recordPersonalDamage,stepPersonalUltimate,tickPersonalUltimate} from '../dist/src/engine/personal-ultimate.js';
import {stepTeamUltimate,recordTeamDamage} from '../dist/src/engine/team-ultimate.js';
import {ICHIGO_META} from '../dist/src/render/ichigo-meta.js';
function fixture(pair=['ichigo','goku'],teams=null){const d=new Duel('ICHIGO',false,pair,{},teams);while(d.introRemaining)d.step();d.fighters.forEach((f,i)=>{f.think=999;f.x=200+i*180;f.y=270;f.dodgeChance=f.blinkChance=f.blockChance=f.critChance=0;f.reactionChance=0;f.state='idle';});return d;}
const d=fixture(),[f,t]=d.fighters;assert.equal(f.max,1200);assert.equal(f.speed,215);assert.equal(f.melee,82);
for(const key of Object.keys(ICHIGO_META)){const m=JSON.parse(readFileSync(new URL('../art/frames/ichigo/'+key+'.json',import.meta.url)));assert.deepEqual(ICHIGO_META[key].frameSize,m.frameSize);assert.deepEqual(ICHIGO_META[key].pivot,m.pivot);}
// Landed hits stack independent crit percentage points; only a damaging critical resets.
{const g=fixture(),[owner,target]=g.fighters;owner.critChance=15;g.roll=p=>p>=100;const hit=()=>{g.shots.push({id:owner.id,ownerUid:owner.uid,x:target.x-1,y:target.y,vx:60,vy:0,life:1,damage:1});g.step();};
assert.equal(owner.critStacks,0);hit();hit();assert.equal(owner.critStacks,2);assert.equal(owner.critChance,15);assert.equal(ichigo.critChanceBonus(g,owner),2);
target.dodgeChance=100;hit();assert.equal(owner.critStacks,2);target.dodgeChance=0;target.invulnerable=1;hit();assert.equal(owner.critStacks,2);target.invulnerable=0;target.blockChance=100;target.blockReduction=100;hit();assert.equal(owner.critStacks,2);target.blockChance=0;
owner.critStacks=84;hit();assert.equal(owner.critStacks,85);assert.equal(g.events.filter(e=>e.type==='hit').at(-1).critical,false);hit();assert.equal(g.events.filter(e=>e.type==='hit').at(-1).critical,true);assert.equal(owner.critStacks,0);assert.equal(owner.critChance,15);hit();assert.equal(owner.critStacks,1);assert.equal(fixture().fighters[0].critStacks,0);
}
// All cast animations use four cells, including clamped final defeat frame.
for(const state of ['idle','run','melee','dash','hurt','defeat','getsuga','shunpo','bankaislash','hollowmask'])for(const age of [0,.2,.5,2,99])assert(ichigoPose({...f,state,age}).frame<4);
d.act(f,'getsuga',1,0);for(let i=0;i<100;i++)d.step();assert(t.hp<t.max);assert.equal(d.events.filter(e=>e.type==='ichigoImpact').length,1);
let r=fixture(),a=r.fighters[0],b=r.fighters[1];a.rootUntil=100;a.rootX=a.x;a.rootY=a.y;r.act(a,'shunpo',1,0);for(let i=0;i<40;i++)r.step();assert.equal(a.x,a.rootX);assert.equal(b.hp,b.max);
// Shunpo closes any arena distance, tracks the target at release and faces its landing direction.
for(const direction of [1,-1]){r=fixture();[a,b]=r.fighters;a.x=direction===1?80:880;b.x=direction===1?880:80;const distance=Math.abs(b.x-a.x);a.hollowmaskCd=a.bankaislashCd=100;a.shunpoCd=0;assert(ichigo.chooseSkill(r,a,b,b.x-a.x,0,distance));assert.equal(a.state,'shunpo');b.y=350;for(let i=0;i<17;i++)r.step();assert(Math.abs(Math.hypot(b.x-a.x,b.y-a.y)-65)<1e-8);assert.equal(a.face,direction);assert.equal(b.hp,b.max-155);assert.equal(a.skillUses.shunpo,1);assert.equal(a.invulnerable,0);}
r=fixture();[a,b]=r.fighters;b.x=a.x+85;r.act(a,'bankaislash',1,0);for(let i=0;i<64;i++)r.step();assert.equal(a.slashHits,3);assert(b.hp<b.max-150);assert(b.x>285);
r=fixture();a=r.fighters[0];r.act(a,'hollowmask',1,0);for(let i=0;i<50;i++)r.step();assert.equal(ichigo.movementSpeedMultiplier(r,a),1.25);assert.equal(ichigo.outgoingDamageMultiplier(r,a),1.2);r.tick=a.hollowEnd;assert.equal(ichigo.outgoingDamageMultiplier(r,a),1);
// Real damage gains normalize to HP, excludes Ultimate, friendly, zero and lockout.
r=fixture();[a,b]=r.fighters;recordPersonalDamage(r,a,b,120);assert.equal(a.rage,15);recordPersonalDamage(r,b,a,120);assert.equal(a.rage,23);recordPersonalDamage(r,a,b,500,true);assert.equal(a.rage,23);a.rageLockUntil=900;recordPersonalDamage(r,a,b,500);assert.equal(a.rage,23);
// Full simulation freeze for precisely 60 steps; warning resumes combat time.
r=fixture();[a,b]=r.fighters;a.rage=100;const tick=r.tick,rng=r.rng,cd=a.getsugaCd;r.shots.push({id:'goku',ownerUid:b.uid,x:800,y:400,vx:1,vy:0,life:5,damage:1});for(let i=0;i<183;i++){r.step();assert.equal(r.tick,tick);assert.equal(r.rng,rng);assert.equal(a.getsugaCd,cd);assert.equal(r.shots[0].x,800);}assert.equal(r.personalUltimate.cinematic,null);assert.equal(a.personalUses,1);assert.equal(a.rage,0);assert.equal(a.rageLockUntil,0);assert.equal(r.personalUltimate.attack.phase,'warning');for(let i=0;i<36;i++)r.step();assert(r.shots.some(s=>s.ultimate&&s.kind==='fullgetsuga'));for(let i=0;i<30;i++)r.step();assert(b.hp<b.max);assert(Math.abs(a.rage-66*2/60)<1e-8);
// Separate team meter, one active cinematic/attack. Personal wins a simultaneous tie.
r=fixture(['ichigo','ichigo','goku'],['A','A','B']);[a,b]=r.fighters;a.rage=b.rage=100;r.teamUltimate.teams.B.rage=100;assert(stepPersonalUltimate(r));assert.equal(stepTeamUltimate(r),false);assert.equal(r.teamUltimate.cinematic,null);assert.equal(r.teamUltimate.teams.B.rage,100);assert.equal(b.rage,100);for(let i=0;i<182;i++)stepPersonalUltimate(r);assert.equal(stepTeamUltimate(r),false);assert.equal(b.personalUses,0);recordTeamDamage(r,a,r.fighters[2],100,true);assert.equal(r.teamUltimate.teams.A.rage,0);r.personalUltimate.attack=null;assert(stepPersonalUltimate(r));assert.equal(b.personalUses,1);
// Caster death cancels a warning; reset creates no retained rage/attack.
r=fixture();a=r.fighters[0];a.rage=100;for(let i=0;i<183;i++)stepPersonalUltimate(r);a.hp=0;tickPersonalUltimate(r);assert.equal(r.personalUltimate.attack,null);assert.equal(fixture().fighters[0].rage,0);
// Intro freezes everyone, and all modes finish deterministically with finite positions.
for(const [pair,teams] of [[['ichigo','goku'],null],[['ichigo','naruto','beerus','gaara','yugi'],null],[Array(10).fill('ichigo'),Array(5).fill('A').concat(Array(5).fill('B'))]]){
 const run=()=>{const g=new Duel('ICHIGO-REPLAY',false,pair,{},teams);for(let i=0;i<30000&&!g.result;i++)g.step();assert(g.result);for(const x of g.fighters)assert(Number.isFinite(x.x+x.y+x.hp));return JSON.stringify([g.tick,g.rng,g.fighters.map(f=>[f.hp,f.damage,f.personalUses]),g.events]);};assert.equal(run(),run());
}
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.equal((html.match(/<option value="ichigo">/g)||[]).length,16);assert(html.includes('stat_ichigo_hp'));
console.log('Ichigo passed: four skills, root, Hollow expiry, safe atlas metadata, personal rage/freeze/queue/lockout, Ultimate no feedback, cancellation, duel/FFA/ten-Ichigo replay.');
