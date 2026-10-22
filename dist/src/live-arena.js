import {liveCupEntrants} from './engine/live-exhibition.js';
import {drawTitle} from './render/titles.js';
import {TournamentUI} from './tournament-ui.js';
import {Tournament,drawEntrants,ROUND_NAMES} from './engine/tournament.js';

export const LIVE_TIMINGS=Object.freeze({intro:1,victory:1.2,waiting:0,champion:0});

// Reuse bracket rules, loading guards and battle configuration from TournamentUI.
export class LiveArenaUI extends TournamentUI{
 constructor(h){super(h);this.cupNumber=0;this.completedCups=0;this.totalMatches=0;this.champions=new Map();this.portraits=new Map();this.sessionSeed=Date.now().toString(36);this.clean=false;
  this.$('liveStart').onclick=()=>this.active?this.toggle():this.create();
  this.$('liveView').onclick=()=>this.setView(!this.clean);
  this.$('liveRetry').onclick=()=>this.next();
  this.$('liveStop').onclick=()=>{this.leave();this.h.reset();};
  this.update();
 }
 get live(){return this.$('mode').value==='live';}
 isMode(){return this.live||super.isMode();}
 setView(value){this.clean=!!value;this.h.setLiveView?.(this.clean);this.$('liveView').textContent=this.clean?'Hiện bảng điều khiển (Esc)':'Mở màn hình Live 16:9';}
 create(){if(!this.live)return super.create();
  if(!this.model){this.sessionSeed=Date.now().toString(36);this.cupNumber=0;this.completedCups=0;this.totalMatches=0;this.champions.clear();this.lastChampion=null;this.h.unlock?.();this.previousSpeed=this.$('speed').value;this.$('speed').value='1';}
  this.cupNumber++;const seed=this.h.settings().seed+'-LIVE-'+this.sessionSeed+'-'+this.cupNumber;
  const entries=liveCupEntrants(this.h.names,seed);
  this.model=new Tournament(entries,{...this.h.settings(),seed,format:'single'});this.phase='ready';this.paused=false;this.age=0;
  for(const e of entries)if(!this.portraits.has(e.players[0])&&typeof Image==='function'){const im=new Image();im.src=this.h.portraitURL(e.players[0]);this.portraits.set(e.players[0],im);}
  this.setView(true);this.update();return this.next();
 }
 async next(){if(!this.live)return super.next();
  try{await super.next();if(this.active&&this.live&&this.phase==='ready'){this.phase='error';this.$('overlay').style.display='none';this.update();}}
  catch{if(this.active&&this.live){this.phase='error';this.update();}}
 }
 showIntro(){if(!this.live)return super.showIntro();this.$('overlay').style.display='none';}
 toggle(){if(!this.live)return super.toggle();if(!this.model)return this.create();if(['loading','error'].includes(this.phase))return;
  this.paused=!this.paused;if(this.phase==='battle'&&!this.h.duel().result)this.h.toggleBattle();this.update();
 }
 frame(dt){if(!this.live)return super.frame(dt);if(!this.active||this.paused)return;this.age+=dt;
  if(this.phase==='intro'&&this.age>=LIVE_TIMINGS.intro){this.phase='battle';this.age=0;this.h.toggleBattle();this.update();}
  else if(this.phase==='battle'&&this.h.duel().result&&this.h.resultAge()>=LIVE_TIMINGS.victory){
   const d=this.h.duel(),m=this.model.current,won=this.model.record(d.result,d.fighters);this.totalMatches++;this.lastDraw=!won;this.age=0;
   this.phase=this.model.champion===null?'waiting':'complete';
   if(this.phase==='complete'){this.completedCups++;const e=this.model.entries[this.model.champion],id=e.players[0];this.champions.set(id,(this.champions.get(id)||0)+1);this.lastChampion=e.name;}
   this.$('overlay').style.display='none';this.update();
  }
  else if(this.phase==='waiting'&&this.age>=LIVE_TIMINGS.waiting)this.next();
  else if(this.phase==='complete'&&this.age>=LIVE_TIMINGS.champion)this.create();
 }
 leave(){this.setView(false);if(this.previousSpeed!==undefined){this.$('speed').value=this.previousSpeed;this.previousSpeed=undefined;}this.$('speed').disabled=false;super.leave();}
  update(){super.update();const $=this.$,live=this.live;$('livePanel').hidden=!live;if(!live)return;
  $('tournamentPanel').hidden=true;$('liveRetry').hidden=this.phase!=='error';$('liveView').disabled=!this.active;$('liveStop').disabled=!this.active;
  $('speed').disabled=this.active;$('liveStart').disabled=['loading','error'].includes(this.phase);
  $('liveStart').textContent=!this.active?'▶ Bắt đầu Live Arena':this.paused?'▶ Tiếp tục':'Ⅱ Tạm dừng';
  $('liveNotice').textContent=this.active?`Giải ${this.cupNumber||1} · ${this.totalMatches||0} trận đã xong · ${this.completedCups||0} giải hoàn tất`:'8 nhân vật · 7 trận · tự bốc giải mới · tốc độ 1×';
  $('start').disabled=this.active&&['loading','error'].includes(this.phase);
 }
 draw(ctx,clock){if(!this.live)return super.draw(ctx,clock);if(!this.active)return;const m=this.model.current;
  drawLiveHUD(ctx,this, m);
  if(this.phase==='intro')drawIntro(ctx,this,m);
  else if(['waiting','complete'].includes(this.phase))drawIntermission(ctx,this);
  else if(['loading','error'].includes(this.phase)){panel(ctx);label(ctx,this.phase==='error'?'ASSET LOAD FAILED':'PREPARING THE ARENA',480,235,30,'#ffe4a4');label(ctx,this.phase==='error'?'Press Esc, then Retry loading to continue.':'Loading the next fighters…',480,285,17,'#b9cfdf');}
  if(this.paused){ctx.save();ctx.fillStyle='#07101cd9';ctx.fillRect(0,0,960,540);label(ctx,'PAUSED',480,250,45,'#ffe3a3');label(ctx,'Press Space to resume',480,292,17,'#c2d9e6');ctx.restore();}
 }
}
function label(ctx,text,x,y,size=14,color='#edf5ff',align='center',width=900){if(align==='center'&&drawTitle(ctx,text,x,y-size*.35,Math.min(width,size*12),size*1.7))return;ctx.fillStyle=color;ctx.textAlign=align;ctx.font=`${size>=24?'900':'600'} ${size}px Segoe UI`;ctx.fillText(text,x,y,width);}
function panel(ctx){ctx.fillStyle='#07101cf2';ctx.fillRect(0,0,960,540);const g=ctx.createLinearGradient(0,0,960,540);g.addColorStop(0,'#14455d66');g.addColorStop(1,'#542b4d44');ctx.fillStyle=g;ctx.fillRect(0,0,960,540);}
function drawLiveHUD(ctx,u,m){ctx.save();ctx.fillStyle='#08111dee';ctx.fillRect(0,0,960,78);const fs=u.h.duel().fighters;
 for(const [i,team] of ['A','B'].entries()){const f=fs.find(f=>f.team===team),x=i?636:24,color=i?'#ff8da5':'#7cddff';if(!f)continue;label(ctx,u.h.names[f.id],i?936:24,28,14,color,i?'right':'left',300);ctx.fillStyle='#ffffff18';ctx.fillRect(x,42,300,8);ctx.fillStyle=color;ctx.fillRect(x,42,300*Math.max(0,f.hp/f.max),8);label(ctx,`${Math.max(0,Math.ceil(f.hp))} / ${f.max}`,i?936:24,65,10,'#c8d7e6',i?'right':'left');}
 label(ctx,`LIVE ARENA / CUP ${u.cupNumber}`,480,21,10,'#f5d78e', 'center',285);label(ctx,m?ROUND_NAMES[m.round]: 'CHAMPIONSHIP',480,42,14,'#fff4d9','center',285);label(ctx,m?`MATCH ${m.index+1} OF 7`:'TOURNAMENT COMPLETE',480,63,10,'#a2b8cc','center',285);
 ctx.fillStyle='#08111df2';ctx.fillRect(0,527,960,13);const next=nextPair(u);label(ctx,'DOWN ARENA  /  AI BATTLES',12,537,8,'#9bc5dd','left',230);label(ctx,next?`UP NEXT: ${next}`:`NEXT CUP: NEW RANDOM LINEUP`,480,537,8,'#dce6f2','center',450);label(ctx,u.lastChampion?`LAST CHAMPION: ${u.lastChampion}`:'8 FIGHTERS / ONE CHAMPION',948,537,8,'#efcf89','right',240);ctx.restore();}
