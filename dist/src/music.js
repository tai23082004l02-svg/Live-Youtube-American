export const MUSIC_TRACKS={limit_break:{name:'Down Arena — Limit Break',url:'assets/audio/music/Down_Arena_Limit_Break_Loop.ogg'},godbreaker:{name:'Down Arena — Godbreaker',url:'assets/audio/music/Down_Arena_Godbreaker_Loop.ogg'}};
export class ArenaMusic{
 constructor({track='random',volume=.18,factory=url=>typeof window.Audio==='function'?new window.Audio(url):null}={}){this.factory=factory;this.audio=null;this.track=track==='random'||MUSIC_TRACKS[track]?track:'off';this.volume=.18;this.setVolume(volume);this.want=false;this.pending=false;this.blocked=false;this.epoch=0;}
 unlock(){this.blocked=false;}
 setVolume(value){const n=Number(value);this.volume=Number.isFinite(n)?Math.max(0,Math.min(1,n)):.18;if(this.audio)this.audio.volume=this.volume*(this.ducked?.3:1);}
 setTrack(value){const track=value==='random'||MUSIC_TRACKS[value]?value:'off';if(track===this.track)return;this.reset();if(this.audio){this.audio.removeAttribute?.('src');this.audio.load?.();}this.audio=null;this.track=track;this.blocked=false;}
 pause(){this.want=false;if(this.audio&&!this.audio.paused)this.audio.pause();}
 reset(){this.pause();this.epoch++;this.pending=false;this.blocked=false;if(this.audio)try{this.audio.currentTime=0;}catch{}}
 update(d,running){this.lastDuel=d;this.want=!!running&&!d.result&&this.track!=='off';this.ducked=!!(d.personalUltimate?.cinematic||d.teamUltimate?.cinematic);if(!this.want){this.pause();return;}if(this.blocked)return;
  if(!this.audio){const pool=Object.keys(MUSIC_TRACKS).filter(id=>id!==this.currentTrack);this.currentTrack=this.track==='random'?pool[Math.floor(Math.random()*pool.length)]:this.track;this.audio=this.factory(MUSIC_TRACKS[this.currentTrack].url);if(!this.audio){this.blocked=true;return;}this.audio.loop=this.track!=='random';this.audio.preload='auto';const playing=this.audio;this.audio.onended=()=>{if(this.audio!==playing||this.track!=='random')return;const resume=this.want;this.epoch++;this.pending=false;playing.onended=null;this.audio=null;this.update(this.lastDuel,resume);};}
  const target=this.volume*(this.ducked?.3:1);this.audio.volume=Math.max(0,Math.min(1,target));
  if(this.pending||!this.audio.paused)return;const audio=this.audio,epoch=this.epoch;this.pending=true;
  try{Promise.resolve(audio.play()).then(()=>{if(epoch===this.epoch&&!this.want)audio.pause();}).catch(()=>{if(epoch===this.epoch)this.blocked=true;}).finally(()=>{if(epoch===this.epoch)this.pending=false;});}catch{this.pending=false;this.blocked=true;}
 }
}
