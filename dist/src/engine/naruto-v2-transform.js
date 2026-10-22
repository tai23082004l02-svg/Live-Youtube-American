import {isIncapacitated} from './status.js';
import {VOICE_STEPS} from './naruto-v2-transform-voice.js';
// Pick a clear place before the cinematic freezes combat. Fixed sampling keeps replays deterministic.
function retreatForBaryon(d,f){
 const a=d.arena,scale=a.scale,others=d.fighters.filter(t=>t.uid!==f.uid&&t.hp>0);
 if(!others.length)return;
 const clearance=p=>Math.min(...others.map(t=>Math.hypot(t.x-p.x,t.y-p.y)));
 let best=null;
 for(let row=0;row<=8;row++){
  const y=a.minY+32*scale+(a.maxY-a.minY-64*scale)*row/8;
  const left=d.clampPosition({x:a.left,y}).x+32*scale,right=d.clampPosition({x:a.right,y}).x-32*scale;
  for(let col=0;col<=12;col++){const point=d.clampPosition({x:left+(right-left)*col/12,y}),gap=clearance(point),travel=Math.hypot(point.x-f.x,point.y-f.y);
   if(!best||gap>best.gap+1e-6||Math.abs(gap-best.gap)<1e-6&&travel<best.travel)best={...point,gap,travel};
  }
 }
 if(!best||best.gap<clearance(f))return;
 const fromX=f.x,fromY=f.y;f.x=best.x;f.y=best.y;
 const target=d.pickTarget(f);if(target)f.face=Math.sign(target.x-f.x)||f.face;
 d.event('teleported',f,{x:f.x,y:f.y,fromX,fromY,skill:'v2transform'});
}
export function stepNarutoV2Transformation(d){
 if(!d.narutoV2Transform&&!d.personalUltimate?.cinematic&&!d.personalUltimate?.attack&&!d.teamUltimate?.cinematic&&!d.teamUltimate?.attack){const f=d.fighters.find(f=>f.id==='naruto_v2'&&!f.v2Transformed&&f.hp>0&&f.hp<f.max*.5&&!isIncapacitated(d,f)&&d.tick>=(f.rootUntil||0));if(f){retreatForBaryon(d,f);f.v2Transformed=true;f.state='idle';f.age=0;f.moveX=f.moveY=0;f.tailGuardUntil=0;d.clones=d.clones.filter(c=>c.ownerUid!==f.uid);d.shots=d.shots.filter(s=>s.ownerUid!==f.uid);d.narutoV2Transform={kind:'narutotransform',ownerUid:f.uid,elapsed:0,durationSteps:VOICE_STEPS};d.event('v2TransformStart',f,{x:f.x,y:f.y});}}
 const c=d.narutoV2Transform;if(!c)return false;const f=d.fighters.find(f=>f.uid===c.ownerUid);if(!f||f.hp<=0){d.narutoV2Transform=null;return false;}
 c.elapsed++;if(c.elapsed>=c.durationSteps){f.baryon=true;f.speed*=1.15;f.melee*=1.15;f.state='idle';f.age=0;d.narutoV2Transform=null;d.event('v2Baryon',f,{x:f.x,y:f.y});}return true;
}
