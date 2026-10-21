export const SASUKE_SKILLS={chidori:{cooldown:7,cast:.35,duration:.95},fireball:{cooldown:9,cast:.75,duration:1.15},amaterasu:{cooldown:13,cast:.8,duration:1.2},susanoo:{cooldown:20,cast:.8,duration:1.3}};
export const sasuke={name:'Sasuke',assets:['sasuke','sasuke_vfx'],stats:{hp:1100,speed:205,melee:70,skillPower:100,cooldown:100},
 init(f){for(const [key,delay] of Object.entries({chidori:1,fireball:2.5,amaterasu:5,susanoo:8})){f[key+'Cd']=delay*f.cooldownFactor;f.skillUses[key]=0;}},
 onAct(f,state,duel){if(SASUKE_SKILLS[state]){f[state+'Cd']=SASUKE_SKILLS[state].cooldown*f.cooldownFactor;f.skillUses[state]++;if(state==='chidori'){f.chidoriHits=[];f.chidoriTargetUid=duel.pickTarget(f)?.uid;}}},
 tick(f,dt){for(const key of Object.keys(SASUKE_SKILLS))f[key+'Cd']=Math.max(0,f[key+'Cd']-dt);},
 onDamageDealt(duel,f,damage){if(f.hp<=0||!(duel.tick<f.susanooEnd)||damage<=0)return;const healed=Math.min(f.max-f.hp,Math.round(damage*.25));if(healed>0){f.hp+=healed;duel.event('heal',f,{value:healed,x:f.x,y:f.y});}},
 incomingDamageMultiplier(duel,f){return duel.tick<(f.susanooEnd||0)?.6:1;},
 beforeStep(duel,hits){for(const f of duel.fighters){if(f.id!=='sasuke'||f.hp<=0||!(duel.tick<f.amaterasuEnd)||duel.tick<f.amaterasuPulse)continue;f.amaterasuPulse=duel.tick+30;
 for(const t of duel.fighters)if(t.hp>0&&duel.isEnemy(f,t)&&Math.hypot(t.x-f.amaterasuX,t.y-f.amaterasuY)<95)hits.push({target:t,source:f,value:32});}},
 updateAction(duel,f,o,hits,dx,dy,d,dt){const spec=SASUKE_SKILLS[f.state];if(!spec)return false;
 if(f.state==='chidori'&&f.age>=.35&&f.age<.7){
 let target=duel.fighters.find(t=>t.uid===f.chidoriTargetUid&&t.hp>0&&duel.isEnemy(f,t));
 if(!target){target=duel.pickTarget(f);f.chidoriTargetUid=target?.uid;}
 if(target&&!f.chidoriHits.includes(target.uid)){
  const tx=target.x-f.x,ty=target.y-f.y,distance=Math.hypot(tx,ty)||1;
  f.actionX=tx/distance;f.actionY=ty/distance;if(Math.abs(tx)>.1)f.face=Math.sign(tx);
  if(!(duel.tick<(f.rootUntil||0))){const remaining=Math.max(dt,.7-f.age),travel=Math.min(Math.max(0,distance-50),Math.max(560,distance/remaining)*dt);f.x+=f.actionX*travel;f.y+=f.actionY*travel;duel.clampPosition(f);}
  if(Math.hypot(target.x-f.x,target.y-f.y)<85){f.chidoriHits.push(target.uid);hits.push({target,source:f,value:190,guaranteed:true});duel.event('sasukeImpact',f,{x:target.x,y:target.y,skill:'chidori'});}
 }
 }
 if(f.age>=spec.cast&&!f.hit){f.hit=true;
 if(f.state==='fireball'){duel.shots.push({id:f.id,ownerUid:f.uid,kind:'fireball',damage:200,splashDamage:80,splash:100,radius:34,x:f.x+f.actionX*40,y:f.y+f.actionY*40,vx:f.actionX*430,vy:f.actionY*430,life:2});duel.event('fire',f,{skill:'fireball'});}
 else if(f.state==='amaterasu'){f.amaterasuX=o.x;f.amaterasuY=o.y;f.amaterasuEnd=duel.tick+240;f.amaterasuPulse=duel.tick+1;duel.event('amaterasuField',f,{x:o.x,y:o.y});}
 else if(f.state==='susanoo'){f.susanooEnd=duel.tick+300;for(const t of duel.fighters)if(t.hp>0&&duel.isEnemy(f,t)&&Math.hypot(t.x-f.x,t.y-f.y)<210)hits.push({target:t,source:f,value:210});duel.event('sasukeImpact',f,{x:f.x+f.actionX*90,y:f.y+f.actionY*90,skill:'susanoo',face:f.face});}}
 if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;},
 chooseSkill(duel,f,o,dx,dy,d){for(const key of ['susanoo','amaterasu','chidori','fireball'])if(f[key+'Cd']===0&&(key==='susanoo'?d<220:key==='amaterasu'?d<450:key==='chidori'?d>75&&d<260:d>150&&d<580)){duel.act(f,key,dx,dy);return true;}return false;}
};
export function sasukePose(f,hurt=false){const state=hurt?'hurt':f.state,spec=SASUKE_SKILLS[state],row=({idle:0,run:1,melee:f.combo%2?2:4,dash:3,guard:5,hurt:6,defeat:7,chidori:8,fireball:9,amaterasu:10,susanoo:11})[state]??0;return {row,frame:state==='defeat'?5:spec?Math.min(5,Math.floor(f.age/spec.duration*6)):['melee','dash','hurt','guard'].includes(state)?Math.min(5,Math.floor(f.age*(state==='dash'?24:10))):Math.floor(f.age*9)%6};}
