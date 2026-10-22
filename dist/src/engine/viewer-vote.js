import {drawEntrants} from './tournament.js';
import {LiveExhibition} from './live-exhibition.js';

export const VOTE_SECONDS=45;
export class ViewerVote{
 constructor(names,{seed='VOTE',round=1,exclude=[],seconds=VOTE_SECONDS,limit=6}={}){
  limit=Math.max(2,Math.min(6,Math.floor(limit)||6));if(!Number.isFinite(seconds)||seconds<=0)throw new Error('Invalid vote duration');
  const all=Object.keys(names);if(all.length<2)throw new Error('Voting requires two fighters');
  const available=all.filter(id=>!exclude.includes(id));
  const pool=available.length>=2?available:all;
  // Rotate a stable catalog before selecting candidates: large rosters stay bounded.
  const ordered=drawEntrants(pool,seed+'-CATALOG'),offset=((round-1)*Math.min(limit,pool.length))%pool.length;
  this.ids=Array.from({length:Math.min(limit,pool.length)},(_,i)=>ordered[(offset+i)%pool.length]);
  this.names=names;this.seed=seed;this.round=round;this.remaining=seconds;this.votes=new Map();this.locked=false;this.winners=null;
  this.tiebreak=drawEntrants(this.ids,seed+'-TIE-'+round);
 }
 cast(viewer,number){if(this.locked||typeof viewer!=='string'||!viewer.trim()||viewer.length>128)return false;
  const text=String(number).trim();if(!/^[1-6]$/.test(text))return false;
  const index=Number(text)-1;if(index>=this.ids.length)return false;
  this.votes.set(viewer.trim(),this.ids[index]);return true;
 }
 get rows(){const counts=new Map(this.ids.map(id=>[id,0]));for(const id of this.votes.values())counts.set(id,counts.get(id)+1);return this.ids.map((id,i)=>({id,number:i+1,name:this.names[id],count:counts.get(id)}));}
 tick(dt){if(this.locked||!Number.isFinite(dt)||dt<=0)return;this.remaining=Math.max(0,this.remaining-dt);if(this.remaining===0)this.lock();}
 lock(){if(this.locked)return this.winners;this.locked=true;this.remaining=0;this.winners=this.rows.sort((a,b)=>b.count-a.count||this.tiebreak.indexOf(a.id)-this.tiebreak.indexOf(b.id)).slice(0,2).map(r=>r.id);return [...this.winners];}
}
export class ViewerMatch extends LiveExhibition{
 constructor(names,pair,seed,settings={}){if(pair.length!==2||pair[0]===pair[1]||pair.some(id=>!names[id]))throw new Error('Choose two distinct active fighters');super(names,seed,settings);this.size=1;this.entries=pair.map(id=>({name:names[id],players:[id],wins:0,damage:0,kos:0}));}
}
