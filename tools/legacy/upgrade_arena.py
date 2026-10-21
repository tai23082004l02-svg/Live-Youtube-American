from pathlib import Path
p=Path('down-arena/dist/sim.js');s=p.read_text(encoding='utf-8-sig').replace('face:i?-1:1','face:(i^Number(swap))?-1:1').replace("if(Math.abs(dx)>.1)f.face=Math.sign(dx);}","if(['idle','run'].includes(f.state)&&Math.abs(dx)>.1)f.face=Math.sign(dx);}");p.write_text(s,encoding='utf-8')
p=Path('down-arena/dist/index.html');s=p.read_text(encoding='utf-8-sig').replace('PROTOTYPE 01','PROTOTYPE 02').replace('<button id="record">','<button id="sound" aria-pressed="false">♪ Âm thanh bật</button><label>Âm lượng <input id="volume" type="range" min="0" max="0.6" step="0.02" value="0.28" aria-label="Âm lượng hiệu ứng"></label><button id="record">').replace('Bản thử dùng sprite minh họa; hiệu ứng chưởng được vẽ riêng.','Âm thanh tổng hợp được mở khi bấm Bắt đầu. Sprite minh họa; hiệu ứng chưởng được vẽ riêng.');p.write_text(s,encoding='utf-8')
p=Path('down-arena/dist/style.css');s=p.read_text(encoding='utf-8-sig');s+='\n#volume{width:70px;padding:0;accent-color:#f4ac58}.arena.hit-goku{border-color:#ffc16c}.arena.hit-vegeta{border-color:#c193ff}.track{position:relative}.track i{transition:width .12s linear}.overlay.result{background:#101a2988}.arena-foot #status{font-weight:700}\n';p.write_text(s,encoding='utf-8')
p=Path('down-arena/dist/app.js');s=p.read_text(encoding='utf-8-sig');s=s.replace("import {Duel,DT} from './sim.js';","import {Duel,DT} from './sim.js';\nimport {ArenaAudio} from './audio.js';\nconst audio=new ArenaAudio();let hitFlash={},shake=0,resultAge=0,resultShown=false,particles=[];\n$('sound').onclick=()=>{audio.unlock();audio.setMuted(!audio.muted);$('sound').textContent=audio.muted?'♪ Âm thanh tắt':'♪ Âm thanh bật';$('sound').setAttribute('aria-pressed',String(audio.muted));};$('volume').oninput=e=>audio.setVolume(e.target.value);")
s=s.replace("seen=0;fx=[];$('overlay')","seen=0;fx=[];hitFlash={};particles=[];shake=0;resultAge=0;resultShown=false;$('overlay').classList.remove('result');$('overlay')")
s=s.replace("function toggle(){if(duel.result)","function toggle(){audio.unlock();if(duel.result)")
s=s.replace("acc=0;}\n$('start')","acc=0;}\n$('start')")
s=s.replace("if(e.type==='hit')fx.push({...e,life:.65});", """audio.play(e.type,e.value>=200);
 if(e.type==='hit'){fx.push({...e,life:.65});hitFlash[e.id]=.18;shake=e.value>=200?7:3;for(let k=0;k<12;k++){const angle=k*Math.PI/6+e.tick*.1;particles.push({x:e.x,y:e.y-28,vx:Math.cos(angle)*(75+k*7),vy:Math.sin(angle)*(75+k*7),life:.32,max:.32,color:e.source==='goku'?'#a4ecff':'#dfb5ff'});}}
""")
s=s.replace("if(duel.result&&running){running=false;", "if(duel.result&&running){running=false;resultAge=0;$('status').textContent='KẾT LIỄU';}if(duel.result&&resultAge>1.15&&!resultShown){resultShown=true;$('overlay').classList.add('result');")
s=s.replace("if(seen===1)$('log').textContent='';", "if(!$('log').children.length)$('log').textContent='';")
s=s.replace("function render(){floor();", "function render(){ctx.save();if(shake>0){ctx.translate(Math.sin(last*.073)*shake,Math.cos(last*.091)*shake*.55);}floor();")
s=s.replace("const im=images[f.id],state=f.state==='beam'?'powerup':f.state;", "const im=images[f.id],state=f.state==='beam'?'powerup':(hitFlash[f.id]>.08&&f.hp>0?'hurt':f.state);")
s=s.replace("let frame=Math.floor(f.age*9)%6;", "let frame=Math.floor(f.age*9)%6;if(state==='hurt')frame=1;")
s=s.replace("frame=Math.min(5,Math.floor(f.age*(state==='dash'?24:10)))", "frame=Math.min(5,Math.floor((state==='defeat'?resultAge:f.age)*(state==='dash'?24:10)))")
s=s.replace("ctx.drawImage(im,frame*320", "if(hitFlash[f.id]>0){ctx.filter='brightness(1.7) saturate(.6)';}ctx.drawImage(im,frame*320")
s=s.replace("if(f.state==='beam'&&f.age<.65){", "if(f.state==='beam'&&f.age<.65){")
s=s.replace("circle(f.x+f.actionX*28,f.y-28,8+f.age*18,color,3);", """const px=f.x+f.actionX*28,py=f.y-28;
 const halo=ctx.createRadialGradient(px,py,0,px,py,45);halo.addColorStop(0,color+'bb');halo.addColorStop(1,color+'00');ctx.fillStyle=halo;ctx.fillRect(px-45,py-45,90,90);circle(px,py,8+f.age*18,color,3);
 for(let j=0;j<6;j++){const angle=j*Math.PI/3-f.age*7,rr=42-f.age*35;ctx.fillStyle=color;ctx.beginPath();ctx.arc(px+Math.cos(angle)*rr,py+Math.sin(angle)*rr,2,0,7);ctx.fill();}""")
s=s.replace("for(const s of duel.shots){ctx.save();", "for(const s of duel.shots){ctx.save();")
s=s.replace("ctx.globalAlpha=1;}\nfunction loop", "ctx.globalAlpha=1;for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);}ctx.globalAlpha=1;ctx.restore();}\nfunction loop")
start=s.index('function loop(t)');end=s.index('\nwindow.arena=',start)
s=s[:start]+'''function loop(t){const elapsed=Math.min((t-last)/1000||0,.1);last=t;
 const visualDt=(running?elapsed*Number($('speed').value):duel.result?elapsed:0);
 for(const e of fx)e.life-=visualDt;fx=fx.filter(e=>e.life>0);
 for(const key in hitFlash)hitFlash[key]=Math.max(0,hitFlash[key]-visualDt);
 shake=Math.max(0,shake-visualDt*35);
 for(const p of particles){p.x+=p.vx*visualDt;p.y+=p.vy*visualDt;p.life-=visualDt;}particles=particles.filter(p=>p.life>0);
 if(running){acc+=elapsed*Number($('speed').value);while(acc>=DT){duel.step();acc-=DT;if(duel.result){acc=0;break;}}events();}
 else if(duel.result){resultAge+=elapsed;events();}
 update();render();requestAnimationFrame(loop);}reset();requestAnimationFrame(loop);
''' +s[end:]
p.write_text(s,encoding='utf-8')
