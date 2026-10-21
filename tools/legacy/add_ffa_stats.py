from pathlib import Path
p=Path('down-arena/dist/sim.js');s=p.read_text(encoding='utf-8');s="import {normalizeStats} from './config.js';\n"+s;s=s.replace("pair=['goku','vegeta']){if(pair.length!==2||pair[0]===pair[1]", "pair=['goku','vegeta'],stats={}){if(![2,3].includes(pair.length)||new Set(pair).size!==pair.length")
s=s.replace("this.seed=seed;", "this.config=normalizeStats(stats);this.mode=pair.length===3?'ffa':'duel';this.seed=seed;",1)
s=s.replace("}));}", "}));for(const [i,f] of this.fighters.entries()){const cfg=this.config[f.id];Object.assign(f,{hp:cfg.hp,max:cfg.hp,speed:cfg.speed,melee:cfg.melee,skillPower:cfg.skillPower,cooldownFactor:cfg.cooldown/100,deathTick:null,targetId:null});if(pair.length===3){const angle=Math.PI+i*Math.PI*2/3+(swap?Math.PI:0);f.x=480+250*Math.cos(angle);f.y=280+155*Math.sin(angle);f.face=f.x<480?1:-1;}for(const key of ['beamCd','teleportCd','kaiokenCd','volleyCd','finalCd','rushCd','waveCd','roarCd'])f[key]*=f.cooldownFactor;}}",1)
s=s.replace(" rand(){", " pickTarget(f){return this.fighters.filter(o=>o!==f&&o.hp>0).reduce((best,o)=>!best||Math.hypot(o.x-f.x,o.y-f.y)<Math.hypot(best.x-f.x,best.y-f.y)?o:best,null);}\n rand(){",1)
s=s.replace("const o=this.fighters.find(o=>o!==f);", "const o=this.pickTarget(f);")
s=s.replace("this.event(state,f);}", "const cdKey=({melee:'cd',beam:'beamCd',dash:'dashCd',teleport:'teleportCd',kaioken:'kaiokenCd',volley:'volleyCd',final:'finalCd',rush:'rushCd',wave:'waveCd',roar:'roarCd'})[state];if(cdKey)f[cdKey]*=f.cooldownFactor;this.event(state,f);}")
s=s.replace("for(let i=0;i<2;i++){const f=this.fighters[i],o=this.fighters[1-i];", "for(let i=0;i<this.fighters.length;i++){const f=this.fighters[i];if(f.hp<=0)continue;const o=this.pickTarget(f);if(!o)continue;f.targetId=o.id;")
s=s.replace("if(d<150)hits.push({target:o,source:f,value:160});", "for(const target of this.fighters)if(target!==f&&target.hp>0&&Math.hypot(target.x-f.x,target.y-f.y)<150)hits.push({target,source:f,value:160});")
s=s.replace("Math.hypot(f.destX-o.x,f.destY-o.y)>=44", "this.fighters.every(other=>other===f||other.hp<=0||Math.hypot(f.destX-other.x,f.destY-other.y)>=44)")
s=s.replace("value:f.id==='broly'?96:f.kaiokenLeft>0?92:76", "kind:'melee',value:f.melee*(f.kaiokenLeft>0?92/76:1)")
s=s.replace("(f.id==='broly'?155:175)","f.speed")
a=s.index(' const [a,b]=this.fighters;');b=s.index(' for(const f of this.fighters){f.x=Math.max',a)
s=s[:a]+''' const alive=this.fighters.filter(f=>f.hp>0);for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){const a=alive[i],b=alive[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<42){if(!d){dx=1;dy=0;d=1;}const p=(42-d)/2;a.x-=dx/d*p;a.y-=dy/d*p;b.x+=dx/d*p;b.y+=dy/d*p;}}
''' +s[b:]
a=s.index(' for(const s of this.shots){const ox=');b=s.index('\n this.shots=this.shots.filter',a)
s=s[:a]+''' for(const s of this.shots){const ox=s.x,oy=s.y;s.x+=s.vx*DT;s.y+=s.vy*DT;s.life-=DT;const vx=s.x-ox,vy=s.y-oy;let collision=null;for(const target of this.fighters){if(target.id===s.id||target.hp<=0)continue;const t=Math.max(0,Math.min(1,((target.x-ox)*vx+(target.y-oy)*vy)/(vx*vx+vy*vy)));if(Math.hypot(target.x-ox-t*vx,target.y-oy-t*vy)<(s.radius||34)&&(!collision||t<collision.t))collision={target,t};}if(collision){hits.push({target:collision.target,source:this.fighters.find(f=>f.id===s.id),value:s.damage||230});s.life=0;}}
''' +s[b:]
s=s.replace("h.target.hp-=h.value;h.source.damage+=h.value;", "h.value=Math.max(1,Math.round(h.value*(h.kind==='melee'?1:h.source.skillPower/100)));h.target.hp-=h.value;h.source.damage+=h.value;")
a=s.index(' for(const f of this.fighters)f.hp=Math.max');s=s[:a]+''' for(const f of this.fighters){f.hp=Math.max(0,f.hp);if(f.hp===0&&f.deathTick===null){f.deathTick=this.tick;f.state='defeat';f.age=0;this.event('eliminated',f);}}
 const survivors=this.fighters.filter(f=>f.hp>0);if(survivors.length<=1||this.tick>=3600){if(survivors.length===0)this.result='draw';else{const best=survivors.reduce((a,b)=>a.hp*b.max>=b.hp*a.max?a:b),ties=survivors.filter(f=>f.hp*best.max===best.hp*f.max);this.result=ties.length===1?best.id:'draw';}this.event('end',this.fighters[0],{winner:this.result});}}
}
'''
p.write_text(s,encoding='utf-8')
