export const FRIEZA_SKILLS={deathbeam:{cooldown:6,cast:.45,duration:.9},saucers:{cooldown:10,cast:.7,duration:1.1},supernova:{cooldown:15,cast:1.1,duration:1.6},golden:{cooldown:24,cast:1,duration:1.4}};
export const frieza={name:'Frieza (Fide)',assets:['frieza','frieza_golden','frieza_vfx'],stats:{hp:1150,speed:195,melee:72,skillPower:100,cooldown:100},
 init(f){for(const [key,delay] of Object.entries({deathbeam:1,saucers:3,supernova:6,golden:4})){f[key+'Cd']=delay*f.cooldownFactor;f.skillUses[key]=0;}},
 onAct(f,state){if(FRIEZA_SKILLS[state]){f[state+'Cd']=FRIEZA_SKILLS[state].cooldown*f.cooldownFactor;f.skillUses[state]++;}},
 tick(f,dt){for(const key of Object.keys(FRIEZA_SKILLS))f[key+'Cd']=Math.max(0,f[key+'Cd']-dt);},
 movementSpeedMultiplier(d,f){return d.tick<(f.goldenEnd||0)?1.15:1;},outgoingDamageMultiplier(d,f){return d.tick<(f.goldenEnd||0)?1.25:1;},
 updateShot(duel,s){if(s.kind!=='saucers')return;const owner=duel.shotOwner(s);if(!owner||owner.hp<=0)return;const t=duel.pickTarget(owner);if(!t)return;const dx=t.x-s.x,dy=t.y-s.y,d=Math.hypot(dx,dy)||1;s.vx=s.vx*.92+dx/d*400*.08;s.vy=s.vy*.92+dy/d*400*.08;},
 updateAction(duel,f,o,hits,dx,dy,d,dt){const spec=FRIEZA_SKILLS[f.state];if(!spec)return false;
 if(f.age>=spec.cast&&!f.hit){f.hit=true;if(f.state==='golden'){f.goldenEnd=duel.tick+480;duel.event('goldenOn',f,{x:f.x,y:f.y});}
 else {const count=f.state==='saucers'?2:1;for(let i=0;i<count;i++){const angle=Math.atan2(f.actionY,f.actionX)+(count===2?(i-.5)*.35:0),beam=f.state==='deathbeam',sun=f.state==='supernova';duel.shots.push({id:f.id,ownerUid:f.uid,kind:f.state,skill:f.state,damage:beam?180:sun?270:95,radius:beam?24:sun?42:28,vx:Math.cos(angle)*(beam?850:sun?300:400),vy:Math.sin(angle)*(beam?850:sun?300:400),x:f.x+Math.cos(angle)*40,y:f.y+Math.sin(angle)*40,life:sun?3:2.5,piercing:beam,hitUids:[],...(sun?{splash:140,splashDamage:120}:{}),impactEvent:'friezaImpact'});}duel.event('fire',f,{skill:f.state});}}
 if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;},
 chooseSkill(duel,f,o,dx,dy,d){for(const key of ['golden','supernova','saucers','deathbeam'])if(f[key+'Cd']===0&&(key==='golden'?d<500:key==='supernova'?d>180&&d<650:key==='saucers'?d>100&&d<580:d>80&&d<650)){duel.act(f,key,dx,dy);return true;}return false;}
};
export function friezaPose(f,hurt=false){const state=hurt?'hurt':f.state,spec=FRIEZA_SKILLS[state],row=({idle:0,run:1,melee:f.combo%3===0?4:f.combo%2?2:3,dash:1,guard:5,hurt:6,defeat:7,deathbeam:8,saucers:9,supernova:10,golden:11})[state]??0;return {row,frame:state==='defeat'?7:spec?Math.min(7,Math.floor(f.age/spec.duration*8)):['melee','dash','hurt','guard'].includes(state)?Math.min(7,Math.floor(f.age*(state==='dash'?32:14))):Math.floor(f.age*11)%8};}