function nextPair(u){const current=u.model.current,next=u.model.matches.find(m=>m!==current&&m.winner===null&&m.entrants.every(id=>id!==null));const m=['waiting','intro'].includes(u.phase)?current:next;return m?m.entrants.map(id=>u.model.entries[id].name).join(' VS '):null;}
function drawIntro(ctx,u,m){ctx.save();panel(ctx);label(ctx,`CUP ${u.cupNumber} / ${ROUND_NAMES[m.round]} / MATCH ${m.index+1}`,480,65,14,'#e8c982');
 const entries=m.entrants.map(id=>u.model.entries[id]);for(const [i,e] of entries.entries()){const x=i?725:235,color=i?'#ff839e':'#6edcff',im=u.portraits.get(e.players[0]);ctx.fillStyle=color+'18';ctx.fillRect(x-100,130,200,200);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(x-100,130,200,200);if(im?.complete&&im.naturalWidth)ctx.drawImage(im,x-85,145,170,170);label(ctx,e.name,x,375,27,color,'center',380);}
 label(ctx,'VS',480,250,70,'#ffe092');label(ctx,`BATTLE STARTS IN ${Math.max(1,Math.ceil(LIVE_TIMINGS.intro-u.age))}`,480,455,19,'#ecf4ff');label(ctx,'SINGLE ELIMINATION / NO TIME LIMIT',480,490,11,'#9fb7c9');ctx.restore();}
