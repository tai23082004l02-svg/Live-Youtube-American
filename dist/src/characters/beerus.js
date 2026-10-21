export const BEERUS_SKILLS={hakai:{cooldown:10,cast:.7,duration:1.15},destruction:{cooldown:13,cast:.85,duration:1.3},divineshock:{cooldown:9,cast:.5,duration:.95},destroyerwrath:{cooldown:23,cast:.8,duration:1.2}};
export const beerus={name:'Beerus (Birut)',assets:['beerus','beerus_vfx','beerus_intro','beerus_intro_vfx'],stats:{hp:1250,speed:200,melee:85,skillPower:100,cooldown:100},
 init(f){f.wrathEnd=0;for(const [k,v] of Object.entries({hakai:1,destruction:3,divineshock:2,destroyerwrath:5})){f[k+'Cd']=v*f.cooldownFactor;f.skillUses[k]=0;}},
 onAct(f,s){if(BEERUS_SKILLS[s]){f[s+'Cd']=BEERUS_SKILLS[s].cooldown*f.cooldownFactor;f.skillUses[s]++;}},
 tick(f,dt){for(const k of Object.keys(BEERUS_SKILLS))f[k+'Cd']=Math.max(0,f[k+'Cd']-dt);},
 incomingDamageMultiplier(d,f){return d.tick<f.wrathEnd?.8:1;},
 outgoingDamageMultiplier(d,f){return d.tick<f.wrathEnd?1.25:1;},
 updateAction(d,f,o,hits){const spec=BEERUS_SKILLS[f.state];if(!spec)return false;
  if(f.age>=spec.cast&&!f.hit){f.hit=true;
   if(f.state==='destroyerwrath'){f.wrathEnd=d.tick+360;d.event('wrathOn',f,{x:f.x,y:f.y});}
   else if(f.state==='divineshock'){
    for(const t of d.fighters)if(t.hp>0&&d.isEnemy(f,t)&&Math.hypot(t.x-f.x,t.y-f.y)<165)hits.push({target:t,source:f,value:140,knockback:65});
    d.event('beerusShock',f,{x:f.x,y:f.y});
   }else{const orb=f.state==='destruction';d.shots.push({id:f.id,ownerUid:f.uid,kind:f.state,skill:f.state,damage:orb?240:270,radius:orb?36:30,x:f.x+f.actionX*38,y:f.y+f.actionY*38,vx:f.actionX*(orb?300:700),vy:f.actionY*(orb?300:700),life:orb?2.8:.48,impactEvent:'beerusImpact',...(orb?{splash:125,splashDamage:95}:{})});d.event('fire',f,{skill:f.state});}
  }
  if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;
 },
 chooseSkill(d,f,o,dx,dy,dist){for(const k of ['destroyerwrath','divineshock','destruction','hakai'])if(f[k+'Cd']===0&&(k==='destroyerwrath'?dist<500:k==='divineshock'?dist<155:k==='destruction'?dist>140&&dist<600:dist>75&&dist<340)){d.act(f,k,dx,dy);return true;}return false;}
};
export function beerusPose(f,hurt=false){if(f.introAge!=null){const n=Math.min(17,Math.floor(f.introAge/2.5*18));return {row:Math.floor(n/6),frame:n%6};}const s=hurt?'hurt':f.state,spec=BEERUS_SKILLS[s];return {row:({idle:0,run:1,melee:f.combo%2?2:3,dash:4,guard:5,hurt:6,defeat:7,hakai:8,destruction:9,divineshock:10,destroyerwrath:11})[s]??0,frame:spec?Math.min(5,Math.floor(f.age/spec.duration*6)):['defeat','melee','hurt','dash','guard'].includes(s)?Math.min(5,Math.floor(f.age*(s==='dash'?24:10))):Math.floor(f.age*9)%6};}
