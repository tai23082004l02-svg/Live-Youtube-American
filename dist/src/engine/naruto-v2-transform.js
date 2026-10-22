import {isIncapacitated} from './status.js';
import {VOICE_STEPS} from './naruto-v2-transform-voice.js';
export function stepNarutoV2Transformation(d){
 if(!d.narutoV2Transform&&!d.personalUltimate?.cinematic&&!d.personalUltimate?.attack&&!d.teamUltimate?.cinematic&&!d.teamUltimate?.attack){const f=d.fighters.find(f=>f.id==='naruto_v2'&&!f.v2Transformed&&f.hp>0&&f.hp<f.max*.5&&!isIncapacitated(d,f));if(f){f.v2Transformed=true;f.state='idle';f.age=0;f.moveX=f.moveY=0;f.tailGuardUntil=0;d.clones=d.clones.filter(c=>c.ownerUid!==f.uid);d.shots=d.shots.filter(s=>s.ownerUid!==f.uid);d.narutoV2Transform={kind:'narutotransform',ownerUid:f.uid,elapsed:0,durationSteps:VOICE_STEPS};d.event('v2TransformStart',f,{x:f.x,y:f.y});}}
 const c=d.narutoV2Transform;if(!c)return false;const f=d.fighters.find(f=>f.uid===c.ownerUid);if(!f||f.hp<=0){d.narutoV2Transform=null;return false;}
 c.elapsed++;if(c.elapsed>=c.durationSteps){f.baryon=true;f.speed*=1.15;f.melee*=1.15;f.state='idle';f.age=0;d.narutoV2Transform=null;d.event('v2Baryon',f,{x:f.x,y:f.y});}return true;
}
