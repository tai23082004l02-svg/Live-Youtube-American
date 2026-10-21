// Decisions only: never shorten cooldowns, cancel active casts or add damage.
const free=f=>['idle','run'].includes(f.state);
const enemy=(d,f,uid)=>d.fighters.find(t=>t.uid===uid&&t.hp>0&&d.isEnemy(f,t));
export function defenseOpportunity(d,f,source){f.counterThreatUid=source.uid;f.counterOpportunityUntil=d.tick+45;}
export function finishStyleAction(d,f,previous){if(!['idle','run','defeat','transform'].includes(previous)&&f.state==='idle')f.comboOpportunityUntil=d.tick+30;}
export function prepareStyleTarget(d,f){
 if(!free(f)||f.think>1/60)return;
 const living=d.fighters.filter(t=>t.hp>0&&d.isEnemy(f,t));if(!living.length)return;
 const nearest=living.reduce((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)<=Math.hypot(b.x-f.x,b.y-f.y)?a:b);
 let current=enemy(d,f,f.aiTargetUid)||nearest;
 if(d.tick>=(f.targetReviewTick||0)){f.targetReviewTick=d.tick+36;
  const attacker=d.tick-(f.lastAttackedTick??-9999)<90?enemy(d,f,f.lastAttackerUid):null;
  const next=attacker||nearest;if(next!==current&&d.roll(f.targetSwitchChance)){current=next;d.event('targetSwitch',f,{targetUid:next.uid});}
 }
 f.aiTargetUid=current.uid;
}
export function decideFightingStyle(d,f,o){
 let pressure=false;
 if(f.counterOpportunityUntil>=d.tick){f.counterOpportunityUntil=0;if(d.roll(f.counterChance)){const t=enemy(d,f,f.counterThreatUid);if(t){f.aiTargetUid=t.uid;f.pressureUntil=d.tick+60;f.chainUntil=d.tick+30;pressure=true;d.event('counterReady',f,{targetUid:t.uid});}}}
 if(f.comboOpportunityUntil>=d.tick){f.comboOpportunityUntil=0;if(d.roll(f.comboChance)){f.chainUntil=d.tick+30;pressure=true;d.event('comboReady',f);}}
 if(f.lastLandedTick!==undefined&&f.pursuitCheckedTick!==f.lastLandedTick&&d.tick-f.lastLandedTick<=60){f.pursuitCheckedTick=f.lastLandedTick;const t=enemy(d,f,f.lastLandedUid);if(t&&Math.hypot(t.x-f.x,t.y-f.y)>90&&d.roll(f.pursuitChance)){f.aiTargetUid=t.uid;f.pressureUntil=d.tick+72;pressure=true;d.event('pursuit',f,{targetUid:t.uid});}}
 if(pressure||d.tick<(f.pressureUntil||0)||d.tick<(f.chainUntil||0)){f.tactic='approach';f.tacticLeft=Math.max(f.tacticLeft,.3);}
 else if((f.aggression<100||f.hp/f.max<.4)&&f.tacticLeft===0){f.tacticLeft=.8+d.rand()*.8;
  f.tactic=f.hp/f.max<.4?(d.roll(f.recklessness)?'approach':'retreat'):d.roll(f.aggression)?'approach':d.rand()<.65?'orbit':'retreat';
 }
}
