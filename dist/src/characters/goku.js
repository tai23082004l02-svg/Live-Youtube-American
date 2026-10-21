// Character-specific gameplay; duel supplies shared combat and seeded RNG.
export const goku={name:"Son Goku",assets:["goku"],stats:{hp:1200,speed:175,melee:76,skillPower:100,cooldown:100},
 updateAction(duel,f,o,hits,dx,dy,d,DT){
 if(f.state==='teleport'){if(f.age>=.24&&!f.hit){f.hit=true;const ox=f.x,oy=f.y;if(duel.fighters.every(other=>other===f||other.hp<=0||Math.hypot(f.destX-other.x,f.destY-other.y)>=44)){f.x=f.destX;f.y=f.destY;f.face=Math.sign(o.x-f.x)||f.face;duel.event('teleported',f,{x:f.x,y:f.y,fromX:ox,fromY:oy});}}if(f.age>=.44){f.state='idle';f.age=0;}}
 else if(f.state==='kaioken'){if(f.age>=.4&&!f.hit){f.hit=true;f.kaiokenLeft=5;duel.event('kaiokenOn',f);}if(f.age>=.48){f.state='idle';f.age=0;}}
 else return false;
 return true;
 },
 chooseSkill(duel,f,o,dx,dy,d){
 if(f.teleportCd===0&&d>145&&d<480&&['beam','final','volley','roar'].includes(o.state)){duel.act(f,'teleport',dx,dy);return true;} if(f.kaiokenCd===0&&d<230){duel.act(f,'kaioken',dx,dy);return true;}
 return false;
 }
};
