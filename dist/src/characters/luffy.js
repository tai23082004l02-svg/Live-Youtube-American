export const LUFFY_SKILLS={pistol:{cooldown:6,cast:.5,duration:.95},gatling:{cooldown:9,cast:.4,duration:1.3},redhawk:{cooldown:12,cast:.7,duration:1.15},gear2:{cooldown:18,cast:.6,duration:1}};
export const luffy={name:'Luffy',assets:['luffy','luffy_vfx'],stats:{hp:1200,speed:195,melee:76,skillPower:100,cooldown:100},
 init(f){for(const [key,delay] of Object.entries({pistol:1,gatling:3,redhawk:5,gear2:2})){f[key+'Cd']=delay*f.cooldownFactor;f.skillUses[key]=0;}},
 onAct(f,state){if(LUFFY_SKILLS[state]){f[state+'Cd']=LUFFY_SKILLS[state].cooldown*f.cooldownFactor;f.skillUses[state]++;if(state==='gatling')f.gatlingHits=0;}},
 tick(f,dt){for(const key of Object.keys(LUFFY_SKILLS))f[key+'Cd']=Math.max(0,f[key+'Cd']-dt);},
 movementSpeedMultiplier(duel,f){return duel.tick<(f.gear2End||0)?1.3:1;},
 outgoingDamageMultiplier(duel,f){return duel.tick<(f.gear2End||0)?1.15:1;},
 updateAction(duel,f,o,hits,dx,dy,d,dt){const spec=LUFFY_SKILLS[f.state];if(!spec)return false;
 if(f.state==='gatling')while(f.gatlingHits<5&&f.age>=.4+f.gatlingHits*.14){f.gatlingHits++;const tx=o.x-f.x,ty=o.y-f.y,distance=Math.hypot(tx,ty)||1;f.actionX=tx/distance;f.actionY=ty/distance;if(Math.abs(tx)>.1)f.face=Math.sign(tx);for(const t of duel.fighters){const ax=t.x-f.x,ay=t.y-f.y,along=ax*f.actionX+ay*f.actionY,cross=Math.abs(ax*f.actionY-ay*f.actionX);if(t.hp>0&&duel.isEnemy(f,t)&&along>0&&along<245&&cross<60)hits.push({target:t,source:f,value:45});}duel.event('luffyStrike',f,{x:f.x+f.actionX*Math.min(distance,220),y:f.y+f.actionY*Math.min(distance,220),fromX:f.x,fromY:f.y,skill:'gatling',face:f.face});}
 if(f.age>=spec.cast&&!f.hit){f.hit=true;
 if(f.state==='gear2'){f.gear2End=duel.tick+360;duel.event('gear2On',f,{x:f.x,y:f.y});}
 else if(f.state==='redhawk'){duel.shots.push({id:f.id,ownerUid:f.uid,kind:'redhawk',damage:230,splash:90,splashDamage:65,radius:32,x:f.x+f.actionX*40,y:f.y+f.actionY*40,vx:f.actionX*620,vy:f.actionY*620,life:.65,impactEvent:'luffyImpact',skill:'redhawk'});duel.event('fire',f,{skill:'redhawk'});}
 else if(f.state==='pistol'){const reach=320;for(const t of duel.fighters){const ax=t.x-f.x,ay=t.y-f.y,along=ax*f.actionX+ay*f.actionY,cross=Math.abs(ax*f.actionY-ay*f.actionX);if(t.hp>0&&duel.isEnemy(f,t)&&along>0&&along<reach&&cross<55)hits.push({target:t,source:f,value:150});}duel.event('luffyStrike',f,{x:f.x+f.actionX*Math.min(d,reach),y:f.y+f.actionY*Math.min(d,reach),fromX:f.x,fromY:f.y,skill:'pistol',face:f.face});}}
 if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;},
 chooseSkill(duel,f,o,dx,dy,d){for(const key of ['gear2','redhawk','gatling','pistol'])if(f[key+'Cd']===0&&(key==='gear2'?d<450:key==='redhawk'?d>100&&d<430:key==='gatling'?d<235:d>75&&d<310)){duel.act(f,key,dx,dy);return true;}return false;}
};
export function luffyPose(f,hurt=false){const state=hurt?'hurt':f.state,spec=LUFFY_SKILLS[state],row=({idle:0,run:1,melee:f.combo%2?2:4,dash:3,guard:5,hurt:6,defeat:7,pistol:8,gatling:9,redhawk:10,gear2:11})[state]??0;return {row,frame:state==='defeat'?5:spec?Math.min(5,Math.floor(f.age/spec.duration*6)):['melee','dash','hurt','guard'].includes(state)?Math.min(5,Math.floor(f.age*(state==='dash'?24:10))):Math.floor(f.age*9)%6};}
