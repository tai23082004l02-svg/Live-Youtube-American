// Stateless visual animation. Never writes to shots, fighters or simulation RNG.
const PALETTES={sukuna:['#ff254c','#ffd9a6'],boa_hancock:['#ff7ab9','#fff0fa'],tatsumaki:['#42f99a','#dbfff0'],saber:['#ffd15d','#f5ffff'],goku_ultra:['#a3dcff','#ffffff'],ichigo:['#ff284f','#ffc0ce'],goku:['#48dbff','#f1fdff'],goku_blue:['#3cd7ff','#f2fcff'],vegeta:['#be74ff','#f2d9ff'],broly:['#8aff54','#e9ffd4'],piccolo:['#c5f66f','#ffffb7'],naruto:['#63e8ff','#ffc266'],gojo:['#ad68ff','#f2d3ff'],sasuke:['#ff843c','#ffe6a2'],gogeta:['#78dfff','#fff3b5'],luffy:['#ff853c','#ffe5a2'],frieza:['#e277ff','#f8d8ff'],gaara:['#dfb56c','#ffe6ad'],yugi:['#b77bff','#e7d5ff'],beerus:['#be63ff','#f4c9ff']};
function phaseSeed(s){let n=17;for(const c of String(s.ownerUid||s.id||'energy')+':'+String(s.kind||''))n=(Math.imul(n,31)+c.charCodeAt(0))>>>0;return n%997;}
export function projectileProfile(s){
 const colors=PALETTES[s.id]||PALETTES.goku,beam=['beam','roar','special','final','deathbeam','bigbang','instantblue','hakai','instinctbeam','supreme','strikeair','excalibur'].includes(s.kind),small=['volley','stardustfall','hellzone','card'].includes(s.kind);
 const shape=s.kind==='card'?'card':['dismantle','saucers','getsuga','fullgetsuga','invisibleair'].includes(s.kind)?'disc':s.id==='gaara'?'sand':s.kind==='shuriken'?'wind':beam?'beam':'orb';
 return {color:s.kind==='final'?'#ffd568':s.kind==='supernova'?'#f9a15c':colors[0],accent:colors[1],shape,radius:small?12:s.kind==='supernova'?34:beam?22:27,length:beam?155:small?65:110,dark:['beerus','gojo','yugi'].includes(s.id),lightning:s.id==='gaara'||s.kind==='card'?0:small?1:3,seed:phaseSeed(s)};
}
function path(ctx,points){ctx.beginPath();for(let i=0;i<points.length;i++)i?ctx.lineTo(...points[i]):ctx.moveTo(...points[i]);ctx.stroke();}
function bolt(ctx,radius,angle,time,seed,color,reduced){
 const bucket=Math.floor(time*(reduced?8:18)),points=[];
 for(let i=0;i<7;i++){const a=angle+i*.16,r=radius*(1.15+.2*Math.sin(seed+bucket*1.7+i*2.83));points.push([Math.cos(a)*r,Math.sin(a)*r]);}
 ctx.strokeStyle=color;ctx.lineWidth=1.7;path(ctx,points);ctx.strokeStyle='#f6f1ff';ctx.globalAlpha*=.6;ctx.lineWidth=.7;path(ctx,points);ctx.globalAlpha/=.6;
}
export function drawProjectileEnergy(ctx,s,position,time,{layer='front',reduced=false,profile={}}={}){
 const p={...projectileProfile(s),...profile},r=p.radius*(1+.045*Math.sin(time*6+p.seed)),phase=time*5+p.seed*.07,angle=Math.atan2(s.vy??0,s.vx??1),length=Math.max(12,Math.min(1800,p.length));
 ctx.save();ctx.translate(position.x,position.y);ctx.rotate(angle);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
 if(layer==='back'){
  const trail=ctx.createLinearGradient(-length,0,r,0);trail.addColorStop(0,p.color+'00');trail.addColorStop(.7,p.color+'45');trail.addColorStop(1,p.accent+'99');ctx.fillStyle=trail;ctx.beginPath();ctx.moveTo(-length,0);ctx.quadraticCurveTo(-length*.4,-r*.85,r*.6,-r*.45);ctx.quadraticCurveTo(r*1.3,0,r*.6,r*.45);ctx.quadraticCurveTo(-length*.4,r*.85,-length,0);ctx.fill();
  const count=reduced?3:6;for(let i=0;i<count;i++){const q=(time*(.85+i*.08)+p.seed*.01+i/count)%1,x=-q*length,y=Math.sin(q*9+i*2.3+phase*.3)*r*(.25+q*.6);ctx.globalAlpha=(1-q)*.65;ctx.fillStyle=i%2?p.accent:p.color;ctx.beginPath();ctx.arc(x,y,Math.max(.5,(1-q)*(p.shape==='sand'?3:2.2)),0,Math.PI*2);ctx.fill();}ctx.restore();return;
 }
 if(p.shape==='card'){
  ctx.globalAlpha=.7;ctx.strokeStyle=p.accent;ctx.lineWidth=1;ctx.rotate(phase*.5);ctx.strokeRect(-r*.7,-r*.7,r*1.4,r*1.4);ctx.restore();return;
 }
 if(p.shape==='beam'){
  for(let j=0;j<2;j++){const points=[];for(let i=0;i<=28;i++){const x=-length+i/28*length,y=Math.sin(i/28*Math.PI*4-phase+j*Math.PI)*r*.8;points.push([x,y]);}ctx.globalAlpha=j?.7:.5;ctx.strokeStyle=j?p.accent:p.color;ctx.lineWidth=j?1.8:3.2;path(ctx,points);}
  for(let i=0;i<3;i++){const q=(time*.9+i/3+p.seed*.003)%1;ctx.globalAlpha=.4*(1-q);ctx.strokeStyle=p.accent;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(-q*length,0,r*.3,r*(1-q*.4),0,0,Math.PI*2);ctx.stroke();}
 }else{
  // Two counter-rotating layers keep the energy alive without spinning its flight direction.
  for(let j=0;j<(reduced?1:3);j++){ctx.globalAlpha=j===0?.65:.4;ctx.strokeStyle=j%2?p.accent:p.color;ctx.lineWidth=j===0?2.2:1.5;ctx.beginPath();ctx.ellipse(0,0,r*(1.05+j*.13),r*(p.shape==='disc'?.3:.48),phase*(j%2?-1:1)+j*1.9,.25,Math.PI*1.8);ctx.stroke();}
  if(p.dark){ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.3;ctx.fillStyle='#1b0734';ctx.beginPath();ctx.arc(0,0,r*.46,0,Math.PI*2);ctx.fill();ctx.restore();}
  const arms=p.shape==='wind'?4:2;
  for(let arm=0;arm<arms;arm++){const points=[];for(let k=0;k<=12;k++){const q=k/12,a=phase+arm*Math.PI*2/arms+q*2.5,rr=r*(.15+q*.75);points.push([Math.cos(a)*rr,Math.sin(a)*rr]);}ctx.globalAlpha=.55;ctx.strokeStyle=arm%2?p.accent:p.color;ctx.lineWidth=p.shape==='wind'?2.8:1.7;path(ctx,points);}
 }
 ctx.globalAlpha=reduced?.35:.65;for(let i=0;i<(reduced?Math.min(1,p.lightning):p.lightning);i++)bolt(ctx,r,phase*.25+i*Math.PI*2/Math.max(1,p.lightning),time,p.seed+i*19,p.accent,reduced);
 ctx.restore();
}
