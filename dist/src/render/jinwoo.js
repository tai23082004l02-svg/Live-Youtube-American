import {beginBottomDialogue} from './bottom-dialogue.js';
import {ULTIMATE_CINEMATIC_STEPS} from '../engine/ultimate-rules.js';
import {JINWOO_META} from './jinwoo-meta.js';
import {jinwooPose} from '../characters/sung_jinwoo.js';
import {personalCaster} from '../engine/personal-ultimate.js';
export function jinwooSprite(ctx,images,key,row,col,x,y,scale=1,angle=0,face=1){const im=images[key],m=JINWOO_META[key];if(!im?.complete||!im.naturalWidth)return;const [w,h]=m.frameSize,[px,py]=m.pivot;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale*(face<0?-1:1),scale);ctx.drawImage(im,Math.max(0,Math.min(m.columns-1,col))*w,Math.max(0,Math.min(m.rows-1,row))*h,w,h,-px,-py,w,h);ctx.restore();}
export function drawJinwooActor(ctx,images,d,f,hurt=false,override=null){if(f.introAge!=null&&f.introAge<.65)return;const c=personalCaster(d,f),a=d.personalUltimate?.attack;let pose=c?{row:12,frame:Math.min(5,Math.floor((d.personalUltimate.cinematic?.elapsed??d.tick-c.born)/10))}:a?.ownerUid===f.uid&&a.phase==='travel'&&d.tick-a.launch<36?{row:13,frame:Math.min(5,Math.floor((d.tick-a.launch)/6))}:override||jinwooPose(f,hurt);
 if(f.state==='defeat')pose={row:7,frame:Math.min(5,Math.floor((d.tick-(f.deathTick??d.tick))/6))};ctx.save();const emerging=f.introAge!=null?Math.max(0,Math.min(1,(f.introAge-.65)/.7)):1;if(f.introAge!=null)ctx.globalAlpha=Math.min(1,(f.introAge-.65)/.18);jinwooSprite(ctx,images,f.introAge!=null?'sung_jinwoo_intro':'sung_jinwoo',pose.row,pose.frame,f.x-f.face*24*(1-emerging),f.y,.86,0,f.face);ctx.restore();
 
}
export function drawJinwooIntroBack(ctx,images,d){for(const f of d.fighters)if(f.id==='sung_jinwoo'&&f.hp>0&&f.introAge!=null){const age=f.introAge,frame=age<.55?Math.min(3,Math.floor(age/.55*4)):age<1.75?3:age<2.1?4:5;ctx.save();ctx.globalAlpha=age>2.25?Math.max(0,(2.5-age)/.25):1;jinwooSprite(ctx,images,'sung_jinwoo_intro_vfx',0,frame,f.x-f.face*24,f.y-60,.85);ctx.restore();}}
export function drawJinwooEffects(ctx,images,d,clock){for(const f of d.fighters)if(f.id==='sung_jinwoo'&&f.hp>0){
 if(f.introAge!=null){const age=f.introAge;if(age>1.35)jinwooSprite(ctx,images,'sung_jinwoo_intro_vfx',1,Math.min(5,Math.floor((age-1.35)/1.15*6)),f.x,f.y,.95);if(age>1.5)jinwooSprite(ctx,images,'sung_jinwoo_intro_vfx',2,Math.min(5,Math.floor((age-1.5)*6)),f.x-f.face*85,f.y-55,.7,0,f.face);}
 else if(d.tick<f.domainEnd){ctx.save();ctx.globalAlpha=.65;jinwooSprite(ctx,images,'sung_jinwoo_vfx',2,2+Math.floor(clock*8)%3,f.x,f.y,1.1);ctx.restore();}
 const s=f.igris;if(s){const age=(d.tick-s.born)/60,attack=d.tick<(s.attackUntil||0),frame=age<.5?Math.min(2,Math.floor(age*6)):attack?Math.min(5,3+Math.floor((27-(s.attackUntil-d.tick))/9)):2;jinwooSprite(ctx,images,'igris',0,frame,s.x,s.y-55,.86,0,s.face);}
}}
export function drawAriseWorld(ctx,images,d,reduced=false){const a=d.personalUltimate?.attack;if(!a||a.kind!=='arise')return;const face=a.dx<0?-1:1;
 if(a.phase==='warning'){const p=(d.tick-a.born)/36;ctx.save();ctx.strokeStyle='#8b7cff';ctx.lineWidth=2;ctx.setLineDash([12,10]);for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(a.x-a.dy*105*side,a.y+a.dx*105*side);ctx.lineTo(a.x+a.dx*720-a.dy*105*side,a.y+a.dy*720+a.dx*105*side);ctx.stroke();}ctx.restore();jinwooSprite(ctx,images,'sung_jinwoo_ultimate_vfx',0,Math.min(5,Math.floor(p*6)),a.x,a.y-10,1);if(p>.35)jinwooSprite(ctx,images,'sung_jinwoo_ultimate_vfx',1,Math.min(5,Math.floor(p*6)),a.x,a.y-65,.8,0,face);
 }else for(let wave=0;wave<3;wave++){const age=d.tick-a.launch-wave*15;if(age<0||age>60)continue;const reach=age*12;ctx.save();ctx.globalAlpha=Math.min(1,(60-age)/10);jinwooSprite(ctx,images,'sung_jinwoo_ultimate_vfx',2,Math.min(5,Math.floor(age/10)),a.x+a.dx*reach,a.y+a.dy*reach-45,.85,0,face);ctx.restore();}
}
export function drawJinwooCinematic(ctx,images,d,reduced=false){const c=d.personalUltimate?.cinematic,a=d.personalUltimate?.attack;if((c||a)?.kind!=='arise')return;
 if(!c){if(a.phase==='travel'&&d.tick-a.launch<48){ctx.save();ctx.globalAlpha=Math.min(1,(48-(d.tick-a.launch))/12);jinwooSprite(ctx,images,'sung_jinwoo_dialogue',3,0,480,92,.55);ctx.restore();}return;}
 drawJinwooChat(ctx,images,c,'Arise.',reduced);
}
export function drawJinwooChat(ctx,images,c,line='Arise.',reduced=false){
 const p=c.elapsed/ULTIMATE_CINEMATIC_STEPS;beginBottomDialogue(ctx,'jinwoo');ctx.globalAlpha=Math.min(1,p*8,(1-p)*12);const slide=reduced?0:Math.max(0,1-p*8)*70;
 jinwooSprite(ctx,images,'sung_jinwoo_dialogue',0,p>.45?1:0,480+slide,310,.8);jinwooSprite(ctx,images,'sung_jinwoo_dialogue',2,p>.5?1:0,240+slide,310,.27);
 ctx.textAlign='left';ctx.fillStyle='#e6eeff';ctx.font='bold 17px Segoe UI';ctx.fillText('SUNG JINWOO',405+slide,274,190);ctx.font=line.length<10?'bold 40px Georgia':'bold 25px Georgia';ctx.fillText(line,405+slide,322,440);ctx.font='bold 12px Segoe UI';ctx.fillStyle='#b9a6ff';ctx.fillText('SHADOW MONARCH',405+slide,350,300);ctx.restore();
}
