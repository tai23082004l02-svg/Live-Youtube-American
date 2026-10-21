import {BEERUS_NATIVE_META} from './beerus-meta.js';
export function drawBeerusFrame(ctx,images,key,row,frame,x,y,face=1,hurt=false,tone=true){
 const im=images[key],meta=BEERUS_NATIVE_META[key];if(!im?.complete||!im.naturalWidth)return;
 row=Math.max(0,Math.min(meta.rows-1,row));frame=Math.max(0,Math.min(5,frame));
 const [w,h]=meta.frameSize,[px,py]=meta.pivot,scale=meta.frames[row*6+frame].fitScale*.86;
 ctx.save();ctx.translate(x,y);ctx.scale(face<0?-1:1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(tone)ctx.filter=hurt?'brightness(1.7) saturate(.6)':'contrast(1.08) saturate(1.06)';
 ctx.drawImage(im,frame*w,row*h,w,h,-px*scale,-py*scale,w*scale,h*scale);ctx.restore();
}
