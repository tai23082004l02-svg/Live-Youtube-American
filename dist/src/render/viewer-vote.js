import {drawBrandLogo} from './brand-logo.js';
import {LIVE_TIMINGS} from '../live-arena.js';
export const VOTE_LAYOUT=Object.freeze({width:540,height:960,hudY:252,hudHeight:64,arenaY:328,arenaHeight:540*9/16});
export function visibleVoteRows(rows,age=0){const pages=Math.max(1,Math.ceil(rows.length/5)),page=Math.floor(Math.max(0,age)/5)%pages;return {rows:rows.slice(page*5,page*5+5),page,pages};}
function text(ctx,value,x,y,size,color='#e9eef5',align='left',width=490){ctx.fillStyle=color;ctx.font=`600 ${size}px "Times New Roman",Times,serif`;ctx.textAlign=align;ctx.fillText(value,x,y,width);}
export function drawVoteBroadcast(ctx,u,scene){ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,540,960);const v=u.ballot;
 text(ctx,v?.locked?'NEXT MATCH LOCKED':'CHOOSE THE NEXT FIGHTERS',24,54,22,'#fff0d3');
 text(ctx,v?.locked?'LOCKED':'VOTING',516,54,17,'#7ddcfd','right',95);
 text(ctx,u.chat?.enabled?`COMMENT 1–${v?.ids.length||10} TO VOTE · ONE VOTE PER VIEWER`:'SIMULATED VOTES · ONE VOTE PER VIEWER · CHANGE WITH A NEW NUMBER',24,75,9,'#aab8c8');
 if(u.chat?.enabled){
  text(ctx,`COMMENT 1–${v?.ids.length||10} IN CHAT`,270,704,29,'#ffe0a0','center',492);
  text(ctx,'TO PICK THE NEXT FIGHTERS',270,740,23,'#ffe0a0','center',492);
  text(ctx,'ONE VOTE EACH · COMMENT AGAIN TO CHANGE',270,772,14,'#e9eef5','center',492);
 }
 const allRows=v?.rows||[],total=v?.votes.size||0,{rows,page,pages}=visibleVoteRows(allRows,u.votePageAge||0);
 for(const [i,row] of rows.entries()){
  const y=88+i*26,win=v?.winners?.includes(row.id),color=win?'#f3cd78':'#7bcee9';
  ctx.fillStyle=win?'#292318':'#111c28';ctx.fillRect(24,y,492,22);
  ctx.fillStyle=win?'#665025':'#1d5268';ctx.fillRect(24,y,492*(total?row.count/total:0),22);
  text(ctx,`${row.number}  ·  ${row.name}`,34,y+17,15,win?'#ffe2a0':'#eef5ff','left',390);
  text(ctx,String(row.count),506,y+17,14,color,'right',55);
 }
 if(pages>1)text(ctx,`${rows[0]?.number}–${rows.at(-1)?.number} OF ${allRows.length} · PAGE ${page+1}/${pages}`,270,232,12,'#e9eef5','center',492);
 if(scene&&u.active){ctx.save();ctx.translate(0,VOTE_LAYOUT.hudY);ctx.scale(540/960,VOTE_LAYOUT.hudHeight/112);drawVoteMatchHUD(ctx,u);ctx.restore();ctx.drawImage(scene,0,VOTE_LAYOUT.arenaY,540,VOTE_LAYOUT.arenaHeight);}else text(ctx,'START LIVE ARENA',270,490,23,'#8faac0','center');
 text(ctx,'For the best experience, set video quality to the highest available.',270,659,11,'#c8d7e6','center',492);
 // Keep the remaining lower area black for the operator's OBS layout.
 ctx.restore();}
function meter(ctx,x,y,width,height,value,color,reverse=false){const ratio=Math.max(0,Math.min(1,Number(value)||0));ctx.save();ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x+width,y);ctx.lineTo(x+width-5,y+height);ctx.lineTo(x,y+height);ctx.closePath();ctx.fillStyle='#1b2632';ctx.fill();ctx.clip();ctx.fillStyle=color;ctx.fillRect(reverse?x+width*(1-ratio):x,y,width*ratio,height);ctx.restore();ctx.strokeStyle='#637181';ctx.lineWidth=.8;ctx.stroke();}
export function drawVoteMatchHUD(ctx,u){ctx.save();const fighters=u.h.duel().fighters;
 for(const [i,f] of fighters.entries()){const team=f.team??(i< fighters.length/2?'A':'B'),right=team==='B',slot=fighters.slice(0,i).filter(other=>(other.team??(fighters.indexOf(other)<fighters.length/2?'A':'B'))===team).length;ctx.save();if(fighters.length>2){ctx.translate(0,slot*56);ctx.scale(1,.5);}const x=right?636:24,anchor=right?936:24,align=right?'right':'left',color=right?'#ff98af':'#7cddff',rage=Math.max(0,Math.min(100,Number(f.rage)||0));
  text(ctx,u.h.names[f.id],anchor,21,18,color,align,340);
  meter(ctx,x,31,300,12,f.max>0?f.hp/f.max:0,color,right);
  text(ctx,`HP  ${Math.max(0,Math.ceil(f.hp))} / ${f.max}`,anchor,60,12,'#c8d7e6',align,300);
  meter(ctx,x,72,300,7,rage/100,rage>=100?'#fff0a6':'#e7bf68',right);
  text(ctx,`ULT  ${Math.floor(rage)}%`,anchor,99,12,rage>=100?'#fff0a6':'#e7bf68',align,300);ctx.restore();
 }
 if(!drawBrandLogo(ctx,u.h.images?.()?.brand_logo))text(ctx,'DOWN ARENA',480,60,22,'#edce88','center',260);
 if(u.phase==='intro')text(ctx,`STARTS IN ${Math.max(1,Math.ceil(LIVE_TIMINGS.intro-u.age))}`,480,88,12,'#a8b6c5','center',190);
 ctx.restore();}
export function drawVoteMatchOverlay(ctx,u){if(!u.paused)return;ctx.save();ctx.fillStyle='#07101cbb';ctx.fillRect(0,0,960,540);text(ctx,'PAUSED',480,280,38,'#ffe0a0','center');ctx.restore();}
