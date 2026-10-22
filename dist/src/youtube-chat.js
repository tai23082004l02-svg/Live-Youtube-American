// Credentials stay in the local bridge; the renderer receives only numeric votes.
export class YouTubeChatBridge {
 constructor(ui){this.ui=ui;this.enabled=/(?:^|[?&])chat=1(?:&|$)/.test(globalThis.location?.search||'');this.busy=false;this.elapsed=0;this.status='Waiting for YouTube connection';}
 async tick(dt){if(!this.enabled||this.busy)return;this.elapsed+=dt;if(this.elapsed<1)return;this.elapsed=0;this.busy=true;
  const u=this.ui,ballot=u.ballot,round=`${u.sessionSeed}:${u.voteRound}`;
  try{const response=await fetch('/api/votes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({round,open:!!ballot&&!ballot.locked&&!u.paused&&['intro','battle'].includes(u.phase),choices:ballot?.ids.length||0})});if(!response.ok)throw new Error('Local bridge unavailable');const data=await response.json();this.status=data.status;
   if(ballot===u.ballot&&!ballot.locked&&!u.paused&&['intro','battle'].includes(u.phase))for(const vote of data.votes||[])if(vote.round===round)ballot.cast(vote.viewer,String(vote.number));
  }catch{this.status='YouTube bridge disconnected';}finally{this.busy=false;}
 }
}
