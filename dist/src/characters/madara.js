export const MADARA_SKILLS={truthorbs:{cooldown:8,cast:.2,duration:1.05},lightfang:{cooldown:10,cast:.55,duration:1.1},limbo:{cooldown:15,cast:.45,duration:.9},madaraorb:{cast:.2,duration:.55}};
export const madara={name:'Madara Uchiha',assets:['madara','madara_cast','madara_vfx','madara_intro','madara_intro_vfx','madara_ultimate_actor','madara_ultimate_vfx','madara_dialogue'],stats:{hp:1350,speed:205,melee:65,skillPower:100,cooldown:100,blockChance:20,blinkChance:0,aggression:35,preferredRange:375},rangedBasic:true,
 init(f){Object.assign(f,{rage:0,rageLockUntil:0,rageReadyTick:null,personalUses:0,sixPathsAwakened:false,limboShadows:[],orbWaves:0,madaraEscapeCd:0});for(const [k,delay] of Object.entries({truthorbs:1,lightfang:3,limbo:5})){f[k+'Cd']=delay*f.cooldownFactor;f.skillUses[k]=0;}f.skillUses.madaraorb=0;},
 tick(f,dt){f.madaraEscapeCd=Math.max(0,f.madaraEscapeCd-dt);if(!f.sixPathsAwakened&&f.hp<f.max*.4)f.sixPathsAwakened=true;const rate=f.sixPathsAwakened?1.2:1;for(const k of ['truthorbs','lightfang','limbo'])f[k+'Cd']=Math.max(0,f[k+'Cd']-dt*rate);if(f.sixPathsAwakened)f.cd=Math.max(0,f.cd-dt*.2);},
 onAct(f,state,d){const spec=MADARA_SKILLS[state];if(!spec)return;f.skillUses[state]++;if(spec.cooldown)f[state+'Cd']=spec.cooldown*f.cooldownFactor;else f.cd=1.8*f.cooldownFactor;f.madaraTarget=d.pickTarget(f)?.uid;f.orbWaves=0;},
 onDeath(d,f){f.limboShadows=[];},
 beforeStep(d,hits){for(const f of d.fighters)if(f.id==='madara'){if(f.hp<=0){f.limboShadows=[];continue;}for(const s of f.limboShadows){s.life-=1/60;if(s.life<=0)continue;s.age+=1/60;s.cd=Math.max(0,s.cd-1/60);const t=d.pickTarget({...s,uid:f.uid,team:f.team});if(!t){s.life=0;continue;}const dx=t.x-s.x,dy=t.y-s.y,n=Math.hypot(dx,dy)||1;s.face=Math.sign(dx)||s.face;if(n>75){s.x+=dx/n*270/60;s.y+=dy/n*270/60;s.state='run';d.clampPosition(s);}else{s.state='melee';if(s.cd===0){s.cd=.9;hits.push({source:f,target:t,value:65,knockback:10});d.event('madaraLimboStrike',f,{x:t.x,y:t.y});}}}f.limboShadows=f.limboShadows.filter(s=>s.life>0);}},
 updateAction(d,f,o,hits,dx,dy,distance,dt){const spec=MADARA_SKILLS[f.state];if(!spec)return false;const t=d.fighters.find(t=>t.uid===f.madaraTarget&&t.hp>0&&d.isEnemy(f,t))||o;
  if(f.state==='limbo'&&distance<200&&d.tick>=(f.rootUntil||0)){const move=madaraRetreat(d,f,d.fighters.filter(t=>t.hp>0&&d.isEnemy(f,t)));f.x+=move.x*f.speed*dt*.75;f.y+=move.y*f.speed*dt*.75;d.clampPosition(f);}
  const orb=basic=>{const tx=t.x-f.x,ty=t.y-f.y,n=Math.hypot(tx,ty)||1;d.shots.push({id:f.id,ownerUid:f.uid,kind:basic?'madaraorb':'truthorbs',skill:f.state,damage:basic?62:85,radius:basic?26:44,splash:basic?0:70,splashDamage:30,requiresOwnerAlive:true,x:f.x+tx/n*45,y:f.y+ty/n*45,vx:tx/n*(basic?430:480),vy:ty/n*(basic?430:480),life:1.5,impactEvent:'madaraOrbImpact'});d.event('fire',f,{skill:f.state});};
  if(f.state==='truthorbs'){while(f.orbWaves<3&&f.age>=[.2,.42,.64][f.orbWaves]){f.orbWaves++;orb(false);}}
  else if(f.age>=spec.cast&&!f.hit){f.hit=true;if(f.state==='madaraorb')orb(true);else if(f.state==='lightfang'){d.shots.push({id:f.id,ownerUid:f.uid,kind:'lightfang',skill:'lightfang',fromX:f.x+f.actionX*15,fromY:f.y+f.actionY*15,damage:220,radius:43,piercing:true,hitUids:[],requiresOwnerAlive:true,x:f.x+f.actionX*35,y:f.y+f.actionY*35,vx:f.actionX*1050,vy:f.actionY*1050,life:.7,impactEvent:'madaraFangImpact'});d.event('fire',f,{skill:f.state});}else if(f.state==='limbo'){f.limboShadows=[d.clampPosition({x:f.x-f.actionY*50,y:f.y+f.actionX*50,life:5,age:0,cd:.35,face:f.face,state:'run'})];d.event('madaraLimbo',f,{x:f.x,y:f.y});}}
  if(f.age>=spec.duration){f.state='idle';f.age=0;}return true;},
 chooseSkill(d,f,o,dx,dy,distance){
  const enemies=d.fighters.filter(t=>t.hp>0&&d.isEnemy(f,t)),near=enemies.reduce((a,b)=>Math.hypot(b.x-f.x,b.y-f.y)<Math.hypot(a.x-f.x,a.y-f.y)?b:a,o),gap=Math.hypot(near.x-f.x,near.y-f.y),rooted=d.tick<(f.rootUntil||0);
  if(gap<200){
   const move=madaraRetreat(d,f,enemies),blocked=move.gain<35;
   if(blocked&&!rooted&&f.madaraEscapeCd===0){const point=madaraEscapePoint(d,f,enemies);if(point.gap>gap+80){const fromX=f.x,fromY=f.y;f.x=point.x;f.y=point.y;f.madaraEscapeCd=8;f.blinks++;f.moveX=f.moveY=0;f.state='idle';d.event('teleported',f,{x:f.x,y:f.y,fromX,fromY});return true;}}
   if(f.limboCd===0&&!f.limboShadows.length){d.act(f,'limbo',near.x-f.x,near.y-f.y);return true;}
   f.moveX=move.x;f.moveY=move.y;f.state='run';return true;
  }
  for(const k of ['truthorbs','lightfang'])if(f[k+'Cd']===0&&distance<700){d.act(f,k,dx,dy);return true;}
  if(f.limboCd===0&&!f.limboShadows.length&&gap<330){d.act(f,'limbo',dx,dy);return true;}
  if(this.chooseBasic(d,f,o,dx,dy,distance))return true;
  const n=distance||1,side=f.choice>.5?1:-1,forward=distance>450?1:distance<300?-1:0;
  let x=dx/n*forward-dy/n*side*.8,y=dy/n*forward+dx/n*side*.8;
  let point=d.clampPosition({x:f.x+x*60,y:f.y+y*60});
  if(Math.hypot(point.x-f.x,point.y-f.y)<25){x=dx/n*forward+dy/n*side*.8;y=dy/n*forward-dx/n*side*.8;}
  const length=Math.hypot(x,y)||1;f.moveX=x/length;f.moveY=y/length;f.state='run';return true;
 },
 ultimateTarget(d,f){const enemies=d.fighters.filter(t=>t.hp>0&&d.isEnemy(f,t));return enemies.sort((a,b)=>enemies.filter(t=>Math.hypot(t.x-b.x,t.y-b.y)<200).length-enemies.filter(t=>Math.hypot(t.x-a.x,t.y-a.y)<200).length||Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y))[0];},
 chooseBasic(d,f,o,dx,dy,distance){if(f.cd===0&&distance<650){d.act(f,'madaraorb',dx,dy);return true;}return false;}
};
export function madaraPose(f,hurt=false){const state=hurt?'hurt':f.state,spec=MADARA_SKILLS[state];if(spec)return {key:'madara_cast',row:state==='lightfang'?1:state==='limbo'?2:0,frame:Math.min(3,Math.floor(f.age/spec.duration*4))};return {key:'madara',row:({idle:0,run:1,melee:f.combo%2?2:3,dash:4,guard:5,hurt:6,defeat:7})[state]??0,frame:['melee','dash','hurt','defeat'].includes(state)?Math.min(3,Math.floor(f.age*10)):Math.floor(f.age*8)%4};}

// Evaluate real, clamped destinations so retreat also works along arena edges.
export function madaraRetreat(d,f,enemies){
 const clearance=p=>Math.min(...enemies.map(t=>Math.hypot(p.x-t.x,p.y-t.y))),start=clearance(f);let best={x:0,y:0,gain:-Infinity};
 for(let i=0;i<24;i++){const a=i*Math.PI/12,x=Math.cos(a),y=Math.sin(a),p=d.clampPosition({x:f.x+x*90,y:f.y+y*90}),gain=clearance(p)-start;
 const score=gain+Math.hypot(p.x-f.x,p.y-f.y)*.04;
 if(score>(best.score??-Infinity))best={x,y,gain,score};}return best;
}
export function madaraEscapePoint(d,f,enemies){let best={x:f.x,y:f.y,gap:0};for(let i=0;i<32;i++){const a=i*Math.PI/16,p=d.clampPosition({x:f.x+Math.cos(a)*350,y:f.y+Math.sin(a)*350}),gap=Math.min(...enemies.map(t=>Math.hypot(p.x-t.x,p.y-t.y)));if(gap>best.gap)best={...p,gap};}return best;}
