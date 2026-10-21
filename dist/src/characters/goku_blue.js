export const BLUE_SKILLS={instantblue:{cooldown:10,cast:.65,duration:1.15},bluerush:{cooldown:8,cast:.2,duration:1.05},godbind:{cooldown:12,cast:.55,duration:.95},bluekaioken:{cooldown:22,cast:.8,duration:1.2}};
export const goku_blue={name:'Goku Blue',assets:['goku_blue','goku_blue_vfx','goku_blue_transform','goku_blue_intro_vfx'],stats:{hp:1150,speed:215,melee:75,skillPower:100,cooldown:100,blinkChance:50},
 init(f){for(const [key,delay] of Object.entries({instantblue:1,bluerush:3,godbind:4,bluekaioken:6})){f[key+'Cd']=delay*f.cooldownFactor;f.skillUses[key]=0;}f.blueKaiokenEnd=0;},
 onAct(f,state,d){if(!BLUE_SKILLS[state])return;f[state+'Cd']=BLUE_SKILLS[state].cooldown*f.cooldownFactor;f.skillUses[state]++;f.blueRushHits=0;f.blueTarget=d.pickTarget(f)?.uid;},
 tick(f,dt){for(const key of Object.keys(BLUE_SKILLS))f[key+'Cd']=Math.max(0,f[key+'Cd']-dt);},
 movementSpeedMultiplier(d,f){return d.tick<f.blueKaiokenEnd?1.25:1;},
 outgoingDamageMultiplier(d,f){return d.tick<f.blueKaiokenEnd?1.2:1;},
 updateAction(d,f,o,hits,dx,dy,distance,dt){const spec=BLUE_SKILLS[f.state];if(!spec)return false;
  const target=d.fighters.find(t=>t.uid===f.blueTarget&&t.hp>0)||o;
  if(f.state==='bluerush'){
   const tx=target.x-f.x,ty=target.y-f.y,dist=Math.hypot(tx,ty)||1;
   if(f.age<.45&&d.tick>=(f.rootUntil||0)){const move=Math.min(Math.max(0,dist-65),620*dt);f.x+=tx/dist*move;f.y+=ty/dist*move;d.clampPosition(f);}
   while(f.blueRushHits<3&&f.age>=[.3,.55,.8][f.blueRushHits]){const n=f.blueRushHits++;if(Math.hypot(target.x-f.x,target.y-f.y)<105){hits.push({target,source:f,value:n===2?90:55});d.event('blueImpact',f,{x:target.x,y:target.y,skill:'bluerush'});}}
  }else if(f.age>=spec.cast&&!f.hit){f.hit=true;
   if(f.state==='bluekaioken'){f.hp=Math.max(1,f.hp-Math.round(f.hp*.08));f.blueKaiokenEnd=d.tick+360;d.event('blueKaiokenOn',f);}
   else if(f.state==='godbind'){if(Math.hypot(target.x-f.x,target.y-f.y)<500){hits.push({target,source:f,value:60,rootTicks:60});d.event('blueBind',f,{x:target.x,y:target.y,targetUid:target.uid});}}
   else {if(d.tick>=(f.rootUntil||0)){const fromX=f.x,fromY=f.y;f.x=target.x-target.face*100;f.y=target.y+22;d.clampPosition(f);d.event('blueTeleport',f,{fromX,fromY,x:f.x,y:f.y});}const tx=target.x-f.x,ty=target.y-f.y,dist=Math.hypot(tx,ty)||1;f.face=Math.sign(tx)||f.face;d.shots.push({id:f.id,ownerUid:f.uid,kind:'instantblue',skill:'instantblue',damage:250,radius:30,x:f.x+tx/dist*38,y:f.y+ty/dist*38,vx:tx/dist*750,vy:ty/dist*750,life:1.6,piercing:true,hitUids:[],impactEvent:'blueImpact'});d.event('fire',f,{skill:'instantblue'});}
  }
  if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;
 },
 chooseSkill(d,f,o,dx,dy,dist){for(const key of ['bluekaioken','instantblue','godbind','bluerush'])if(f[key+'Cd']===0&&(key==='bluekaioken'?dist<550:key==='instantblue'?dist>120&&dist<650:key==='godbind'?dist<450:dist<330)){d.act(f,key,dx,dy);return true;}return false;}
};
export function gokuBluePose(f,hurt=false){if(f.introAge!=null){const n=Math.min(23,Math.floor(f.introAge/2.5*24));return {row:Math.floor(n/6),frame:n%6};}const s=hurt?'hurt':f.state,spec=BLUE_SKILLS[s],row=({idle:0,run:1,melee:f.combo%2?2:3,dash:4,guard:5,hurt:6,defeat:7,instantblue:10,bluerush:11,godbind:12,bluekaioken:13})[s]??0;return {row,frame:spec?Math.min(5,Math.floor(f.age/spec.duration*6)):s==='defeat'?Math.min(5,Math.floor(f.age*10)):Math.floor(f.age*10)%6};}
