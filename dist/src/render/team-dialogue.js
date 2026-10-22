import {drawMadaraChat} from './madara.js';
import {drawNarutoV2Chat} from './naruto-v2.js';
import {drawRengokuChat} from './rengoku.js';
import {drawGojoChat} from './gojo-v2.js';
import {beginBottomDialogue} from './bottom-dialogue.js';
import {cinematicSteps} from '../engine/ultimate-rules.js';
import {drawBoaChat} from './boa.js';
import {drawTatsuChat} from './tatsumaki.js';
import {drawSaberChat} from './saber.js';
import {drawUltraChat} from './ultra.js';
import {drawJinwooChat} from './jinwoo.js';
import {TEAM_DIALOGUE_META as META} from './team-dialogue-meta.js';
export const TEAM_DIALOGUE_THEMES={madara:2,naruto_v2:3,rengoku:1,sukuna:5,boa_hancock:5,tatsumaki:2,saber:1,goku_ultra:0,sung_jinwoo:2,goku:0,goku_blue:0,piccolo:0,broly:0,vegeta:1,gogeta:1,beerus:2,frieza:2,gojo:2,sasuke:2,naruto:3,luffy:3,gaara:3,yugi:4,ichigo:5};
export function dialogueLayout(id){return META.frames[TEAM_DIALOGUE_THEMES[id]??0];}
export function dialogueLines(ctx,text,width){const lines=[];let line='';for(const word of text.split(' ')){const next=line?line+' '+word:word;if(line&&(ctx.measureText(next)?.width??next.length*12)>width){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
export function drawTeamDialogue(ctx,images,d,names,portrait,reduced=false){
 const c=d.teamUltimate?.cinematic,a=d.teamUltimate?.attack;
 if(!c){if(a?.phase==='travel'&&d.tick-a.launch<42){const p=(d.tick-a.launch)/42;ctx.save();ctx.globalAlpha=Math.min(1,(1-p)*4);ctx.fillStyle='#070b16d9';ctx.fillRect(100,44,760,58);ctx.fillStyle=a.style.color;ctx.fillRect(100,100,760,2);ctx.textAlign='center';ctx.font='bold 25px Segoe UI';ctx.fillText(a.style.name.toUpperCase(),480,82,710);ctx.restore();}return;}
 const mf=d.fighters.find(f=>f.uid===c.leaderUid);if(mf?.id==='madara'&&images.madara_dialogue?.complete){drawMadaraChat(ctx,images,c,c.style.line,reduced);return;}
 const nf=d.fighters.find(f=>f.uid===c.leaderUid);if(nf?.id==='naruto_v2'&&images.naruto_v2_dialogue?.complete){drawNarutoV2Chat(ctx,images,c,c.style.line,reduced,nf.baryon);return;}
 if(d.fighters.find(f=>f.uid===c.leaderUid)?.id==='rengoku'&&images.rengoku_dialogue?.complete){drawRengokuChat(ctx,images,c,c.style.line,reduced);return;}
 if(d.fighters.find(f=>f.uid===c.leaderUid)?.id==='gojo'&&images.gojo_v2_dialogue?.complete){drawGojoChat(ctx,images,c,c.style.line,reduced);return;}
 if(d.fighters.find(f=>f.uid===c.leaderUid)?.id==='boa_hancock'&&images.boa_hancock_dialogue?.complete){drawBoaChat(ctx,images,c,c.style.line,reduced);return;}
 if(d.fighters.find(f=>f.uid===c.leaderUid)?.id==='tatsumaki'&&images.tatsumaki_dialogue?.complete){drawTatsuChat(ctx,images,c,c.style.line,reduced);return;}
 if(d.fighters.find(f=>f.uid===c.leaderUid)?.id==='saber'&&images.saber_dialogue?.complete){drawSaberChat(ctx,images,c,c.style.line,reduced);return;}
 if(d.fighters.find(f=>f.uid===c.leaderUid)?.id==='goku_ultra'&&images.goku_ultra_dialogue?.complete){drawUltraChat(ctx,images,c,c.style.line,reduced);return;}
 if(d.fighters.find(f=>f.uid===c.leaderUid)?.id==='sung_jinwoo'&&images.sung_jinwoo_dialogue?.complete){drawJinwooChat(ctx,images,c,c.style.line,reduced);return;}
 const im=images.team_dialogue;if(!im?.complete||!im.naturalWidth)return;
 const leader=d.fighters.find(f=>f.uid===c.leaderUid),m=dialogueLayout(leader.id),p=c.elapsed/cinematicSteps(c),scale=.79;
 const slide=reduced?0:p<.12?(1-p/.12)*-45:p>.9?(p-.9)/.1*45:0;
 const left=480-1152*scale/2+slide,top=295-384*scale/2,point=xy=>[left+xy[0]*scale,top+xy[1]*scale];
 beginBottomDialogue(ctx);ctx.globalAlpha=Math.min(1,p*12,(1-p)*12);
 ctx.drawImage(im,m.column*1152,m.row*384,1152,384,left,top,1152*scale,384*scale);
 portrait(ctx,images,leader,...point(m.portrait),130*scale);
 ctx.textAlign='left';ctx.fillStyle='#fff7ed';ctx.font='bold 13px Segoe UI';const name=point(m.nameplate);ctx.textAlign='center';ctx.fillText(names[leader.id].toUpperCase(),name[0],name[1]+4,155*scale);ctx.textAlign='left';
 const text=point(m.text);ctx.font='bold 23px Segoe UI';const lines=dialogueLines(ctx,c.style.line,475).slice(0,2);for(const [i,line] of lines.entries())ctx.fillText(line,text[0],text[1]+(i-(lines.length-1)/2)*29,475);
 ctx.font='bold 12px Segoe UI';ctx.fillStyle=c.style.color;ctx.fillText('TEAM '+c.team+'  /  UNITED ULTIMATE',text[0]+70,top+304*scale,380);
 // Short moving sparks stay on the outer rail, leaving the sentence unobstructed.
 if(!reduced){ctx.strokeStyle=c.style.color;ctx.lineWidth=2;for(let i=0;i<3;i++){const x=left+(390+((p*350+i*170)%630))*scale,y=top+(i%2?310:68)*scale;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y-5);ctx.lineTo(x+9,y+3);ctx.lineTo(x+23,y-2);ctx.stroke();}}
 ctx.restore();
}
