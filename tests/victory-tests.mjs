import assert from 'node:assert/strict';
import {VictoryScene,drawVictoryScreen,drawVictoryAura,applyVictoryCamera} from '../dist/src/render/victory.js';
const fighter=(uid,id,team,hp,x,y)=>({uid,id,team,hp,x,y,damage:200});
const a=fighter('A-1','goku','A',100,220,240),b=fighter('B-1','goku','B',0,700,300),c=fighter('A-2','saber','A',200,750,330);
for(const result of ['goku','teamA','draw']){
 const d={result,fighters:result==='teamA'?[a,b,c]:[a,b],arena:{scale:1}};
 const before=JSON.stringify(d),scene=new VictoryScene(d);
 assert.equal(scene.winners.length,result==='draw'?0:result==='teamA'?2:1);
 assert.equal(scene.uids.has(b.uid),false);
 assert.equal(scene.frame(0).camera.zoom,1);
 assert.equal(scene.frame(.8).reveal,0);
 assert.equal(scene.frame(2).reveal,1);
 assert.equal(scene.frame(2,true).camera.zoom,1);
 assert.equal(Math.abs(scene.frame(2,true).shake.x)+Math.abs(scene.frame(2,true).shake.y),0);
 const text=[];let balance=0;
 const gradient={addColorStop(){}};
 const ctx=new Proxy({save(){balance++;},restore(){balance--;},fillText(t){text.push(t);},createRadialGradient(){return gradient;},createLinearGradient(){return gradient;}},{get(o,k){return k in o?o[k]:(...args)=>{assert(args.filter(x=>typeof x==='number').every(Number.isFinite));};}});
 for(const age of [0,.18,.4,1,2,12]){const frame=scene.frame(age);applyVictoryCamera(ctx,frame);drawVictoryAura(ctx,scene,frame);drawVictoryScreen(ctx,scene,frame,{goku:'Goku',saber:'Saber'});}
 assert(text.includes(result==='draw'?'DRAW':'VICTORY'));assert.equal(balance,0);
 assert.equal(JSON.stringify(d),before,'presentation must preserve battle state');
}
const large=new VictoryScene({result:'goku',fighters:[a,b],arena:{scale:4}});
for(const age of [0,.18,.4,1,2,12])assert.deepEqual(large.frame(age).camera,{x:480,y:270,zoom:1});
console.log('Victory passed: duel/FFA identity, duplicate team IDs, draw, timing, reduced effects, finite rendering and unchanged simulation.');
