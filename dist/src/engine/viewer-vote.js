import {drawEntrants} from './tournament.js';
import {LiveExhibition} from './live-exhibition.js';

export class ViewerVote{
 constructor(names,{seed='VOTE',round=1,exclude=[],limit=6,winnerCount=2}={}){
  limit=Math.max(2,Math.min(6,Math.floor(limit)||6));
  const all=Object.keys(names);if(all.length<2)throw new Error('Voting requires two fighters');
  const available=all.filter(id=>!exclude.includes(id));
  const pool=available.length>=2?available:all;
  // Rotate a stable catalog before selecting candidates: large rosters stay bounded.
  const ordered=drawEntrants(pool,seed+'-CATALOG'),offset=((round-1)*Math.min(limit,pool.length))%pool.length;
  this.ids=Array.from({length:Math.min(limit,pool.length)},(_,i)=>ordered[(offset+i)%pool.length]);
  this.winnerCount=Math.max(2,Math.min(this.ids.length,winnerCount));this.names=names;this.seed=seed;this.round=round;this.votes=new Map();this.locked=false;this.winners=null;
  this.tiebreak=drawEntrants(this.ids,seed+'-TIE-'+round);
 }
 cast(viewer,number){if(this.locked||typeof viewer!=='string'||!viewer.trim()||viewer.length>128)return false;
  const text=String(number).trim();if(!/^[1-6]$/.test(text))return false;
  const index=Number(text)-1;if(index>=this.ids.length)return false;
  this.votes.set(viewer.trim(),this.ids[index]);return true;
 }
 get rows(){const counts=new Map(this.ids.map(id=>[id,0]));for(const id of this.votes.values())counts.set(id,counts.get(id)+1);return this.ids.map((id,i)=>({id,number:i+1,name:this.names[id],count:counts.get(id)}));}
 reopen(){this.locked=false;this.winners=null;}
 lock(){if(this.locked)return this.winners;this.locked=true;this.winners=this.rows.sort((a,b)=>b.count-a.count||this.tiebreak.indexOf(a.id)-this.tiebreak.indexOf(b.id)).slice(0,this.winnerCount).map(r=>r.id);return [...this.winners];}
}
export class ViewerMatch extends LiveExhibition{
 constructor(names,pair,seed,settings={}){if(![2,4].includes(pair.length)||new Set(pair).size!==pair.length||pair.some(id=>!names[id]))throw new Error('Choose two or four distinct active fighters');super(names,seed,settings);this.size=pair.length/2;this.entries=[0,1].map(i=>({name:this.size===1?names[pair[i]]:'TEAM '+(i?'B':'A'),players:pair.slice(i*this.size,(i+1)*this.size),wins:0,damage:0,kos:0}));}
}
