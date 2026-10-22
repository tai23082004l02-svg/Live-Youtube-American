import {NARUTO_V2_BARYON_STEPS,TEAM_VOICE_STEPS,cinematicSteps,ULTIMATE_CINEMATIC_STEPS,ULTIMATE_DAMAGE_MULTIPLIER} from './ultimate-rules.js';
export const ULTIMATE_RULES=Object.freeze({rageMax:100,cinematicSteps:ULTIMATE_CINEMATIC_STEPS,warningTicks:36,travelTicks:42,recoveryTicks:0,radius:160});
export const ULTIMATE_STYLES={
 naruto_v2:{row:1,name:'United Kurama Rasengan',line:'Kurama! Giant Rasengan!',color:'#ffc34b',cast:0},
 rengoku:{row:2,name:'United Purgatory',line:'Flame Breathing: Purgatory!',color:'#ff8a2b',cast:0},
 sukuna:{row:3,name:'United Malevolent Shrine',line:'Domain Expansion: Malevolent Shrine.',color:'#ff3655',cast:0},
 boa_hancock:{row:3,name:'United Empress Judgment',line:'Know your place before your empress.',color:'#ff83bc',cast:11},
 tatsumaki:{row:4,name:'United Psychic Cataclysm',line:'Know your place.',color:'#61ffad',cast:11},
 saber:{row:2,name:'United Excalibur',line:'Excalibur!',color:'#ffd86a',cast:11},
 goku_ultra:{row:1,name:'United Supreme Kamehameha',line:'Kamehameha!',color:'#c0edff',cast:13},
 sung_jinwoo:{row:3,name:'United Shadow Army',line:'Rise!',color:'#8673ff',cast:12},
 ichigo:{row:1,name:'United Getsuga Tensho',line:'Getsuga Tensho!',color:'#ff365b',cast:12},
 goku:{row:1,name:"United Kamehameha",line:"Everyone, lend me your power!",color:'#59dcff',cast:5},
 goku_blue:{row:1,name:"Limit-Breaking Kamehameha",line:"Together, we break our limits!",color:'#46dfff',cast:10},
 vegeta:{row:2,name:"United Final Flash",line:"Witness the power of our pride!",color:'#ffd65c',cast:5},
 gogeta:{row:2,name:"Big Bang Team Attack",line:"This attack ends it!",color:'#ffe687',cast:8},
 beerus:{row:3,name:"Sphere of Destruction",line:"It is time to bring this to an end.",color:'#c573ff',cast:9},
 frieza:{row:3,name:"United Supernova",line:"Behold our overwhelming power!",color:'#d48cff',cast:10},
 naruto:{row:4,name:"United Rasenshuriken",line:"I will never let my friends down!",color:'#ffba57',cast:9},
 yugi:{row:3,name:"United Dark Magic",line:"Our bond is our greatest strength!",color:'#c68aff',cast:4},
 gojo:{row:3,name:"United Unlimited Void",line:"Domain Expansion: Unlimited Void.",color:'#b28aff',cast:11},
 sasuke:{row:3,name:"United Lightning Flame",line:"Everything we have, in one strike.",color:'#bb8cff',cast:8},
 gaara:{row:3,name:"United Sand Burial",line:"I will protect my comrades.",color:'#e4c180',cast:9},
 broly:{row:1,name:"United Gigantic Burst",line:"FULL POWER!",color:'#b1ff73',cast:4},
 piccolo:{row:1,name:"United Special Beam Cannon",line:"Focus all your power here!",color:'#b7f58d',cast:8},
 luffy:{row:1,name:"Conqueror Burst",line:"My friends are always with me!",color:'#ffb16b',cast:11}
};
export function initTeamUltimate(d){
 d.teamUltimate=d.teamMode&&d.teamUltimateEnabled!==false?{teams:Object.fromEntries(['A','B'].map(team=>[team,{rage:0,uses:0,lockUntil:0,readyTick:null,totalHP:d.fighters.filter(f=>f.team===team).reduce((s,f)=>s+f.max,0)}])),cinematic:null,attack:null,serial:0,lastTeam:'B'}:null;
}
export function setTeamUltimateEnabled(d,enabled){d.teamUltimateEnabled=!!enabled;if(!enabled)d.teamUltimate=null;else if(d.teamMode&&!d.teamUltimate)initTeamUltimate(d);}
export function recordTeamDamage(d,source,target,amount,ultimate=false){
 const u=d.teamUltimate;if(!u||ultimate||amount<=0||!d.isEnemy(source,target))return;
 for(const [team,gain] of [[source.team,amount/u.teams[target.team].totalHP*150],[target.team,amount/u.teams[target.team].totalHP*80]]){
  const state=u.teams[team];if(d.tick<state.lockUntil)continue;state.rage=Math.min(100,state.rage+gain);if(state.rage>=100&&state.readyTick===null)state.readyTick=d.tick;
 }
}
function selectLeader(d,team){return d.fighters.filter(f=>f.team===team&&f.hp>0&&d.tick>=(f.petrifyUntil||0)&&!d.isTransformProtected(f)).reduce((best,f)=>!best||f.damage>best.damage?f:best,null);}
function selectCenter(d,leader){const enemies=d.fighters.filter(f=>f.hp>0&&d.isEnemy(leader,f));return enemies.reduce((best,t)=>{const score=enemies.filter(o=>Math.hypot(o.x-t.x,o.y-t.y)<ULTIMATE_RULES.radius).length;return !best||score>best.score?{x:t.x,y:t.y,score}:best;},null);}
// This runs before a combat tick. Only cinematic time advances: no RNG, projectiles,
// cooldowns, summoned creatures, buffs, damage or the match clock can advance here.
export function stepTeamUltimate(d){
 const u=d.teamUltimate;if(!u)return false;
 if(!u.cinematic&&!u.attack&&!d.personalUltimate?.cinematic&&!d.personalUltimate?.attack){
  const eligible=['A','B'].filter(team=>u.teams[team].rage>=100&&d.tick>=u.teams[team].lockUntil&&selectLeader(d,team));
  eligible.sort((a,b)=>(u.teams[a].readyTick??d.tick)-(u.teams[b].readyTick??d.tick)||(a===u.lastTeam?1:-1));
  if(eligible.length){const team=eligible[0],leader=selectLeader(d,team),center=selectCenter(d,leader);if(center){const members=d.fighters.filter(f=>f.team===team&&f.hp>0);u.cinematic={durationSteps:leader.id==='naruto_v2'&&leader.baryon?NARUTO_V2_BARYON_STEPS:TEAM_VOICE_STEPS[leader.id]??ULTIMATE_CINEMATIC_STEPS,serial:++u.serial,team,leaderUid:leader.uid,members:members.map(f=>f.uid),style:leader.id==='naruto_v2'&&leader.baryon?{...ULTIMATE_STYLES.naruto_v2,name:'United Final Impact',line:'This is the end!',color:'#ff543c'}:ULTIMATE_STYLES[leader.id],elapsed:0,x:leader.x,y:leader.y,targetX:center.x,targetY:center.y};u.teams[team].rage=0;u.teams[team].readyTick=null;u.teams[team].uses++;u.teams[team].lockUntil=d.tick+ULTIMATE_RULES.recoveryTicks;u.lastTeam=team;d.event('ultimateStart',leader,{team,style:u.cinematic.style.name});}}
 }
 if(!u.cinematic)return false;
 u.cinematic.elapsed++;
 if(u.cinematic.elapsed>=cinematicSteps(u.cinematic)){const c=u.cinematic;u.attack={...c,phase:'warning',born:d.tick,launch:d.tick+ULTIMATE_RULES.warningTicks,impact:d.tick+ULTIMATE_RULES.warningTicks+ULTIMATE_RULES.travelTicks,hitUids:[],pulse:0};u.cinematic=null;const leader=d.fighters.find(f=>f.uid===c.leaderUid);d.event('ultimateWarning',leader,{team:c.team,x:c.targetX,y:c.targetY});}
 return true;
}
export function ultimateCaster(d,f){const u=d.teamUltimate,a=u?.cinematic||u?.attack;return a?.leaderUid===f.uid&&(u.cinematic||a.phase==='warning')?a:null;}
export function ultimateDanger(d,f){const a=d.teamUltimate?.attack;if(!a||a.team===f.team)return false;return Math.hypot(f.x-a.targetX,f.y-a.targetY)<ULTIMATE_RULES.radius+45;}
export function tickTeamUltimate(d,hits){
 const u=d.teamUltimate,a=u?.attack;if(!a)return;
 const leader=d.fighters.find(f=>f.uid===a.leaderUid);
 if(a.phase==='warning'&&(!leader||leader.hp<=0||d.tick<(leader.petrifyUntil||0))){u.attack=null;if(leader)d.event('ultimateCancel',leader,{team:a.team});return;}
 if(a.phase==='warning'&&d.tick>=a.launch){a.phase='travel';d.event('ultimateLaunch',leader,{team:a.team,x:a.x,y:a.y});}
 if(d.tick<a.impact)return;
 a.phase='impact';
 // Three separate, dodgeable pulses. Ultimate damage never feeds either rage meter.
 if(a.pulse<3&&d.tick>=a.impact+a.pulse*10){
  const livingMembers=a.members.filter(uid=>d.fighters.find(f=>f.uid===uid)?.hp>0).length;
  for(const t of d.fighters)if(t.hp>0&&d.isEnemy(leader,t)&&Math.hypot(t.x-a.targetX,t.y-a.targetY)<ULTIMATE_RULES.radius)hits.push({source:leader,target:t,value:ULTIMATE_DAMAGE_MULTIPLIER*(t.max*.18+100)*(1+Math.max(0,livingMembers-1)*.04)/3,ultimate:true});
  if(a.pulse===0)d.event('ultimateImpact',leader,{team:a.team,x:a.targetX,y:a.targetY});a.pulse++;
 }
 if(d.tick>=a.impact+48)u.attack=null;
}
