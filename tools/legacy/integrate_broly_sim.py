from pathlib import Path
p=Path('down-arena/dist/sim.js');s=p.read_text(encoding='utf-8');s=s.replace("constructor(seed='DOWN-001',swap=false){", "constructor(seed='DOWN-001',swap=false,pair=['goku','vegeta']){if(pair.length!==2||pair[0]===pair[1]||pair.some(id=>!['goku','vegeta','broly'].includes(id)))throw new Error('Choose two distinct fighters');")
s=s.replace("this.fighters=['goku','vegeta'].map((id,i)=>({id,name:i?'VEGETA':'SON GOKU'", "this.fighters=pair.map((id,i)=>({id,name:({goku:'SON GOKU',vegeta:'VEGETA',broly:'BROLY'})[id]")
s=s.replace('hp:1200,max:1200','hp:id===\'broly\'?1400:1200,max:id===\'broly\'?1400:1200')
s=s.replace('finalCd:5,kaiokenLeft','finalCd:5,rushCd:2,waveCd:3.5,roarCd:6,kaiokenLeft').replace('skillUses:{teleport:0,kaioken:0,volley:0,final:0}','skillUses:{teleport:0,kaioken:0,volley:0,final:0,rush:0,wave:0,roar:0}')
s=s.replace("if(state==='dash'){", "if(['rush','wave','roar'].includes(state)){f.skillUses[state]++;f[state+'Cd']={rush:6,wave:10,roar:14}[state];}if(state==='dash'){")
s=s.replace("'finalCd','fatigueLeft'", "'finalCd','rushCd','waveCd','roarCd','fatigueLeft'")
s=s.replace(" if(f.state==='teleport'){", """ if(f.state==='rush'){if(f.age>=.3&&f.age<.62){f.x+=f.actionX*500*DT;f.y+=f.actionY*500*DT;if(!f.hit&&Math.hypot(o.x-f.x,o.y-f.y)<70){f.hit=true;hits.push({target:o,source:f,value:145});}}if(f.age>=.95){f.state='idle';f.age=0;}}
 else if(f.state==='wave'){if(f.age>=.7&&!f.hit){f.hit=true;this.event('waveBurst',f,{x:f.x,y:f.y});if(d<150)hits.push({target:o,source:f,value:190});}if(f.age>=1.12){f.state='idle';f.age=0;}}
 else if(f.state==='roar'){if(f.age>=1.05&&!f.hit){f.hit=true;this.shots.push({id:f.id,kind:'roar',damage:270,radius:40,x:f.x+f.actionX*40,y:f.y+f.actionY*40,vx:f.actionX*580,vy:f.actionY*580,life:1.8});this.event('fire',f,{skill:'roar'});}if(f.age>=1.55){f.state='idle';f.age=0;}}
 else if(f.state==='teleport'){""")
s=s.replace('f.age>=.23&&!f.hit','f.age>=(f.id===\'broly\'?.34:.23)&&!f.hit').replace('if(d<98&&dot>.35)','if(d<(f.id===\'broly\'?110:98)&&dot>.35)').replace('value:f.kaiokenLeft>0?92:76','value:f.id===\'broly\'?108:f.kaiokenLeft>0?92:76').replace('f.kaiokenLeft>0?.43:.57','f.id===\'broly\'?.78:f.kaiokenLeft>0?.43:.57')
s=s.replace('if(f.age>=.65&&!f.hit)','if(f.age>=(f.id===\'broly\'?.75:.65)&&!f.hit)').replace("id:f.id,x:f.x+f.actionX*35", "id:f.id,kind:f.id==='broly'?'orb':'beam',damage:f.id==='broly'?210:230,radius:34,x:f.x+f.actionX*35").replace('vx:f.actionX*570,vy:f.actionY*570','vx:f.actionX*(f.id===\'broly\'?460:570),vy:f.actionY*(f.id===\'broly\'?460:570)')
s=s.replace("(o.state==='final'&&o.age>.18&&o.age<1.2)","(o.state==='final'&&o.age>.18&&o.age<1.2)||(o.state==='roar'&&o.age>.18&&o.age<1.15)")
s=s.replace("if(o.state==='melee'", "if(o.state==='wave'&&o.age>.18&&o.age<.74&&d<170)danger=true;if(o.state==='rush'&&o.age>.18&&o.age<.62&&d<210)danger=true;\n if(o.state==='melee'")
s=s.replace("['beam','final','volley'].includes(o.state)","['beam','final','volley','roar'].includes(o.state)")
s=s.replace(" else if(f.id==='goku'&&f.teleportCd", """ else if(f.id==='broly'&&f.waveCd===0&&d<130)this.act(f,'wave',dx,dy);
 else if(f.id==='broly'&&f.roarCd===0&&d>210&&d<560)this.act(f,'roar',dx,dy);
 else if(f.id==='broly'&&f.rushCd===0&&d>135&&d<280)this.act(f,'rush',dx,dy);
 else if(f.id==='goku'&&f.teleportCd""")
s=s.replace('else if(d<83&&f.cd===0)','else if(d<(f.id===\'broly\'?94:83)&&f.cd===0)')
s=s.replace('f.moveX*175*','f.moveX*(f.id===\'broly\'?155:175)*').replace('f.moveY*175*','f.moveY*(f.id===\'broly\'?155:175)*')
p.write_text(s,encoding='utf-8')
