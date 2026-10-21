// World coordinates grow around the canvas center. Combat distances stay in world units.
export function normalizeArenaScale(value=1){const n=Number(value);return Number.isFinite(n)?Math.round(Math.max(1,Math.min(4,n))*100)/100:1;}
export function createArena(value=1,layout=null){const scale=normalizeArenaScale(value);if(layout==='portrait')return {layout,scale,left:480-270*scale,top:270-270*scale,right:480+270*scale,bottom:270+270*scale,width:540*scale,height:540*scale,minX:480-165*scale,maxX:480+165*scale,minY:270-160*scale,maxY:270+100*scale};return {scale,left:480-480*scale,top:270-270*scale,right:480+480*scale,bottom:270+270*scale,width:960*scale,height:540*scale,minY:270-125*scale,maxY:270+120*scale};}
export function cameraPoint(x,y,scale){return {x:480+(x-480)/scale,y:270+(y-270)/scale};}

// Inset octagonal walkable surface, matched to the courtyard artwork.
export function portraitHorizontalLimits(a,y){
 const baseY=270+(y-270)/a.scale;
 const inset=Math.max(0,170-baseY,baseY-310);
 return [a.minX+inset*a.scale,a.maxX-inset*a.scale];
}

// Portrait world y0 maps to screen y192; allow projectiles through the terrace.
export const PORTRAIT_SCENE_OFFSET=192*540/528;
export const PORTRAIT_SCENE_HEIGHT=720*540/528;
