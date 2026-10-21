import {drawSukunaActor,drawSukunaBack,drawSukunaWorld} from './sukuna.js';
import {drawGojoActor,drawGojoBack,drawGojoWorld} from './gojo-v2.js';
import {SPECTATOR_META} from './spectator-meta.js';
import {drawSaberActor,drawSaberBack,drawSaberWorld} from './saber.js';
import {drawTatsuActor,drawTatsuBack,drawTatsuWorld} from './tatsumaki.js';
import {drawBoaActor,drawBoaBack,drawBoaWorld} from './boa.js';
import {drawUltraActor,drawUltraBack,drawUltraWorld} from './ultra.js';
import {drawJinwooActor,drawJinwooIntroBack,drawJinwooEffects} from './jinwoo.js';
import {drawIchigoActor,drawIchigoEffects} from './ichigo.js';
import {drawBeerusFrame} from './beerus.js';
import {beerusPose} from '../characters/beerus.js';
import {gokuBluePose} from '../characters/goku_blue.js';
const renderers={sukuna:[drawSukunaBack,drawSukunaActor,drawSukunaWorld],gojo:[drawGojoBack,drawGojoActor,drawGojoWorld],saber:[drawSaberBack,drawSaberActor,drawSaberWorld],tatsumaki:[drawTatsuBack,drawTatsuActor,drawTatsuWorld],boa_hancock:[drawBoaBack,drawBoaActor,drawBoaWorld],goku_ultra:[drawUltraBack,drawUltraActor,drawUltraWorld],sung_jinwoo:[drawJinwooIntroBack,drawJinwooActor,drawJinwooEffects],ichigo:[null,drawIchigoActor,drawIchigoEffects]};
export function spectatorIntroAssets(id){if(id==='gojo')return ['gojo_v2','gojo_v2_intro','gojo_v2_intro_vfx'];return renderers[id]||id==='beerus'?[id,id+'_intro',id+'_intro_vfx']:id==='goku_blue'?[id,'goku_blue_transform','goku_blue_intro_vfx']:[id];}
function effect(ctx,images,id,row,col,y,scale){const im=images[id+'_intro_vfx'];if(!im?.complete||!im.naturalWidth)return;ctx.save();ctx.translate(0,y);ctx.scale(scale,scale);ctx.drawImage(im,Math.min(5,col)*512,row*384,512,384,-256,-192,512,384);ctx.restore();}
// A presentation-only fighter reuses the battle entrance renderers and their timing.
export function drawSpectatorIntro(ctx,images,id,age,height){if(age<0||age>=2.5||spectatorIntroAssets(id).length===1)return false;
 const m=SPECTATOR_META[id],scale=Math.min(height/m.height,87/m.width)/(id==='sukuna'?.98:.86);
 const f={id,uid:'spectator-'+id,hp:1,x:0,y:0,face:1,introAge:age,state:'idle',age,combo:0,psychicZones:[],gojoFields:[]};
 const d={fighters:[f],tick:0,personalUltimate:null,teamUltimate:null};
 ctx.save();ctx.scale(scale,scale);
 if(renderers[id]){const [back,actor,front]=renderers[id];back?.(ctx,images,d,age);actor(ctx,images,d,f);front?.(ctx,images,d,age);}
 else{const p=age/2.5;
  if(id==='beerus'){
   if(p>.3)effect(ctx,images,id,0,Math.floor(p*6),-70,1.15);
   if(p>.6)effect(ctx,images,id,1,Math.floor((p-.6)/.4*6),0,1.4);
   const pose=beerusPose(f);drawBeerusFrame(ctx,images,'beerus_intro',pose.row,pose.frame,0,0);
  }else{
   if(p>.15){effect(ctx,images,id,0,p<.55?Math.min(3,Math.floor(p*7)):4,-60,1.3);effect(ctx,images,id,2,Math.floor(p*6),-10,1.15);}
   const pose=gokuBluePose(f),im=images.goku_blue_transform;if(im?.complete&&im.naturalWidth)ctx.drawImage(im,pose.frame*320,pose.row*224,320,224,-160*.86,-192*.86,320*.86,224*.86);
   if(age>.45)effect(ctx,images,id,1,Math.floor(age*15)%6,-60,1.3);
   if(age>1.45&&age<1.85)effect(ctx,images,id,3,Math.floor((age-1.45)*15),-5,1.6);
  }
 }
 ctx.restore();return true;
}
