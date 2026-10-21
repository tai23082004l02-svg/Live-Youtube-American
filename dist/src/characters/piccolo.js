// Character-specific gameplay; duel supplies shared combat and seeded RNG.
export const piccolo={name:"Piccolo",assets:["piccolo", "piccolo_vfx"],stats:{hp:1250,speed:170,melee:80,skillPower:100,cooldown:100},
 updateAction(duel,f,o,hits,dx,dy,d,DT){
 if(f.state==='special'||f.state==='light'){const special=f.state==='special',windup=special?1.1:.9;if(f.age>=windup&&!f.hit){f.hit=true;duel.shots.push({id:f.id,ownerUid:f.uid,kind:f.state,damage:special?300:260,radius:special?20:36,splash:special?0:105,x:f.x+f.actionX*38,y:f.y+f.actionY*38,vx:f.actionX*(special?760:450),vy:f.actionY*(special?760:450),life:1.8});duel.event('fire',f,{skill:f.state});}if(f.age>=windup+.5){f.state='idle';f.age=0;}}
 else if(f.state==='hellzone'){while(f.volleyHits<5&&f.age>=.65+f.volleyHits*.12){const angle=Math.atan2(o.y-f.y,o.x-f.x)+(f.volleyHits-2)*.23;duel.shots.push({id:f.id,ownerUid:f.uid,kind:'hellzone',damage:44,radius:21,x:f.x+Math.cos(angle)*38,y:f.y+Math.sin(angle)*38,vx:Math.cos(angle)*340,vy:Math.sin(angle)*340,life:2.1});f.volleyHits++;duel.event('fire',f,{skill:'hellzone'});}if(f.age>=1.55){f.state='idle';f.age=0;}}
 else return false;
 return true;
 },
 chooseSkill(duel,f,o,dx,dy,d){
 if(f.specialCd===0&&d>200&&d<600){duel.act(f,'special',dx,dy);return true;} if(f.hellzoneCd===0&&d>140&&d<450){duel.act(f,'hellzone',dx,dy);return true;} if(f.lightCd===0&&d>100&&d<350){duel.act(f,'light',dx,dy);return true;}
 return false;
 }
};

// Piccolo source poses have baked-in charge glows: use neutral recovery after release.
export function piccoloPose(f,hurt=false){let row=({idle:0,run:1,melee:2,dash:3,beam:4,light:4,special:8,hellzone:9,defeat:7})[f.state]??0,frame=Math.floor(f.age*9)%6;
 if(hurt){row=6;frame=1;}else if(['beam','special','light'].includes(f.state)){const windup=f.state==='special'?1.1:f.state==='light'?.9:.65;frame=f.hit?(f.age>windup+.1?5:3):Math.min(2,Math.floor(f.age/windup*3));}
 else if(f.state==='hellzone')frame=Math.min(5,Math.floor(f.age*4));else if(f.state==='dash')frame=Math.min(5,Math.floor(f.age*24));else if(f.state==='melee')frame=Math.min(5,Math.floor(f.age*10));else if(f.state==='defeat')frame=Math.min(5,Math.floor(f.age*10));
 const anchor=f.state==='special'?[[159,100],[187,77],[190,84],[241,105],[241,105],[160,125]][frame]:f.state==='hellzone'?[160,100]:[[183,134],[170,135],[165,134],[230,115],[230,115],[160,125]][frame];return {row,frame,x:f.x+(anchor[0]-160)*.86*(f.face<0?-1:1),y:f.y+(anchor[1]-192)*.86};}
export function piccoloShotSocket(s,f,target){const muzzle=piccoloPose(f),distance=['special','light','hellzone'].includes(s.kind)?38:35,speed=Math.hypot(s.vx,s.vy),origin={x:f.x+s.vx/speed*distance,y:f.y+s.vy/speed*distance};return {dx:muzzle.x-origin.x,dy:muzzle.y-(origin.y-28),initialLife:s.kind==='hellzone'?2.1:1.8,blendDistance:Math.max(1,Math.min(110,Math.hypot(target.x-origin.x,target.y-origin.y)-(s.radius||34)))};}

