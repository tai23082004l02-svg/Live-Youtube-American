import {RENGOKU_META as META} from './rengoku-meta.js';
import {rengokuPose} from '../characters/rengoku.js';
import {personalCaster} from '../engine/personal-ultimate.js';
import {cinematicSteps} from '../engine/ultimate-rules.js';
export function rengokuSprite(ctx,images,key,row,col,x,y,scale=1,angle=0,face=1){const m=META[key],im=images[key];if(!m||!im?.complete||!im.naturalWidth)return;row=Math.max(0,Math.min(m.rows-1,row));col=Math.max(0,Math.min(m.rowCounts[row]-1,col));const [w,h]=m.frameSize,[px,py]=m.pivot;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale*(face<0?-1:1),scale);ctx.drawImage(im,col*w,row*h,w,h,-px,-py,w,h);ctx.restore();}
export function drawRengokuActor(ctx,images,d,f,hurt=false,override=null){let p=override?{...override,key:'rengoku_ultimate_actor',row:0}:rengokuPose(f,hurt);const c=personalCaster(d,f),a=d.personalUltimate?.attack;
 if(f.introAge!=null){if(f.introAge<.7)return;const n=Math.min(11,Math.floor(f.introAge/2.5*12));p={key:'rengoku_intro',row:Math.floor(n/6),frame:n%6};}
 else if(c?.kind==='purgatory'&&a?.phase!=='travel')p={key:'rengoku_ultimate_actor',row:0,frame:d.personalUltimate.cinematic?Math.min(5,Math.floor(d.personalUltimate.cinematic.elapsed/cinematicSteps(d.personalUltimate.cinematic)*6)):5};
 else if(a?.kind==='purgatory'&&a.ownerUid===f.uid&&a.phase==='travel'&&d.tick<a.launch+36)p={key:'rengoku_ultimate_actor',row:1,frame:Math.min(5,Math.floor((d.tick-a.launch)/7))};
 if(f.state==='defeat')p={key:'rengoku',row:7,frame:Math.min(4,Math.floor((d.tick-(f.deathTick??d.tick))/7))};
 rengokuSprite(ctx,images,p.key,p.row,p.frame,f.x,f.y,.86,0,f.face);
}
export function drawRengokuBack(ctx,images,d,clock=0){for(const f of d.fighters)if(f.id==='rengoku'&&f.hp>0){if(f.introAge!=null){const age=f.introAge;rengokuSprite(ctx,images,'rengoku_intro_vfx',age<1.2?0:1,Math.min(5,Math.floor((age<1.2?age/1.2:(age-1.2)/1.3)*6)),f.x,f.y-8,.65);}else if(f.hp/f.max<=.35){ctx.save();ctx.globalAlpha=.25;rengokuSprite(ctx,images,'rengoku_intro_vfx',1,Math.floor(clock*8)%6,f.x,f.y-5,.55);ctx.restore();}}}
export function drawRengokuWorld(ctx,images,d,clock=0){const a=d.personalUltimate?.attack;if(a?.kind!=='purgatory')return;
 if(a.phase==='warning'){ctx.save();ctx.strokeStyle='#ffb34c';ctx.lineWidth=2;ctx.setLineDash([12,8]);for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(a.x-a.dy*90*side,a.y+a.dx*90*side);ctx.lineTo(a.x+a.dx*576-a.dy*90*side,a.y+a.dy*576+a.dx*90*side);ctx.stroke();}ctx.restore();}
 else{const f=d.fighters.find(f=>f.uid===a.ownerUid);if(f)rengokuSprite(ctx,images,'rengoku_ultimate_vfx',0,Math.min(5,Math.floor((d.tick-a.launch)/7)),f.x,f.y-40,1.1,Math.atan2(a.dy,a.dx),1);}}
export function drawRengokuShot(ctx,images,s,x,y,clock){rengokuSprite(ctx,images,'rengoku_vfx',2,1+Math.floor(clock*12)%3,x,y,.8,Math.atan2(s.vy,s.vx));}
export function drawRengokuBurst(ctx,images,b){const ultimate=b.action==='purgatory',p=1-b.life/b.max;rengokuSprite(ctx,images,ultimate?'rengoku_ultimate_vfx':'rengoku_vfx',ultimate?1:b.action==='risingsun'?1:b.action==='flametiger'?2:0,Math.min(5,Math.floor(p*6)),b.x,b.y,ultimate?1.25:.75);}
export function drawRengokuChat(ctx,images,c,line='Flame Breathing: Purgatory!',reduced=false){const p=c.elapsed/cinematicSteps(c),m=META.rengoku_dialogue,row=p<.4?0:1,col=1,b=m.bounds[row][col],width=b[2]-b[0],height=b[3]-b[1],scale=Math.min(760/width,180/height),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;
 ctx.save();ctx.globalAlpha=Math.min(1,p*10,(1-p)*12);rengokuSprite(ctx,images,'rengoku_dialogue',row,col,480-(cx-m.pivot[0])*scale,438-(cy-m.pivot[1])*scale,scale);
 const textX=480+width*scale*.16,textWidth=width*scale*.56;ctx.textAlign='center';ctx.fillStyle='#fff1d1';ctx.font='bold 14px Georgia';ctx.fillText('KYOJURO RENGOKU',textX,410,textWidth);ctx.font='bold 19px Georgia';ctx.fillText(line,textX,449,textWidth);ctx.restore();}
export function drawRengokuCinematic(ctx,images,d,reduced=false){const c=d.personalUltimate?.cinematic;if(c?.kind==='purgatory')drawRengokuChat(ctx,images,c,undefined,reduced);}
