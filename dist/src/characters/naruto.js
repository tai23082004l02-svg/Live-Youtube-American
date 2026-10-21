// Character-specific gameplay; duel supplies shared combat and seeded RNG.
export const naruto={name:"Naruto",assets:["naruto", "naruto_vfx", "naruto_kurama", "naruto_transform"],stats:{hp:1150,speed:190,melee:72,skillPower:100,cooldown:100},
 updateAction(duel,f,o,hits,dx,dy,d,DT){
 if(f.state==='rasengan'){if(f.age>=.45&&f.age<.73){f.x+=f.actionX*380*DT;f.y+=f.actionY*380*DT;if(!f.hit&&Math.hypot(o.x-f.x,o.y-f.y)<95){f.hit=true;hits.push({target:o,source:f,value:175});duel.event('rasenganImpact',f,{x:o.x,y:o.y});}}if(f.age>=1.05){f.state='idle';f.age=0;}}
 else if(f.state==='shuriken'){if(f.age>=.85&&!f.hit){f.hit=true;duel.shots.push({id:f.id,ownerUid:f.uid,kind:'shuriken',damage:220,splashDamage:90,radius:30,splash:110,x:f.x+f.actionX*36,y:f.y+f.actionY*36,vx:f.actionX*500,vy:f.actionY*500,life:1.8});duel.event('fire',f,{skill:'shuriken'});}if(f.age>=1.3){f.state='idle';f.age=0;}}
 else if(f.state==='clones'){if(f.age>=.55&&!f.hit){f.hit=true;duel.clones=duel.clones.filter(c=>c.ownerUid!==f.uid);for(const side of [-1,1]){const c=duel.clampPosition({id:'naruto',uid:f.uid+'-clone-'+(++duel.cloneSerial),ownerUid:f.uid,team:f.team,x:f.x-f.actionY*side*50,y:f.y+f.actionX*side*50,life:6,cd:.35,age:0,face:f.face,state:'run'});duel.clones.push(c);duel.event('clonePoof',f,{x:c.x,y:c.y});}}if(f.age>=.9){f.state='idle';f.age=0;}}
 else return false;
 return true;
 },
 chooseSkill(duel,f,o,dx,dy,d){
 if(f.clonesCd===0&&d<400){duel.act(f,'clones',dx,dy);return true;} if(f.rasenganCd===0&&d>75&&d<230){duel.act(f,'rasengan',dx,dy);return true;} if(f.shurikenCd===0&&d>180&&d<580){duel.act(f,'shuriken',dx,dy);return true;}
 return false;
 }
};

// Normal-form Naruto only. Defeat row contains clean held resting poses.
export function narutoPose(f,hurt=false){const state=hurt?'hurt':f.state;let row=({idle:0,run:1,melee:f.combo%2?2:8,dash:3,rasengan:4,clones:5,hurt:6,defeat:7,shuriken:9})[state]??0,frame=Math.floor(f.age*9)%6;
 if(state==='rasengan')frame=f.hit?4:f.age<.15?0:f.age<.3?1:f.age<.45?2:f.age<.73?3:5;
 else if(state==='shuriken')frame=f.hit?(f.age<1.05?4:5):Math.min(3,Math.floor(f.age/.85*4));
 else if(state==='clones')frame=Math.min(5,Math.floor(f.age/.9*6));else if(state==='hurt')frame=Math.min(3,Math.floor(f.age*14));else if(['dash','melee','defeat'].includes(state))frame=Math.min(5,Math.floor(f.age*(state==='dash'?24:10)));return {row,frame};}

export function narutoShotSocket(s,f,target){const direction=f.face<0?-1:1,muzzle={x:f.x+58*.86*direction,y:f.y-57*.86},speed=Math.hypot(s.vx,s.vy)||1,origin={x:f.x+s.vx/speed*36,y:f.y+s.vy/speed*36};return {dx:muzzle.x-origin.x,dy:muzzle.y-(origin.y-28),initialLife:1.8,blendDistance:Math.max(1,Math.min(100,Math.hypot(target.x-origin.x,target.y-origin.y)-(s.radius||30)))};}
