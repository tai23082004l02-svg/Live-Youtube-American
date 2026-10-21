const KEYS={'DOWN ARENA':'down_arena',VICTORY:'victory',CHAMPION:'champion',VS:'vs','NEXT BATTLE':'next_battle','TOURNAMENT DRAW':'tournament_draw',DRAW:'draw',REMATCH:'rematch'};
const cache=new Map();
export function drawTitle(ctx,label,x,y,maxWidth,maxHeight){const key=KEYS[label];if(!key||typeof Image==='undefined')return false;
 let im=cache.get(key);if(!im){im=new Image();im.src='assets/ui/titles/'+key+'.webp';cache.set(key,im);}
 if(!im.complete||!im.naturalWidth||!im.naturalHeight)return false;
 const scale=Math.min(maxWidth/im.naturalWidth,maxHeight/im.naturalHeight),w=im.naturalWidth*scale,h=im.naturalHeight*scale;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x-w/2,y-h/2,w,h);ctx.restore();return true;
}
