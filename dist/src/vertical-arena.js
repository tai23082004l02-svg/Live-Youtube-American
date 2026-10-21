import {liveCupEntrants} from './engine/live-exhibition.js';
import {LiveArenaUI,LIVE_TIMINGS} from './live-arena.js';
import {Tournament,drawEntrants} from './engine/tournament.js';
import {LiveExhibition} from './engine/live-exhibition.js';
import {Grandstand} from './render/grandstand.js';
import {drawVerticalArena} from './render/vertical-arena.js';

export const VERTICAL_RULES=Object.freeze({randomMatches:5,draftSeconds:8,blackFrom:720,width:540,height:960});
export class VerticalArenaUI extends LiveArenaUI{
 constructor(h){super(h);this.audience=new Grandstand(h.names,h.standLoader);this.cycle=1;this.exhibitionSerial=0;this.randomDone=0;this.segment='exhibition';}
 get portrait(){return this.$('mode').value==='live_vertical';}
 get live(){return this.portrait||super.live;}
 setView(value){super.setView(value);this.h.setPortraitView?.(!!value&&this.portrait);if(this.portrait)this.$('liveView').textContent=value?'Hiện bảng điều khiển (Esc)':'Mở màn hình Live 9:16';}
 battleConfig(){const config=super.battleConfig();return config&&this.portrait?{...config,arenaLayout:'portrait'}:config;}
 create(){if(!this.portrait)return super.create();
  if(!this.model){this.sessionSeed=Date.now().toString(36);this.cupNumber=0;this.completedCups=0;this.totalMatches=0;this.champions.clear();this.lastChampion=null;this.previousSpeed=this.$('speed').value;this.$('speed').value='1';this.h.unlock?.();this.cycle=1;this.exhibitionSerial=0;this.randomDone=0;this.audience.start(this.sessionSeed);}
  this.setView(true);return this.prepareExhibition();
 }
 showIntro(){super.showIntro();if(this.portrait)this.h.toggleBattle();}
 toggle(){if(!this.portrait||this.phase!=='intro')return super.toggle();this.paused=!this.paused;if(!this.h.duel().result)this.h.toggleBattle();this.update();}
 cachePortraits(){for(const e of this.model.entries)for(const id of e.players)if(!this.portraits.has(id)&&typeof Image==='function'){const im=new Image();im.src=this.h.portraitURL(id);this.portraits.set(id,im);}}
 prepareExhibition(){this.segment='exhibition';const seed=this.h.settings().seed+'-PORTRAIT-'+this.sessionSeed+'-'+ ++this.exhibitionSerial;this.model=new LiveExhibition(this.h.names,seed,this.h.settings());this.cachePortraits();this.phase='ready';this.age=0;this.paused=false;this.lastDraw=false;this.update();return this.next();}
 beginDraft(){this.segment='tournament';this.cupNumber++;const seed=this.h.settings().seed+'-PORTRAIT-CUP-'+this.sessionSeed+'-'+this.cupNumber;const entries=liveCupEntrants(this.h.names,seed);this.model=new Tournament(entries,{...this.h.settings(),seed,format:'single'});this.cachePortraits();this.phase='draft';this.age=0;this.lastDraw=false;this.h.stop();this.update();}
 frame(dt){if(!this.portrait)return super.frame(dt);if(!this.active||this.paused)return;this.audience.tick(dt);this.age+=dt;
  if(this.phase==='intro'&&this.age>=LIVE_TIMINGS.intro){this.phase='battle';this.age=0;this.update();}
  else if(this.phase==='battle'&&this.h.duel().result&&this.h.resultAge()>=LIVE_TIMINGS.victory){const d=this.h.duel(),m=this.model.current,won=this.model.record(d.result,d.fighters);this.totalMatches++;this.age=0;this.lastDraw=!won;
   if(this.segment==='exhibition'){this.randomDone++;this.phase='waiting';this.lastWinner=won?this.model.entries[m.winner].name:'DRAW';}
   else{this.phase=this.model.champion===null?'waiting':'complete';if(this.phase==='complete'){this.completedCups++;const e=this.model.entries[this.model.champion],id=e.players[0];this.champions.set(id,(this.champions.get(id)||0)+1);this.lastChampion=e.name;}}
   this.update();
  }
  else if(this.phase==='waiting'&&this.age>=LIVE_TIMINGS.waiting){if(this.segment==='exhibition'){if(this.randomDone>=VERTICAL_RULES.randomMatches)this.beginDraft();else this.prepareExhibition();}else this.next();}
  else if(this.phase==='draft'&&this.age>=VERTICAL_RULES.draftSeconds){this.phase='ready';this.next();}
  else if(this.phase==='complete'&&this.age>=LIVE_TIMINGS.champion){this.randomDone=0;this.cycle++;this.prepareExhibition();}
 }
 update(){super.update();this.$('liveAspect').textContent=this.portrait?'9:16':'16:9';this.$('liveDescription').textContent=this.portrait?'6 khách trên khán đài đổi mỗi 60 giây. Tự bốc 1vs1 / 2vs2 / 5vs5; sau 5 trận mở giải 8 suất. Dưới cùng 25% màu đen. Chưa kết nối bình chọn YouTube, không quảng cáo.':'8 nhân vật ngẫu nhiên → 7 trận → nhà vô địch → tự mở giải mới. Dùng chỉ số, hệ số HP và kích thước sàn hiện tại. Chế độ này chỉ chạy game, chưa phát lên YouTube.';if(!this.portrait)return;this.$('liveNotice').textContent=this.active?`Chu kỳ ${this.cycle||1} · ${this.segment==='tournament'?'Giải đấu '+this.cupNumber:'Trận ngẫu nhiên '+Math.min(5,(this.randomDone||0)+1)+'/5'} · bình chọn YouTube chưa kết nối`:'Dọc 9:16 · khán đài 6 khách / 60s · 5 trận ngẫu nhiên → giải 8 suất · không quảng cáo';}
 draw(ctx,clock){if(!this.portrait)return super.draw(ctx,clock);}
 present(ctx,scene,dialogue,reduced=false){drawVerticalArena(ctx,this,scene,dialogue,reduced);}
 leave(){this.audience?.stop();super.leave();}
}
