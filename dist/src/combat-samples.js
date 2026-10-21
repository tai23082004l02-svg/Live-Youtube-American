const WEAPONS=new Set(['rengoku','ichigo','saber','sung_jinwoo','sasuke']);
const ENERGY=new Set(['flametiger','fire','beam','special','instantblue','bigbang','light','purple','red','fireball','deathbeam','darkmagic','destruction','stardust','stardustfall','hellzone','hellzoneFire']);
const GROUPS=['sword_swing','sword_hit','punch','heavy_hit','energy_launch','energy_hit','sword_block'];
export class CombatSamples{
 constructor(){this.buffers=new Map();this.cursor=new Map();this.loading=null;}
 load(ctx){if(this.loading||!ctx?.decodeAudioData||typeof window.fetch!=='function')return;
  this.loading=Promise.all(GROUPS.flatMap(group=>[1,2,3].map(async variant=>{const key=group+'_'+variant;try{const response=await window.fetch('assets/audio/sfx/'+key+'.wav');if(!response.ok)return;const buffer=await ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(key,buffer);}catch{/* Existing synthesized audio is the fallback. */}})));
 }
 pick(type,heavy,event){const weapon=WEAPONS.has(event.source||event.id),state=event.attackState||'',energy=ENERGY.has(state);
  const group=type==='melee'?(weapon?'sword_swing':null):type==='hit'?(heavy?'heavy_hit':energy?'energy_hit':weapon?'sword_hit':'punch'):type==='block'?(WEAPONS.has(event.id)?'sword_block':null):ENERGY.has(type)?'energy_launch':null;
  if(!group)return null;const n=(this.cursor.get(group)||0)%3+1,buffer=this.buffers.get(group+'_'+n);if(!buffer)return null;this.cursor.set(group,n);return {group,buffer};
 }
}
