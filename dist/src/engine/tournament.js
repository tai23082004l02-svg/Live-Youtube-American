import {CHARACTERS} from '../characters/index.js';
export const ROUND_NAMES=['QUARTERFINALS','SEMIFINALS','FINAL'];
export function drawEntrants(entries,seed){let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;const out=[...entries];for(let i=out.length-1;i>0;i--){n^=n<<13;n^=n>>>17;n^=n<<5;const j=(n>>>0)%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
export class Tournament{
 constructor(entries,settings={}){
  if(entries.length!==8)throw new Error('Choose exactly 8 entrants.');
  const teams=settings.format==='teams';
  this.entries=entries.map((e,i)=>{if(!Array.isArray(e.players)||e.players.length<1||e.players.length>(teams?5:1)||e.players.some(id=>!CHARACTERS[id]))throw new Error('Invalid tournament roster.');return {id:i,name:String(e.name||'Entrant '+(i+1)).slice(0,32),players:[...e.players],damage:0,kos:0,wins:0};});
  this.settings=JSON.parse(JSON.stringify(settings));this.matches=Array.from({length:7},(_,i)=>({index:i,round:i<4?0:i<6?1:2,entrants:i<4?[i*2,i*2+1]:[null,null],winner:null,result:null,replays:0}));this.champion=null;
 }
 get current(){return this.matches.find(m=>m.winner===null&&m.entrants.every(id=>id!==null))||null;}
 battleConfig(){const m=this.current;if(!m)return null;const [a,b]=m.entrants.map(id=>this.entries[id]);return {...this.settings,seed:(this.settings.seed||'CUP')+'-M'+(m.index+1)+'-R'+m.replays,pair:[...a.players,...b.players],teams:[...a.players.map(()=>'A'),...b.players.map(()=>'B')],teamUltimateEnabled:this.settings.format==='teams'&&this.settings.teamUltimateEnabled!==false};}
 record(result,fighters=[]){const m=this.current;if(!m)throw new Error('Tournament is complete.');if(result==='draw'){m.replays++;return false;}if(!['teamA','teamB'].includes(result))throw new Error('Invalid tournament result.');
  const side=result==='teamA'?0:1;m.result=result;m.winner=m.entrants[side];this.entries[m.winner].wins++;
  for(const [i,team] of ['A','B'].entries()){const entry=this.entries[m.entrants[i]],members=fighters.filter(f=>f.team===team);entry.damage+=members.reduce((n,f)=>n+f.damage,0);entry.kos+=fighters.filter(f=>f.team!==team&&f.hp<=0).length;}
  if(m.index===6)this.champion=m.winner;else{const parent=m.index<4?4+Math.floor(m.index/2):6;this.matches[parent].entrants[m.index%2]=m.winner;}return true;
 }
}
