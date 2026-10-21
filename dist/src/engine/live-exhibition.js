import {drawEntrants} from './tournament.js';

export function exhibitionRoster(names,seed){const size=drawEntrants([1,2,5],seed+'-FORMAT')[0],pool=drawEntrants(Object.keys(names),seed+'-ROSTER');return {size,players:pool.length>=size*2?pool.slice(0,size*2):[...pool.slice(0,size),...drawEntrants(Object.keys(names),seed+'-TEAM-B').slice(0,size)]};}
// A single exhibition presents the same configuration interface as a cup.
export class LiveExhibition{
 constructor(names,seed,settings={}){const {size,players}=exhibitionRoster(names,seed);this.size=size;this.settings={...settings,seed};this.entries=['A','B'].map((team,i)=>({name:size===1?names[players[i]]:'TEAM '+team,players:players.slice(i*size,(i+1)*size),wins:0,damage:0,kos:0}));this.matches=[{index:0,round:0,entrants:[0,1],winner:null,result:null,replays:0}];this.champion=null;}
 get current(){return this.matches[0].winner===null?this.matches[0]:null;}
 battleConfig(){return {...this.settings,seed:this.settings.seed+'-R'+this.matches[0].replays,pair:this.entries.flatMap(e=>e.players),teams:this.entries.flatMap((e,i)=>e.players.map(()=>i?'B':'A')),teamUltimateEnabled:this.size>1&&this.settings.teamUltimateEnabled!==false};}
 record(result){if(result==='draw'){this.matches[0].replays++;return false;}const winner=result==='teamA'?0:1;this.matches[0].winner=winner;this.matches[0].result=result;this.entries[winner].wins++;this.champion=winner;return true;}
}

export function liveCupEntrants(names,seed){const pool=drawEntrants(Object.entries(names).map(([id,name])=>({name,players:[id]})),seed);if(!pool.length)throw new Error('No active fighters');return Array.from({length:8},(_,i)=>pool[i%pool.length]);}
