export const VOTE_LAYOUT=Object.freeze({width:540,height:960,arenaY:328,arenaHeight:540*9/16});
function text(ctx,value,x,y,size,color='#e9eef5',align='left',width=490){ctx.fillStyle=color;ctx.font=`600 ${size}px Segoe UI,Arial`;ctx.textAlign=align;ctx.fillText(value,x,y,width);}
export function drawVoteBroadcast(ctx,u,scene){ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,540,960);const v=u.ballot;
 text(ctx,'DOWN ARENA',24,30,15,'#efc984');text(ctx,'DEMO · YOUTUBE CHAT NOT CONNECTED',516,30,10,'#f4bd66','right',360);
 text(ctx,v?.locked?'NEXT MATCH LOCKED':'CHOOSE THE NEXT FIGHTERS',24,68,22,'#fff0d3');
 const seconds=Math.ceil(v?.remaining??45);text(ctx,v?.locked?'LOCKED':`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`,516,68,22,'#7ddcfd','right',95);
 text(ctx,'SIMULATED VOTES · ONE VOTE PER VIEWER · CHANGE WITH A NEW NUMBER',24,89,9,'#aab8c8');
 const rows=v?.rows||[],total=v?.votes.size||0;
 for(const [i,row] of rows.entries()){
  const y=106+i*28,win=v?.winners?.includes(row.id),color=win?'#f3cd78':'#7bcee9';
  ctx.fillStyle=win?'#292318':'#111c28';ctx.fillRect(24,y,492,24);
  ctx.fillStyle=win?'#665025':'#1d5268';ctx.fillRect(24,y,492*(total?row.count/total:0),24);
  text(ctx,`${row.number}  ·  ${row.name}`,34,y+17,15,win?'#ffe2a0':'#eef5ff','left',390);
  text(ctx,String(row.count),506,y+17,14,color,'right',55);
 }
 const status=!v?'Start Live Arena to open voting.':u.paused?'PAUSED · TIMER FROZEN':v?.locked?`${u.h.names[v.winners[0]]}  VS  ${u.h.names[v.winners[1]]}`:'Demo numbers preview: 1–'+rows.length+' · top two advance';
 text(ctx,status,270,296,14,'#e9d6a0','center',492);
 text(ctx,v?.locked?(total?'Waiting for the current match to finish':'No votes: seeded random tiebreak'):'No live YouTube votes are being counted.',270,315,10,'#8e9eaf','center',492);
 if(scene&&u.active)ctx.drawImage(scene,0,VOTE_LAYOUT.arenaY,540,VOTE_LAYOUT.arenaHeight);else text(ctx,'START LIVE ARENA',270,490,23,'#8faac0','center');
 text(ctx,`MATCH ${u.matchNumber||1} · ${u.phase==='waiting'?'WAITING FOR NEXT MATCH':u.phase.toUpperCase()}`,270,659,11,'#7c91a5','center',492);
 // Keep the remaining lower area black for the operator's OBS layout.
 ctx.restore();}
export function drawVoteMatchHUD(ctx,u){ctx.save();ctx.fillStyle='#08111deb';ctx.fillRect(0,0,960,66);const fighters=u.h.duel().fighters;
 for(const [i,f] of fighters.entries()){text(ctx,u.h.names[f.id],i?936:24,25,17,i?'#ff98af':'#7cddff',i?'right':'left',340);const x=i?636:24;ctx.fillStyle='#ffffff22';ctx.fillRect(x,37,300,8);ctx.fillStyle=i?'#ff98af':'#7cddff';ctx.fillRect(x,37,300*Math.max(0,f.hp/f.max),8);text(ctx,`${Math.max(0,Math.ceil(f.hp))} / ${f.max}`,i?936:24,59,11,'#c8d7e6',i?'right':'left',300);}
 text(ctx,'VIEWER CHOICE · DEMO',480,23,12,'#f4d181','center',280);text(ctx,u.paused?'PAUSED':u.phase==='intro'?`STARTS IN ${Math.max(1,Math.ceil(5-u.age))}`:u.phase==='waiting'?'MATCH COMPLETE':'AI BATTLE',480,48,14,'#e9eef5','center',280);
 if(u.paused){ctx.fillStyle='#07101cbb';ctx.fillRect(0,66,960,474);text(ctx,'PAUSED',480,280,38,'#ffe0a0','center');}
 ctx.restore();}
