// Character-specific gameplay; duel supplies shared combat and seeded RNG.
export const vegeta={name:"Vegeta",assets:["vegeta"],stats:{hp:1200,speed:175,melee:76,skillPower:100,cooldown:100},
 updateAction(duel,f,o,hits,dx,dy,d,DT){
 if(f.state==='volley'){while(f.volleyHits<3&&f.age>=.26+f.volleyHits*.18){const vx=o.x-f.x,vy=o.y-f.y,len=Math.hypot(vx,vy)||1;f.actionX=vx/len;f.actionY=vy/len;f.face=Math.sign(vx)||f.face;duel.shots.push({id:f.id,ownerUid:f.uid,kind:'volley',damage:48,radius:28,x:f.x+f.actionX*35,y:f.y+f.actionY*35,vx:f.actionX*490,vy:f.actionY*490,life:1.8});f.volleyHits++;duel.event('fire',f,{skill:'volley'});}if(f.age>=.95){f.state='idle';f.age=0;}}
 else if(f.state==='final'){if(f.age>=1.1&&!f.hit){f.hit=true;duel.shots.push({id:f.id,ownerUid:f.uid,kind:'final',damage:340,radius:44,x:f.x+f.actionX*45,y:f.y+f.actionY*45,vx:f.actionX*690,vy:f.actionY*690,life:1.8});duel.event('fire',f,{skill:'final'});}if(f.age>=1.65){f.state='idle';f.age=0;}}
 else return false;
 return true;
 },
 chooseSkill(duel,f,o,dx,dy,d){
 if(f.finalCd===0&&d>220&&d<600){duel.act(f,'final',dx,dy);return true;} if(f.volleyCd===0&&d>125&&d<470){duel.act(f,'volley',dx,dy);return true;}
 return false;
 }
};
