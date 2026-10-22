import {drawTitle} from './titles.js?v=20261022-ko-power2';
import {ULTIMATE_STYLES} from '../engine/team-ultimate.js';
export const FINISH_FREEZE_SECONDS=.18;
export const VICTORY_REVEAL_SECONDS=.12;
export const VICTORY_CONTROLS_SECONDS=2.3;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const p=clamp(v);return p*p*(3-2*p);};

// Presentation snapshot only. Never change fighter positions, HP, result or RNG.
export class VictoryScene{
 constructor(d){
  this.result=d.result;
  this.team=d.result==='teamA'?'A':d.result==='teamB'?'B':null;
  this.winners=d.fighters.filter(f=>f.hp>0&&(this.team?f.team===this.team:f.id===d.result));
  this.uids=new Set(this.winners.map(f=>f.uid));
  this.leader=this.winners.reduce((best,f)=>!best||f.damage>best.damage?f:best,null);
  this.color=ULTIMATE_STYLES[this.leader?.id]?.color||'#ffe199';
  this.arenaScale=d.arena?.scale||1;
  const lastHit=d.events?.findLast(e=>e.type==='hit');
  this.impact=Math.min(5,2+(lastHit?.value||100)/100);

 }
 frame(age,reduced=false){
  const time=Math.max(0,age);
  const shake=reduced?0:Math.max(0,1-time/.28)*this.impact;
  return {age:time,camera:{x:480,y:270,zoom:1},shake:{x:Math.sin(time*97)*shake,y:Math.cos(time*113)*shake*.55},flash:Math.max(0,1-time/.22)*(reduced?.07:.23),reveal:smooth((time-VICTORY_REVEAL_SECONDS)/.38),reduced};
 }
 label(names){return this.team?'TEAM '+this.team:this.leader?(names[this.leader.id]||this.leader.name||this.leader.id).toUpperCase():'DOUBLE K.O.';}
}

export function applyVictoryCamera(ctx,frame){const c=frame.camera;ctx.translate(480+frame.shake.x,270+frame.shake.y);ctx.scale(c.zoom,c.zoom);ctx.translate(-c.x,-c.y);}

export function drawVictoryAura(ctx,scene,frame){
 const p=smooth((frame.age-FINISH_FREEZE_SECONDS)/.6);if(!p||!scene.winners.length)return;
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(const [index,f] of scene.winners.entries()){
  const color=ULTIMATE_STYLES[f.id]?.color||scene.color;
  const glow=ctx.createRadialGradient(f.x,f.y-42,8,f.x,f.y-42,130);
  glow.addColorStop(0,color+'50');glow.addColorStop(.55,color+'15');glow.addColorStop(1,color+'00');
  ctx.globalAlpha=p;ctx.fillStyle=glow;ctx.fillRect(f.x-130,f.y-172,260,260);
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.62*p;ctx.beginPath();ctx.ellipse(f.x,f.y+5,42+Math.sin(frame.age*2)*3,13,0,0,Math.PI*2);ctx.stroke();
  if(frame.reduced)continue;
  for(let n=0;n<16;n++){
   const cycle=(frame.age*.28+n/16+index*.17)%1,angle=n*2.399+frame.age*.25,radius=23+Math.sin(n*8.7)*22;
   ctx.globalAlpha=Math.sin(cycle*Math.PI)*p*.78;ctx.fillStyle=n%3===0?'#fff6d7':color;
   const x=f.x+Math.cos(angle)*radius,y=f.y+4-cycle*155,size=n%3===0?2.8:1.6;ctx.fillRect(x-size/2,y-size/2,size,size*1.6);
  }
 }
 ctx.restore();
}

export function drawVictoryScreen(ctx,scene,frame,names){
 ctx.save();
 if(frame.flash>0){ctx.globalAlpha=frame.flash;ctx.fillStyle='#fff3d5';ctx.fillRect(0,0,960,540);}
 ctx.globalAlpha=smooth((frame.age-.2)/1.0);
 const shade=ctx.createRadialGradient(480,265,90,480,265,600);shade.addColorStop(0,'#050b1500');shade.addColorStop(.65,'#050b1520');shade.addColorStop(1,'#050b15cc');ctx.fillStyle=shade;ctx.fillRect(0,0,960,540);
 if(frame.reveal>0){
  ctx.globalAlpha=frame.reveal;ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.save();ctx.translate(480,105);const pop=frame.reduced?1:1+(1-frame.reveal)*.18;ctx.scale(pop,pop);
  ctx.font='900 100px "Times New Roman",Times,serif';ctx.lineJoin='round';ctx.lineWidth=7;ctx.strokeStyle='#07101e';ctx.shadowColor=scene.color;ctx.shadowBlur=22;
  const title=scene.result==='draw'?'DRAW':'KO';const titleDrawn=drawTitle(ctx,title,0,-40,690,130);if(!titleDrawn){ctx.strokeText(title,0,0,820);const gold=ctx.createLinearGradient(0,-85,0,5);gold.addColorStop(0,'#fffbea');gold.addColorStop(.48,'#ffe7a0');gold.addColorStop(1,'#e2a548');ctx.fillStyle=gold;ctx.fillText(title,0,0,820);}ctx.restore();
  ctx.shadowBlur=0;ctx.strokeStyle=scene.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(315,126);ctx.lineTo(645,126);ctx.stroke();ctx.fillStyle='#f3f6ff';ctx.font='bold 24px "Times New Roman",Times,serif';ctx.fillText(scene.label(names),480,163,820);
 }
 ctx.restore();
}
