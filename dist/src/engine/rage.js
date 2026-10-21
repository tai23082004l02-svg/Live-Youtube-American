import {PERSONAL_ULTIMATE_IDS} from './personal-ultimate.js';
export const PASSIVE_RAGE_PER_SECOND=2;
function gain(state,amount,tick){state.rage=Math.min(100,state.rage+amount);if(state.rage>100-1e-9)state.rage=100;if(state.rage===100&&state.readyTick===null)state.readyTick=tick;}
// Called once per combat tick, after intro/cinematic early returns. No wall clock
// or RNG: pause and replay follow the same fixed-step simulation as combat.
export function tickPassiveRage(d,dt){const amount=PASSIVE_RAGE_PER_SECOND*dt;
 for(const f of d.fighters)if(PERSONAL_ULTIMATE_IDS.includes(f.id)&&f.hp>0&&d.tick>=f.rageLockUntil){const state={rage:f.rage,readyTick:f.rageReadyTick};gain(state,amount,d.tick);f.rage=state.rage;f.rageReadyTick=state.readyTick;}
 const u=d.teamUltimate;if(u)for(const team of ['A','B']){const state=u.teams[team];if(d.tick>=state.lockUntil&&d.fighters.some(f=>f.team===team&&f.hp>0))gain(state,amount,d.tick);}
}