function drawIntermission(ctx,u){ctx.save();panel(ctx);const champion=u.phase==='complete',e=champion?u.model.entries[u.model.champion]:null;
 label(ctx,champion?'CHAMPION':u.lastDraw?'DRAW / REMATCH':`NEXT MATCH IN ${Math.max(1,Math.ceil(LIVE_TIMINGS.waiting-u.age))}`,480,56,32,'#ffdf8a');
 const m=u.model.current;label(ctx,champion?e.name:m.entrants.map(id=>u.model.entries[id].name).join('  VS  '),480,103,25,'#eef7ff','center',870);
 label(ctx,champion?`NEXT CUP IN ${Math.max(1,Math.ceil(LIVE_TIMINGS.champion-u.age))} / ${u.champions.get(e.players[0])} TITLES THIS SESSION`:'THE ROAD TO THE CHAMPIONSHIP',480,135,12,'#9ec4db');
 for(let round=0;round<3;round++){const x=25+round*315;label(ctx,ROUND_NAMES[round],x+140,180,11,'#d5ba7b');const matches=u.model.matches.filter(m=>m.round===round);for(const [i,match] of matches.entries()){const y=round===0?200+i*75:round===1?235+i*150:310;ctx.fillStyle=match===m?'#1a344b':'#102134';ctx.fillRect(x,y,280,62);ctx.strokeStyle=match===m?'#65d5ff':'#3b5368';ctx.lineWidth=1;ctx.strokeRect(x,y,280,62);for(const [j,id] of match.entrants.entries()){const name=id===null?'TBD':u.model.entries[id].name;label(ctx,(id!==null&&match.winner===id?'★ ':'')+name,x+12,y+23+j*24,12,id!==null&&match.winner===id?'#ffe099':'#c2d4e3','left',255);}}}
 ctx.restore();}
