import assert from 'node:assert/strict';
import {drawTeamDialogue,dialogueLayout,dialogueLines,TEAM_DIALOGUE_THEMES} from '../dist/src/render/team-dialogue.js';
import {ULTIMATE_STYLES} from '../dist/src/engine/team-ultimate.js';
import {CHARACTERS} from '../dist/src/characters/index.js';
import {ASSET_MANIFEST} from '../dist/src/engine/assets.js';
const themes=new Set();assert(ASSET_MANIFEST.team_dialogue);
for(const id of Object.keys(CHARACTERS)){
 assert(Object.hasOwn(TEAM_DIALOGUE_THEMES,id));const m=dialogueLayout(id);themes.add(m.name);
 const fighters=Array.from({length:5},(_,i)=>({uid:'A'+i,id:i?'goku':id}));
 const c={elapsed:30,leaderUid:'A0',members:fighters.map(f=>f.uid),team:'A',style:ULTIMATE_STYLES[id]};
 const d={tick:100,teamUltimate:{cinematic:c,attack:null},fighters};const before=JSON.stringify(d),names=Object.fromEntries(Object.entries(CHARACTERS).map(([id,v])=>[id,v.name]));
 const calls=[],portraits=[];let balance=0;
 const ctx=new Proxy({measureText:s=>({width:s.length*11}),save(){balance++;},restore(){balance--;assert(balance>=0);}}, {get(t,k){return k in t?t[k]:(...args)=>{calls.push([k,...args]);for(const n of args)if(typeof n==='number')assert(Number.isFinite(n));};}});
 const images={team_dialogue:{complete:true,naturalWidth:2304}};
 drawTeamDialogue(ctx,images,d,names,(ctx,im,f,x,y,size)=>portraits.push([f.uid,x,y,size]),false);
 assert.equal(balance,0);assert.equal(JSON.stringify(d),before);assert.equal(portraits.length,1);assert.equal(portraits[0][0],c.leaderUid);
 const crop=calls.find(c=>c[0]==='drawImage');assert.deepEqual(crop.slice(2,6),[m.column*1152,m.row*384,1152,384]);
 const text=calls.filter(c=>c[0]==='fillText').map(c=>c[1]);assert(text.includes(names[id].toUpperCase()));assert(!text.includes(c.style.name.toUpperCase()));
 const reduced=[];const orig=ctx.stroke;ctx.stroke=(...args)=>reduced.push(args);drawTeamDialogue(ctx,images,d,names,()=>{},true);assert.equal(reduced.length,0);ctx.stroke=orig;
 d.teamUltimate.cinematic=null;d.teamUltimate.attack={phase:'travel',launch:100,style:ULTIMATE_STYLES[id]};calls.length=0;drawTeamDialogue(ctx,images,d,names,()=>{});assert(calls.some(c=>c[0]==='fillText'&&c[1]===ULTIMATE_STYLES[id].name.toUpperCase()));
}
assert.equal(themes.size,6);assert.deepEqual(dialogueLines({measureText:s=>({width:s.length})},'one two three',7),['one two','three']);
console.log('Team dialogue passed: all15 leaders/six themes, full crops, English names/lines, speaker portrait only, reduced effects, separate launch title, no simulation mutation.');
