export const ICHIGO_SKILLS={getsuga:{cooldown:8,cast:.55,duration:1},shunpo:{cooldown:9,cast:.28,duration:.75},bankaislash:{cooldown:11,cast:.25,duration:1.05},hollowmask:{cooldown:23,cast:.7,duration:1.1}};
export const ichigo={name:'Ichigo Kurosaki',assets:['ichigo','ichigo_vfx','ichigo_intro','ichigo_intro_vfx','ichigo_ultimate_vfx','ichigo_dialogue'],stats:{hp:1200,speed:215,melee:82,skillPower:100,cooldown:100},
 init(f){f.critStacks=0;f.hollowEnd=0;f.rage=0;f.rageLockUntil=0;f.rageReadyTick=null;f.personalUses=0;for(const [k,n] of Object.entries({getsuga:1,shunpo:2,bankaislash:3,hollowmask:5})){f[k+'Cd']=n*f.cooldownFactor;f.skillUses[k]=0;}},
 onAct(f,s,d){if(!ICHIGO_SKILLS[s])return;f[s+'Cd']=ICHIGO_SKILLS[s].cooldown*f.cooldownFactor;f.skillUses[s]++;f.slashHits=0;f.ichigoTarget=d.pickTarget(f)?.uid;},
 tick(f,dt){for(const k of Object.keys(ICHIGO_SKILLS))f[k+'Cd']=Math.max(0,f[k+'Cd']-dt);},
 critChanceBonus(d,f){return f.critStacks;},
 onDamageDealt(d,f,amount,hit){if(amount>0)f.critStacks=hit.critical?0:Math.min(100,f.critStacks+1);},
 movementSpeedMultiplier(d,f){return d.tick<f.hollowEnd?1.25:1;},
 outgoingDamageMultiplier(d,f){return d.tick<f.hollowEnd?1.2:1;},
 updateAction(d,f,o,hits,dx,dy,dist,dt){const spec=ICHIGO_SKILLS[f.state];if(!spec)return false;const t=d.fighters.find(t=>t.uid===f.ichigoTarget&&t.hp>0)||o;
  if(f.state==='bankaislash'){while(f.slashHits<3&&f.age>=[.25,.48,.78][f.slashHits]){const n=f.slashHits++;for(const t of d.fighters)if(t.hp>0&&d.isEnemy(f,t)&&Math.hypot(t.x-f.x,t.y-f.y)<(n===2?155:115))hits.push({source:f,target:t,value:n===2?110:55,knockback:n===2?65:0});d.event('ichigoSlash',f,{x:f.x+f.face*55,y:f.y,skill:'bankaislash',frame:n});}}
  else if(f.age>=spec.cast&&!f.hit){f.hit=true;
   if(f.state==='hollowmask'){f.hollowEnd=d.tick+360;d.event('hollowOn',f,{x:f.x,y:f.y});}
   else if(f.state==='shunpo'){if(d.tick>=(f.rootUntil||0)){const fromX=f.x,fromY=f.y,dx=t.x-f.x,dy=t.y-f.y,n=Math.hypot(dx,dy)||1,move=Math.max(0,n-65);f.x+=dx/n*move;f.y+=dy/n*move;f.face=Math.sign(dx)||f.face;d.clampPosition(f);d.event('ichigoStep',f,{fromX,fromY,x:f.x,y:f.y});}if(Math.hypot(t.x-f.x,t.y-f.y)<115)hits.push({source:f,target:t,value:155});d.event('ichigoSlash',f,{x:f.x+f.face*50,y:f.y,skill:'shunpo'});}
   else {d.shots.push({id:f.id,ownerUid:f.uid,kind:'getsuga',skill:'getsuga',damage:210,radius:38,x:f.x+f.actionX*38,y:f.y+f.actionY*38,vx:f.actionX*620,vy:f.actionY*620,life:1.8,piercing:true,hitUids:[],impactEvent:'ichigoImpact'});d.event('fire',f,{skill:'getsuga'});}
  }if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;
 },
 chooseSkill(d,f,o,dx,dy,dist){for(const k of ['hollowmask','bankaislash','shunpo','getsuga'])if(f[k+'Cd']===0&&(k==='hollowmask'?dist<550:k==='bankaislash'?dist<140:k==='shunpo'?dist>140:dist>110&&dist<650)){d.act(f,k,dx,dy);return true;}return false;}
};
export function ichigoPose(f,hurt=false){if(f.introAge!=null){const n=Math.min(15,Math.floor(f.introAge/2.5*16));return {row:Math.floor(n/4),frame:n%4};}const s=hurt?'hurt':f.state,spec=ICHIGO_SKILLS[s];return {row:({idle:0,run:1,melee:f.combo%2?2:3,dash:4,guard:5,hurt:6,defeat:7,getsuga:8,shunpo:9,bankaislash:10,hollowmask:11})[s]??0,frame:spec?Math.min(3,Math.floor(f.age/spec.duration*4)):['defeat','melee','hurt','dash','guard'].includes(s)?Math.min(3,Math.floor(f.age*10)):Math.floor(f.age*9)%4};}
