// Character-specific gameplay; duel supplies shared combat and seeded RNG.
export const broly={name:"Broly",assets:["broly", "broly_vfx"],stats:{hp:1300,speed:155,melee:96,skillPower:100,cooldown:100},
 updateAction(duel,f,o,hits,dx,dy,d,DT){
 if(f.state==='rush'){if(f.age>=.3&&f.age<.62){f.x+=f.actionX*500*DT;f.y+=f.actionY*500*DT;if(!f.hit&&Math.hypot(o.x-f.x,o.y-f.y)<70){f.hit=true;hits.push({target:o,source:f,value:120});}}if(f.age>=.95){f.state='idle';f.age=0;}}
 else if(f.state==='wave'){if(f.age>=.7&&!f.hit){f.hit=true;duel.event('waveBurst',f,{x:f.x,y:f.y});for(const target of duel.fighters)if(duel.isEnemy(f,target)&&target.hp>0&&Math.hypot(target.x-f.x,target.y-f.y)<150)hits.push({target,source:f,value:160});}if(f.age>=1.12){f.state='idle';f.age=0;}}
 else if(f.state==='roar'){if(f.age>=1.05&&!f.hit){f.hit=true;duel.shots.push({id:f.id,ownerUid:f.uid,kind:'roar',damage:250,radius:40,x:f.x+f.actionX*40,y:f.y+f.actionY*40,vx:f.actionX*580,vy:f.actionY*580,life:1.8});duel.event('fire',f,{skill:'roar'});}if(f.age>=1.55){f.state='idle';f.age=0;}}
 else return false;
 return true;
 },
 chooseSkill(duel,f,o,dx,dy,d){
 if(f.waveCd===0&&d<130){duel.act(f,'wave',dx,dy);return true;} if(f.roarCd===0&&d>210&&d<560){duel.act(f,'roar',dx,dy);return true;} if(f.rushCd===0&&d>135&&d<280){duel.act(f,'rush',dx,dy);return true;}
 return false;
 }
};

// Sprite-space sockets measured on Broly's beam row, relative to 320x224 frames.
export const BROLY_SPRITE={scale:1.04,pivot:[160,192],chargeCenters:[[220,102],[229,116],[239,119]]};
export function brolyCastFrame(f){const windup=f.state==='roar'?1.05:.75;if(f.hit)return f.age>windup+.10?5:2;const progress=f.age/windup;return progress<.25?0:progress<.6?1:2;}
export function brolyMuzzle(f,frame=brolyCastFrame(f)){const anchor=BROLY_SPRITE.chargeCenters[Math.min(2,frame)],direction=f.face<0?-1:1;return {x:f.x+(anchor[0]-BROLY_SPRITE.pivot[0])*BROLY_SPRITE.scale*direction,y:f.y+(anchor[1]-BROLY_SPRITE.pivot[1])*BROLY_SPRITE.scale};}
export function shotSocket(s,f,target){const muzzle=brolyMuzzle(f,2),distance=s.kind==='roar'?40:35,speed=Math.hypot(s.vx,s.vy),ux=s.vx/speed,uy=s.vy/speed,origin={x:f.x+ux*distance,y:f.y+uy*distance};return {dx:muzzle.x-origin.x,dy:muzzle.y-(origin.y-28),blendDistance:Math.max(1,Math.min(120,Math.hypot(target.x-origin.x,target.y-origin.y)-(s.radius||34))),initialLife:1.8};}
