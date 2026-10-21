// Shared world-space HUD; energy represents existing personal/team Ultimate rage.
export function drawFighterBars(ctx,d){
 if(d.introRemaining>0)return;
 const fraction=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 for(const f of d.fighters){
  if(f.hp<=0||f.introAge!=null)continue;
  const side=d.teamMode?f.team:d.fighters.length===2?(f===d.fighters[0]?'A':'B'):null;
  const hpColor=side==='A'?'#55cfff':side==='B'?'#ff638b':null;
  const hp=fraction(f.hp/f.max),energy=fraction((Number.isFinite(f.rage)?f.rage:d.teamUltimate?.teams[f.team]?.rage??0)/100),x=f.x-32,y=f.y+34;
  ctx.save();ctx.globalAlpha=1;
  ctx.fillStyle='#050b16';ctx.fillRect(x-2,y-2,68,19);
  ctx.fillStyle=side==='A'?'#173c55':side==='B'?'#4c2037':'#38232c';ctx.fillRect(x,y,64,6);ctx.fillStyle=hpColor||(hp>.5?'#65eb91':hp>.25?'#ffc35c':'#ff6677');ctx.fillRect(x,y,64*hp,6);
  ctx.fillStyle='#162b48';ctx.fillRect(x,y+9,64,5);ctx.fillStyle=energy>=1?'#f7dc78':'#60cfff';ctx.fillRect(x,y+9,64*energy,5);
  if(d.teamMode&&d.arena?.layout!=='portrait'){ctx.font='bold 10px Segoe UI';ctx.textAlign='center';ctx.fillStyle=f.team==='A'?'#79d9ff':'#ff9f9f';ctx.fillText(f.team+'-'+f.slot,f.x,y+29);}
  ctx.restore();
 }
}
