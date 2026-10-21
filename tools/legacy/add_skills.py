from pathlib import Path
p=Path('down-arena/dist/sim.js');s=p.read_text(encoding='utf-8');s=s.replace('dashCd:0,hit:false','dashCd:0,teleportCd:1.6,kaiokenCd:3,volleyCd:1.8,finalCd:5,kaiokenLeft:0,fatigueLeft:0,skillUses:{teleport:0,kaioken:0,volley:0,final:0},volleyHits:0,hit:false');s=s.replace("if(state==='dash'){", "if(['teleport','kaioken','volley','final'].includes(state)){f.skillUses[state]++;f[state==='teleport'?'teleportCd':state==='kaioken'?'kaiokenCd':state==='volley'?'volleyCd':'finalCd']={teleport:9,kaioken:14,volley:5,final:13}[state];f.volleyHits=0;if(state==='teleport'){const o=this.fighters.find(o=>o!==f);f.destX=Math.max(50,Math.min(910,o.x-o.face*78));f.destY=Math.max(75,Math.min(480,o.y+((this.tick%2)?24:-24)));this.event('teleportWarn',f,{x:f.destX,y:f.destY});}}if(state==='dash'){")
s=s.replace("['cd','beamCd','dashCd']", "['cd','beamCd','dashCd','teleportCd','kaiokenCd','volleyCd','finalCd','fatigueLeft']")
s=s.replace("const dx=o.x-f.x", "if(f.kaiokenLeft>0){f.kaiokenLeft=Math.max(0,f.kaiokenLeft-DT);if(!f.kaiokenLeft)f.fatigueLeft=1.2;}const dx=o.x-f.x",1)
s=s.replace(" if(f.state==='dash'){", """ if(f.state==='teleport'){if(f.age>=.24&&!f.hit){f.hit=true;const ox=f.x,oy=f.y;if(Math.hypot(f.destX-o.x,f.destY-o.y)>=44){f.x=f.destX;f.y=f.destY;f.face=Math.sign(o.x-f.x)||f.face;this.event('teleported',f,{x:f.x,y:f.y,fromX:ox,fromY:oy});}}if(f.age>=.44){f.state='idle';f.age=0;}}
 else if(f.state==='kaioken'){if(f.age>=.4&&!f.hit){f.hit=true;f.kaiokenLeft=4;this.event('kaiokenOn',f);}if(f.age>=.48){f.state='idle';f.age=0;}}
 else if(f.state==='volley'){while(f.volleyHits<3&&f.age>=.26+f.volleyHits*.18){const vx=o.x-f.x,vy=o.y-f.y,len=Math.hypot(vx,vy)||1;f.actionX=vx/len;f.actionY=vy/len;f.face=Math.sign(vx)||f.face;this.shots.push({id:f.id,kind:'volley',damage:65,radius:28,x:f.x+f.actionX*35,y:f.y+f.actionY*35,vx:f.actionX*490,vy:f.actionY*490,life:1.8});f.volleyHits++;this.event('fire',f,{skill:'volley'});}if(f.age>=.95){f.state='idle';f.age=0;}}
 else if(f.state==='final'){if(f.age>=1.1&&!f.hit){f.hit=true;this.shots.push({id:f.id,kind:'final',damage:340,radius:44,x:f.x+f.actionX*45,y:f.y+f.actionY*45,vx:f.actionX*690,vy:f.actionY*690,life:1.8});this.event('fire',f,{skill:'final'});}if(f.age>=1.65){f.state='idle';f.age=0;}}
 else if(f.state==='dash'){""")
s=s.replace('value:76','value:f.kaiokenLeft>0?87:76').replace('f.age>=.57','f.age>=(f.kaiokenLeft>0?.43:.57)')
s=s.replace("if(o.state==='beam'&&o.age>.18&&o.age<.78)","if(((o.state==='beam'&&o.age>.18&&o.age<.78)||(o.state==='final'&&o.age>.18&&o.age<1.2)))")
s=s.replace(" else if(f.beamCd===0", """ else if(f.id==='goku'&&f.teleportCd===0&&d>145&&d<480&&['beam','final','volley'].includes(o.state))this.act(f,'teleport',dx,dy);
 else if(f.id==='goku'&&f.kaiokenCd===0&&d<230)this.act(f,'kaioken',dx,dy);
 else if(f.id==='vegeta'&&f.finalCd===0&&d>220&&d<600)this.act(f,'final',dx,dy);
 else if(f.id==='vegeta'&&f.volleyCd===0&&d>125&&d<470)this.act(f,'volley',dx,dy);
 else if(f.beamCd===0""")
s=s.replace('f.moveX*175*DT','f.moveX*175*(f.kaiokenLeft>0?1.3:f.fatigueLeft>0?.65:1)*DT').replace('f.moveY*175*DT','f.moveY*175*(f.kaiokenLeft>0?1.3:f.fatigueLeft>0?.65:1)*DT')
s=s.replace(')<34){hits.push',')<(s.radius||34)){hits.push').replace('value:230','value:s.damage||230')
p.write_text(s,encoding='utf-8')
