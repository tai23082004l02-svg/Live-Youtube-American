import {YouTubeChatBridge} from './youtube-chat.js';
import {VerticalArenaUI} from './vertical-arena.js';
import {TournamentUI} from './tournament-ui.js';
import {ViewerVote,ViewerMatch} from './engine/viewer-vote.js';
import {drawEntrants} from './engine/tournament.js';
import {LIVE_TIMINGS} from './live-arena.js';
import {drawVoteBroadcast,drawVoteMatchOverlay} from './render/viewer-vote.js?v=20261022-live-hp5-subscribe-r2';

export class VotingArenaUI extends VerticalArenaUI{
 constructor(h){super(h);this.matchNumber=0;this.voteRound=0;this.demoAge=0;this.demoSerial=0;this.ballot=null;this.chat=new YouTubeChatBridge(this);
  this.$('voteTouchControls').onclick=()=>this.setView(false);
  this.$('voteDemoAuto').checked=!this.chat.enabled;this.$('voteTestViewer').value='operator-preview';
  this.$('voteTestCast').onclick=()=>{if(this.h.duel().result)this.ballot?.lock();const accepted=!this.chat.enabled&&!this.paused&&!['loading','error'].includes(this.phase)&&this.ballot?.cast(this.$('voteTestViewer').value,this.$('voteTestNumber').value);this.$('voteTestStatus').textContent=accepted?'Đã ghi phiếu thử; cùng ID sẽ đổi phiếu cũ.':'Chưa mở lượt hoặc lựa chọn không hợp lệ.';};
 }
 get voteMode(){return this.$('mode').value==='live_vote';}
 get live(){return this.voteMode||super.live;}
 setView(value){super.setView(value);this.h.setVoteView?.(!!value&&this.voteMode);if(this.voteMode)this.$('liveView').textContent=value?'Hiện bảng điều khiển (Esc)':'Mở bình chọn 9:16 / sàn ngang';}
 create(){if(!this.voteMode)return super.create();if(this.model)return;
  this.sessionSeed=Date.now().toString(36);this.previousSpeed=this.$('speed').value;this.$('speed').value='1';this.h.unlock?.();this.matchNumber=0;this.voteRound=0;this.totalMatches=0;
  const pair=drawEntrants(Object.keys(this.h.names),this.sessionSeed).slice(0,2);return this.prepareMatch(pair);
 }
 prepareMatch(pair){this.matchNumber++;const seed=this.h.settings().seed+'-VIEWER-'+this.sessionSeed+'-'+this.matchNumber;
  this.model=new ViewerMatch(this.h.names,pair,seed,this.h.settings());
  this.ballot=new ViewerVote(this.h.names,{seed:this.sessionSeed,round:++this.voteRound,exclude:pair,limit:10,winnerCount:2});this.demoAge=0;this.demoSerial=0;this.votePageAge=0;
  this.$('voteTestNumber').innerHTML=this.ballot.rows.map(r=>`<option value="${r.number}">${r.number} · ${r.name}</option>`).join('');this.$('voteTestNumber').value='1';this.$('voteTestStatus').textContent='';
  this.phase='ready';this.age=0;this.paused=false;this.setView(true);this.update();return this.next();
 }
 async next(){if(!this.voteMode)return super.next();try{await TournamentUI.prototype.next.call(this);if(this.active&&this.voteMode&&this.phase==='ready')this.phase='error';}catch{if(this.active&&this.voteMode)this.phase='error';}this.update();}
 frame(dt){if(!this.voteMode)return super.frame(dt);if(this.chat?.enabled)this.chat.tick(dt);if(!this.active||this.paused||['loading','error'].includes(this.phase))return;
  this.age+=dt;this.votePageAge=(this.votePageAge||0)+dt;
  if(this.h.duel().result){this.lastDraw=this.h.duel().result==='draw';this.ballot.lock();}
  if(!this.ballot.locked){
   if(!this.chat?.enabled&&this.$('voteDemoAuto').checked){this.demoAge+=dt;while(this.demoAge>=.8){this.demoAge-=.8;const n=++this.demoSerial;this.ballot.cast('demo-'+n%23,drawEntrants(this.ballot.rows.map(r=>r.number),this.sessionSeed+'-'+this.voteRound+'-'+n)[0]);}}
  }
  if(this.phase==='intro'&&this.age>=LIVE_TIMINGS.intro){this.phase='battle';this.age=0;this.h.toggleBattle();this.update();}
  else if(this.phase==='battle'&&this.h.duel().result&&this.h.resultAge()>=LIVE_TIMINGS.victory){const d=this.h.duel();this.lastDraw=!this.model.record(d.result,d.fighters);this.totalMatches++;this.phase='waiting';this.age=0;this.update();}
  else if(this.phase==='waiting'&&this.age>=LIVE_TIMINGS.waiting){if(this.lastDraw){this.ballot.reopen();this.next();}else if(this.ballot.locked)this.prepareMatch(this.ballot.winners);}
 }
 update(){super.update();this.$('voteControls').hidden=!this.voteMode;if(!this.voteMode)return;
  this.$('liveAspect').textContent='9:16 / sàn 16:9';this.$('liveDescription').textContent='Bảng tên 1–10 phía trên, mỗi trang 5 nhân vật đổi sau 5 giây, trận ngang ở giữa, phần dưới đen. Phiếu mô phỏng; chưa kết nối chat YouTube. Bình chọn đến khi trận hiện tại kết thúc, hai người nhiều phiếu nhất đấu 1vs1 tiếp; hòa chọn ngẫu nhiên theo seed.';
  if(this.chat?.enabled){this.$('voteControls').querySelector('h2').textContent='Bình chọn · YouTube Live';this.$('voteControls').querySelector('p').textContent='Nhận bình luận số qua công cụ YouTube Chat chạy tại máy OBS. Chỉ người đăng ký được chat cần bật trong YouTube Studio.';this.$('voteDemoAuto').checked=false;this.$('voteDemoAuto').disabled=true;this.$('voteTestCast').disabled=true;this.$('liveDescription').textContent='Bình chọn bằng chat YouTube: mỗi tài khoản một phiếu, gửi số khác để đổi. Khóa phiếu khi trận kết thúc; hai nhân vật nhiều phiếu nhất đấu 1vs1 tiếp.';}
  this.$('liveNotice').textContent=this.chat?.enabled?this.chat.status:this.active?`Trận ${this.matchNumber||1} · ${this.totalMatches||0} trận xong · PHIẾU MÔ PHỎNG`:'Chọn Bắt đầu Live Arena để mở bảng bình chọn thử.';
 }
 draw(ctx,clock){if(!this.voteMode)return super.draw(ctx,clock);if(this.active)drawVoteMatchOverlay(ctx,this);}
 presentVotes(ctx,scene){drawVoteBroadcast(ctx,this,scene);}
 leave(){super.leave();this.ballot=null;this.matchNumber=0;this.voteRound=0;}
}
