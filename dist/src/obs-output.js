// Layout remains540x960 logical units; draw text and composited imagery directly
// into a1080x1920 backing buffer instead of upscaling an already rasterized feed.
export function configurePortraitOutput(canvas,ctx){canvas.width=1080;canvas.height=1920;ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';}
export function obsMode(search=''){const value=/(?:^|[?&])obs=(vote|vertical)(?:&|$)/.exec(search)?.[1];return value==='vote'?'live_vote':value==='vertical'?'live_vertical':null;}
export async function startOBSOutput({mode,menu,start,unlock,document}){if(!mode)return false;await menu.choose(mode);await start();document.addEventListener('pointerdown',unlock,{once:true});return true;}
