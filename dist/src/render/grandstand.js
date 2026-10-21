import {spectatorIntroAssets,drawSpectatorIntro} from './spectator-intro.js';
import {AssetLoader} from '../engine/assets.js';
import {drawEntrants} from '../engine/tournament.js';
import {SPECTATOR_META} from './spectator-meta.js';
// Shared image loaded once; the procedural floor remains available on failure.
// Both source regions use the same mapping into the 540x720 art band.
export const PORTRAIT_ART={width:941,height:1176,galleryHeight:1176*192/720};
let courtyard;
function courtyardImage(){
 if(!courtyard&&typeof Image!=='undefined'){courtyard=new Image();courtyard.src='assets/arenas/vertical_arena_sunset.webp';}
 return courtyard?.complete&&courtyard.naturalWidth?courtyard:null;
}

export class Grandstand{
 constructor(names,loader=new AssetLoader()){this.names=names;this.loader=loader;this.clock=0;this.ids=[];this.images={};this.generation=0;this.rotations=0;this.pending=false;}
 start(seed){this.stop();this.seed=seed;this.clock=0;this.rotations=0;this.lastRequest=0;this.slotBorn=[];return this.rotate();}
 stop(){this.generation++;this.pending=false;this.ids=[];this.images={};this.queue=null;this.slotBorn=[];this.loader.retain([]);}
 async rotate(){const token=++this.generation;this.pending=true;this.lastRequest=this.clock;const pool=Object.keys(this.names),fresh=pool.filter(id=>!this.ids.includes(id));const ids=drawEntrants(fresh.length>=6?fresh:pool,this.seed+'-STANDS-'+this.rotations++).slice(0,6);
  const keys=[...new Set(ids.flatMap(spectatorIntroAssets))];
  try{const ims=await Promise.all(keys.map(id=>this.loader.load(id)));if(token!==this.generation)return;
   const keep=new Set(this.ids.filter(Boolean).flatMap(spectatorIntroAssets));
   this.images=Object.fromEntries(Object.entries(this.images).filter(([key])=>keep.has(key)));
   Object.assign(this.images,Object.fromEntries(keys.map((key,i)=>[key,ims[i]])));
   this.queue={ids,born:this.clock,next:0};this.revealSlots();
  }
  catch{/* Keep existing spectators if any required atlas fails. */}
  finally{if(token===this.generation){this.pending=false;this.loader.retain(Object.keys(this.images));}}
 }
 revealSlots(){const q=this.queue;if(!q)return;while(q.next<6&&this.clock>=q.born+q.next*10){const i=q.next++;this.ids[i]=q.ids[i];this.slotBorn[i]=q.born+i*10;}}
 tick(dt){this.clock+=dt;this.revealSlots();if(this.clock-this.lastRequest>=60&&!this.pending)this.rotate();}
}
export function drawPortraitBackdrop(ctx){const bg=courtyardImage();if(bg)ctx.drawImage(bg,0,0,PORTRAIT_ART.width,PORTRAIT_ART.height,0,0,540,720);else{ctx.fillStyle='#405565';ctx.fillRect(0,0,540,720);}}
export function drawGrandstand(ctx,g,names,reduced=false){ctx.save();
 // Two staggered rows share one terrace; no portrait bays or permanent portals.
 const places=[[180,150,48],[280,150,48],[380,150,48],[140,180,54],[250,180,54],[360,180,54]];
 for(let i=0;i<6;i++){const id=g.ids[i];if(!id)continue;const [x,y,height]=places[i];
  const age=g.clock-(g.slotBorn[i]??g.clock),appear=reduced?1:Math.max(0,Math.min(1,(age-.15)/.45)),color=i%2?'#c49aff':'#6ce5ff';
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=appear;
  ctx.fillStyle='#17293655';ctx.beginPath();ctx.ellipse(0,1,18,4,0,0,Math.PI*2);ctx.fill();
  if(!reduced&&spectatorIntroAssets(id).length===1&&age>=0&&age<2.5){ctx.globalAlpha=Math.max(0,1-age/2.5);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,24,6,0,0,Math.PI*2);ctx.stroke();
   for(let n=0;n<6;n++){const py=-((age*55+n*13)%75);ctx.fillStyle=color;ctx.fillRect(Math.sin(n*8+age*3)*23,py,2,3);}}
  ctx.globalAlpha=appear;ctx.translate(0,5*(1-appear));if(reduced||!drawSpectatorIntro(ctx,g.images,id,age,height))standActor(ctx,g.images,id,g.clock+i,height);ctx.restore();
 }
 ctx.restore();}
function standActor(ctx,images,id,clock,height){const im=images[id==='gojo'?'gojo_v2':id],m=SPECTATOR_META[id];if(!im?.complete||!im.naturalWidth||!m)return;
 const n=Math.floor(clock*5)%m.bounds.length,b=m.bounds[n],scale=Math.min(height/m.height,87/m.width),[w,h]=m.frameSize;
 // Anchor alpha bounds at the feet, but draw the complete source cell including glow.
 ctx.drawImage(im,n*w,0,w,h,-(b[0]+b[2])*.5*scale,-b[3]*scale,w*scale,h*scale);
}
export function drawPortraitFloor(ctx,a){const bg=courtyardImage();if(bg){ctx.save();ctx.translate(480,270);ctx.scale(a.scale,a.scale);ctx.translate(-480,-270);ctx.drawImage(bg,0,PORTRAIT_ART.galleryHeight,PORTRAIT_ART.width,PORTRAIT_ART.height-PORTRAIT_ART.galleryHeight,180,0,600,540);ctx.restore();return;}ctx.save();ctx.translate(480,270);ctx.scale(a.scale,a.scale);ctx.translate(-480,-270);
 const glow=ctx.createLinearGradient(210,0,750,540);glow.addColorStop(0,'#244557');glow.addColorStop(1,'#0b1725');ctx.fillStyle=glow;ctx.fillRect(180,0,600,540);
 ctx.fillStyle='#101d2b';ctx.fillRect(214,62,532,467);ctx.fillStyle='#58656a';ctx.fillRect(230,70,500,438);
 for(let row=0;row<10;row++)for(let col=0;col<10;col++){ctx.fillStyle=(row+col)%3?'#525f64':'#5c696b';ctx.fillRect(234+col*49,74+row*43,47,41);}
 ctx.strokeStyle='#9ea88988';ctx.lineWidth=3;ctx.strokeRect(240,84,480,410);ctx.beginPath();ctx.ellipse(480,300,150,141,0,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(480,300,120,113,0,0,Math.PI*2);ctx.stroke();
 for(const x of [218,734])for(let y=90;y<510;y+=85){ctx.fillStyle='#d0b77f';ctx.fillRect(x-5,y,10,22);ctx.fillStyle='#6de5ff';ctx.fillRect(x-2,y+3,4,9);}
 ctx.restore();}
