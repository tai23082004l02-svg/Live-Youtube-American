// Gojo replacement: six-frame character and independently extracted VFX atlases.
export const GOJO_SKILLS={blue:{cooldown:7,cast:.55,duration:1},red:{cooldown:9,cast:.65,duration:1.1},purple:{cooldown:16,cast:1.15,duration:1.6},domain:{cooldown:23,cast:1,duration:1.5}};
export const gojo={name:'Gojo',assets:['gojo','gojo_vfx'],stats:{hp:1100,speed:195,melee:68,skillPower:100,cooldown:100},
 init(f){for(const [skill,delay] of Object.entries({blue:1,red:2,purple:5,domain:8})){f[skill+'Cd']=delay*f.cooldownFactor;f.skillUses[skill]=0;}},
 onAct(f,state){if(GOJO_SKILLS[state]){f[state+'Cd']=GOJO_SKILLS[state].cooldown*f.cooldownFactor;f.skillUses[state]++;}},
 tick(f,dt){for(const key of Object.keys(GOJO_SKILLS))f[key+'Cd']=Math.max(0,f[key+'Cd']-dt);},
 beforeStep(duel,hits){for(const f of duel.fighters){if(f.id!=='gojo'||f.hp<=0||!(duel.tick<f.domainEnd))continue;const pulse=duel.tick>=f.domainNextPulse;
 for(const t of duel.fighters)if(t.hp>0&&duel.isEnemy(f,t)&&Math.hypot(t.x-f.domainX,t.y-f.domainY)<190){if(!duel.isTransformProtected(t))t.gojoSlowUntil=duel.tick+2;if(pulse)hits.push({target:t,source:f,value:28});}
 if(pulse)f.domainNextPulse=duel.tick+30;
 }},
 updateAction(duel,f,o,hits,dx,dy,d,dt){const spec=GOJO_SKILLS[f.state];if(!spec)return false;
 if(f.age>=spec.cast&&!f.hit){f.hit=true;
 if(f.state==='purple'){duel.shots.push({id:f.id,ownerUid:f.uid,kind:'purple',damage:290,radius:38,piercing:true,hitUids:[],x:f.x+f.actionX*45,y:f.y+f.actionY*45,vx:f.actionX*540,vy:f.actionY*540,life:1.8});duel.event('fire',f,{skill:'purple'});}
 else if(f.state==='domain'){f.domainX=f.x;f.domainY=f.y;f.domainEnd=duel.tick+180;f.domainNextPulse=duel.tick+1;duel.event('domainOpen',f,{x:f.x,y:f.y});}
 else {const blue=f.state==='blue',cx=blue?o.x:f.x,cy=blue?o.y:f.y;
 for(const t of duel.fighters)if(t.hp>0&&duel.isEnemy(f,t)&&Math.hypot(t.x-cx,t.y-cy)<(blue?140:190)){hits.push({target:t,source:f,value:blue?105:165,...(blue?{guaranteed:true,rootTicks:90}:{})});if(!duel.isTransformProtected(t)&&t.invulnerable===0){const tx=blue?cx-t.x:t.x-f.x,ty=blue?cy-t.y:t.y-f.y,dist=Math.hypot(tx,ty)||1,amount=blue?Math.min(75,dist):95;duel.clampPosition(Object.assign(t,{x:t.x+tx/dist*amount,y:t.y+ty/dist*amount}));}}
 duel.event('gojoBurst',f,{x:cx,y:cy,skill:f.state});}}
 if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;},
 chooseSkill(duel,f,o,dx,dy,d){for(const skill of ['domain','purple','blue','red'])if(f[skill+'Cd']===0&&(skill==='domain'?d<230:skill==='purple'?d>140&&d<600:skill==='blue'?d<330:d<190)){duel.act(f,skill,dx,dy);return true;}return false;}
};
export function gojoPose(f,hurt=false){const state=hurt?'hurt':f.state,row=({idle:0,run:1,melee:f.combo%2?2:4,dash:3,guard:5,hurt:6,defeat:7,blue:8,red:9,purple:10,domain:11})[state]??0,spec=GOJO_SKILLS[state];return {row,frame:state==='defeat'?5:spec?Math.min(5,Math.floor(f.age/spec.duration*6)):['melee','dash','hurt'].includes(state)?Math.min(5,Math.floor(f.age*(state==='dash'?24:10))):Math.floor(f.age*9)%6};}
