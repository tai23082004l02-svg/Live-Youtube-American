export const JINWOO_SKILLS={daggerrush:{cooldown:8,cast:.2,duration:1},shadowexchange:{cooldown:10,cast:.35,duration:.8},summonigris:{cooldown:14,cast:.65,duration:1.1},monarchdomain:{cooldown:24,cast:.75,duration:1.2}};
export const sung_jinwoo={name:'Sung Jinwoo',assets:['sung_jinwoo','sung_jinwoo_vfx','igris','sung_jinwoo_intro','sung_jinwoo_intro_vfx','sung_jinwoo_ultimate_vfx','sung_jinwoo_dialogue'],stats:{hp:1100,speed:225,melee:72,skillPower:100,cooldown:100},
 init(f){f.igris=null;f.igrisSerial=0;f.domainEnd=0;f.rage=0;f.rageLockUntil=0;f.rageReadyTick=null;f.personalUses=0;for(const [k,v] of Object.entries({daggerrush:2,shadowexchange:4,summonigris:.5,monarchdomain:5})){f[k+'Cd']=v*f.cooldownFactor;f.skillUses[k]=0;}},
 onAct(f,s,d){if(!JINWOO_SKILLS[s])return;f[s+'Cd']=JINWOO_SKILLS[s].cooldown*f.cooldownFactor;f.skillUses[s]++;f.rushHits=0;f.jinwooTarget=d.pickTarget(f)?.uid;},
 tick(f,dt){for(const k of Object.keys(JINWOO_SKILLS))f[k+'Cd']=Math.max(0,f[k+'Cd']-dt);},
 movementSpeedMultiplier(d,f){return d.tick<f.domainEnd?1.15:1;},
 outgoingDamageMultiplier(d,f){return d.tick<f.domainEnd?1.2:1;},
 onDamageDealt(d,f,damage){if(f.hp<=0||d.tick>=f.domainEnd||damage<=0)return;const healed=Math.min(f.max-f.hp,Math.round(damage*.2));if(healed>0){f.hp+=healed;d.event('heal',f,{value:healed,x:f.x,y:f.y});}},
 onDeath(d,f){f.igris=null;f.domainEnd=0;},
 beforeStep(d,hits){for(const f of d.fighters){if(f.id!=='sung_jinwoo'||f.hp<=0||!f.igris)continue;const s=f.igris;if(d.tick>=s.expires){d.event('igrisFade',f,{x:s.x,y:s.y});f.igris=null;continue;}if(d.tick-s.born<30)continue;const t=d.pickTarget(f);if(!t)continue;
  const dx=t.x-s.x,dy=t.y-s.y,dist=Math.hypot(dx,dy)||1;s.face=Math.sign(dx)||s.face;
  if(s.hitTick&&d.tick>=s.hitTick){const victim=d.fighters.find(t=>t.uid===s.targetUid&&t.hp>0);if(victim&&d.isEnemy(f,victim)&&Math.hypot(victim.x-s.x,victim.y-s.y)<130)hits.push({source:f,target:victim,value:85});d.event('igrisSlash',f,{x:s.x+s.face*45,y:s.y});s.hitTick=0;}
  if(d.tick>=(s.attackUntil||0)&&dist>85){const step=Math.min(dist-85,250*(d.tick<f.domainEnd?1.15:1)/60);s.x+=dx/dist*step;s.y+=dy/dist*step;d.clampPosition(s);}
  if(d.tick>=s.nextAttack&&dist<115){s.targetUid=t.uid;s.hitTick=d.tick+12;s.attackUntil=d.tick+27;s.nextAttack=d.tick+78;}
 }},
 updateAction(d,f,o,hits,dx,dy,dist,dt){const spec=JINWOO_SKILLS[f.state];if(!spec)return false;const t=d.fighters.find(t=>t.uid===f.jinwooTarget&&t.hp>0)||o;
  if(f.state==='daggerrush'){const tx=t.x-f.x,ty=t.y-f.y,n=Math.hypot(tx,ty)||1;if(f.age<.5&&d.tick>=(f.rootUntil||0)){const move=Math.min(Math.max(0,n-65),460*dt);f.x+=tx/n*move;f.y+=ty/n*move;d.clampPosition(f);}while(f.rushHits<3&&f.age>=[.25,.5,.78][f.rushHits]){const i=f.rushHits++;if(Math.hypot(t.x-f.x,t.y-f.y)<120)hits.push({source:f,target:t,value:[45,55,85][i]});d.event('jinwooSlash',f,{skill:'daggerrush',x:f.x+f.face*50,y:f.y,frame:i});}}
  else if(f.age>=spec.cast&&!f.hit){f.hit=true;
   if(f.state==='summonigris'){f.igris=d.clampPosition({uid:f.uid+'-igris-'+ ++f.igrisSerial,ownerUid:f.uid,team:f.team,x:f.x-f.face*65,y:f.y+35,face:f.face,born:d.tick,expires:d.tick+480,nextAttack:d.tick+45});d.event('igrisAppear',f,{x:f.igris.x,y:f.igris.y});}
   else if(f.state==='shadowexchange'){if(f.igris&&d.tick>=(f.rootUntil||0)){const fromX=f.x,fromY=f.y;f.x=f.igris.x;f.y=f.igris.y;f.igris.x=fromX;f.igris.y=fromY;d.clampPosition(f);d.clampPosition(f.igris);d.event('shadowSwap',f,{fromX,fromY,x:f.x,y:f.y});}}
   else {f.domainEnd=d.tick+360;d.event('monarchOn',f,{x:f.x,y:f.y});}
  }if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;
 },
 chooseSkill(d,f,o,dx,dy,dist){for(const k of ['summonigris','monarchdomain','shadowexchange','daggerrush'])if(f[k+'Cd']===0&&(k==='summonigris'?!f.igris:k==='monarchdomain'?dist<600:k==='shadowexchange'?f.igris&&dist>190&&Math.hypot(o.x-f.igris.x,o.y-f.igris.y)<dist-80:dist<340)){d.act(f,k,dx,dy);return true;}return false;}
};
export function jinwooPose(f,hurt=false){if(f.introAge!=null){const age=f.introAge;return age<1.35?{row:0,frame:Math.min(5,Math.max(0,Math.floor((age-.65)/.7*6)))}:age<1.85?{row:1,frame:Math.min(5,Math.floor((age-1.35)/.5*6))}:{row:2,frame:Math.min(5,Math.floor((age-1.85)/.65*6))};}const s=hurt?'hurt':f.state,spec=JINWOO_SKILLS[s];return {row:({idle:0,run:1,melee:f.combo%2?2:3,dash:4,guard:5,hurt:6,defeat:7,daggerrush:8,shadowexchange:9,summonigris:10,monarchdomain:11})[s]??0,frame:spec?Math.min(5,Math.floor(f.age/spec.duration*6)):['defeat','hurt','melee','dash','guard'].includes(s)?Math.min(5,Math.floor(f.age*10)):Math.floor(f.age*9)%6};}
