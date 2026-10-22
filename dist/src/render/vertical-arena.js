import {drawTitle} from './titles.js';
import {PORTRAIT_SCENE_HEIGHT} from '../engine/arena.js';
import {drawGrandstand,drawPortraitBackdrop} from './grandstand.js';

export function drawVerticalArena(ctx,u,scene,dialogue,reduced=false){ctx.save();ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,540,960);
 // Everything above chat is clipped: even large effects cannot enter its 25%.
 ctx.save();ctx.beginPath();ctx.rect(0,0,540,720);ctx.clip();drawPortraitBackdrop(ctx);drawGrandstand(ctx,u.audience,u.h.names,reduced);
 ctx.save();ctx.beginPath();ctx.rect(0,0,540,720);ctx.clip();if(u.active&&scene&&!['loading','error'].includes(u.phase))ctx.drawImage(scene,180,0,600,PORTRAIT_SCENE_HEIGHT,0,0,540,720);
 if(u.active){
  if(u.phase==='battle'&&u.h.duel().result){const age=u.h.resultAge();if(age<.22&&!reduced){ctx.globalAlpha=Math.max(0,1-age/.22)*.23;ctx.fillStyle='#fff4cf';ctx.fillRect(0,192,540,528);ctx.globalAlpha=1;}}
  if(['intro','battle'].includes(u.phase)&&!u.h.duel().result&&dialogue)ctx.drawImage(dialogue,0,416,540,304);
 }
 ctx.restore();

 ctx.restore();
 // No team introduction: the bottom quarter stays black while combat begins.
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.fillRect(0,720,540,240);ctx.save();ctx.beginPath();ctx.rect(0,720,540,240);ctx.clip();
 if(u.paused){text(ctx,'PAUSED',270,820,30,'#ffe19a');}
 else if(u.active){if(u.phase==='waiting')waiting(ctx,u);else if(u.phase==='draft')draft(ctx,u);else if(u.phase==='complete')champion(ctx,u);else if(['loading','error'].includes(u.phase))message(ctx,u.phase==='error'?'ASSET LOAD FAILED':'LOADING FIGHTERS',u.phase==='error'?'Esc / Retry loading':'Preparing the next battle');
  else if(u.phase==='battle'&&u.h.duel().result&&u.h.resultAge()>=.95){text(ctx,u.h.duel().result==='draw'?'DRAW':'VICTORY',270,818,42,'#ffe19a');}}
 ctx.restore();ctx.restore();}
function text(ctx,value,x,y,size=14,color='#edf6ff',width=510){if(drawTitle(ctx,value,x,y-size*.35,Math.min(width,size*12),size*1.7))return;ctx.fillStyle=color;ctx.textAlign='center';ctx.font=`${size>=24?'900':'600'} ${size}px "Times New Roman",Times,serif`;ctx.fillText(value,x,y,width);}
function draft(ctx,u){text(ctx,'TOURNAMENT DRAW',270,754,26,'#ffe09a');
 const pool=Object.keys(u.h.names);for(const [i,e] of u.model.entries.entries()){const x=60+(i%4)*135,y=779+Math.floor(i/4)*86,locked=u.age>=.6+i*.55,id=locked?e.players[0]:pool[(Math.floor(u.age*12)+i*7)%pool.length],im=u.portraits.get(id);
  ctx.fillStyle=locked?'#213c3d':'#173347';ctx.fillRect(x-30,y,60,64);if(im?.complete&&im.naturalWidth)ctx.drawImage(im,x-28,y+4,56,56);}}
function waiting(ctx,u){text(ctx,u.lastDraw||u.lastWinner==='DRAW'?'REMATCH':'NEXT BATTLE',270,840,30,'#ffe09a');}
function champion(ctx,u){const e=u.model.entries[u.model.champion];text(ctx,'CHAMPION',270,770,32,'#ffe09a');const im=u.portraits.get(e.players[0]);if(im?.complete&&im.naturalWidth)ctx.drawImage(im,220,800,100,100);}
function message(ctx,title){text(ctx,title,270,830,24,'#ffe09a');}
