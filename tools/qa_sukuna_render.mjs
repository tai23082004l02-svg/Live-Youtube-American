// Offline proof records the actual renderer's image transforms, without browser automation.
import {writeFileSync} from 'node:fs';
import {SUKUNA_META} from '../dist/src/render/sukuna-meta.js';
import {drawSukunaActor,drawSukunaBack,drawSukunaWorld,drawSukunaCinematic,drawSukunaShot,drawSukunaBurst} from '../dist/src/render/sukuna.js';
const images=Object.fromEntries(Object.keys(SUKUNA_META).map(key=>[key,{key,complete:true,naturalWidth:9999}]));
const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
function context(){let matrix=[1,0,0,1,0,0],stack=[],path=[];const ops=[];
 const point=(x,y)=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]];
 const ctx=new Proxy({globalAlpha:1,font:'20px Georgia',fillStyle:'#fff',strokeStyle:'#fff',lineWidth:1,globalCompositeOperation:'source-over',textAlign:'left',
 createRadialGradient(...args){return {type:'radial',args,stops:[],addColorStop(p,c){this.stops.push([p,c]);}};},
 save(){stack.push({matrix:[...matrix],alpha:this.globalAlpha,font:this.font,fill:this.fillStyle,stroke:this.strokeStyle,width:this.lineWidth,blend:this.globalCompositeOperation});},
 restore(){const s=stack.pop();matrix=s.matrix;this.globalAlpha=s.alpha;this.font=s.font;this.fillStyle=s.fill;this.strokeStyle=s.stroke;this.lineWidth=s.width;this.globalCompositeOperation=s.blend;},
 translate(x,y){matrix=mul(matrix,[1,0,0,1,x,y]);},scale(x,y){matrix=mul(matrix,[x,0,0,y,0,0]);},rotate(a){matrix=mul(matrix,[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]);},
 beginPath(){path=[];},moveTo(x,y){path.push(point(x,y));},lineTo(x,y){path.push(point(x,y));},
 ellipse(x,y,rx,ry,rotation,start,end){for(let i=0;i<=60;i++){const t=start+(end-start)*i/60,u=Math.cos(t)*rx,v=Math.sin(t)*ry;path.push(point(x+u*Math.cos(rotation)-v*Math.sin(rotation),y+u*Math.sin(rotation)+v*Math.cos(rotation)));}},
 arc(x,y,r,start,end){this.ellipse(x,y,r,r,0,start,end);},
 fill(){ops.push({path:[...path],fill:this.fillStyle,alpha:this.globalAlpha,matrix:[...matrix],blend:this.globalCompositeOperation});},
 stroke(){ops.push({path:[...path],stroke:this.strokeStyle,width:this.lineWidth*Math.hypot(matrix[0],matrix[1]),alpha:this.globalAlpha,matrix:[...matrix]});},
 drawImage(im,...args){ops.push({key:im.key,args,matrix:[...matrix],alpha:this.globalAlpha});},
 fillText(text,x,y,max){ops.push({text,x,y,max,font:this.font,fill:this.fillStyle,matrix:[...matrix],alpha:this.globalAlpha});}}, {get:(o,k)=>o[k]??(()=>{})});return {ctx,ops};}
const f={id:'sukuna',uid:'s',hp:1250,state:'idle',age:0,combo:0,x:480,y:320,face:1};const d={fighters:[f],tick:80,personalUltimate:{cinematic:null,attack:null}};const scenes=[];
for(const [name,setup] of [['entrance-portal',()=>f.introAge=.2],['entrance-emerge',()=>f.introAge=1.2],['furnace',()=>{f.introAge=null;f.state='furnace';f.age=.8;}],['domain',()=>{f.state='idle';d.personalUltimate.attack={kind:'shrine',phase:'travel',x:480,y:330,launch:0};}],['dialogue',()=>{d.personalUltimate.attack=null;d.personalUltimate.cinematic={kind:'shrine',ownerUid:'s',elapsed:80,durationSteps:245};}]]){setup();const {ctx,ops}=context();drawSukunaBack(ctx,images,d,1);drawSukunaActor(ctx,images,d,f);drawSukunaWorld(ctx,images,d,1);drawSukunaCinematic(ctx,images,d);scenes.push({name,ops});}
for(const [name,render] of [['slash-flight',ctx=>drawSukunaShot(ctx,images,{kind:'dismantle',vx:700,vy:0},480,280,1)],['furnace-impact',ctx=>drawSukunaBurst(ctx,images,{action:'furnace',x:480,y:280,life:.45,max:.5})],['cleave-impact',ctx=>drawSukunaBurst(ctx,images,{action:'cleave',x:480,y:280,life:.29,max:.32})]]){const {ctx,ops}=context();render(ctx);scenes.push({name,ops});}
writeFileSync('art/frames/sukuna/runtime_proof_ops.json',JSON.stringify(scenes));
console.log('Recorded actual native renderer transforms and VFX paths for8 scenes.');
