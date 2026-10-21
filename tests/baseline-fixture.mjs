// Keep established damage/skill regression tests free of optional combat rolls.
// Default combat behavior is exercised separately in combat-tests.mjs and UI tests.
import {Duel as ArenaDuel} from '../dist/sim.js';
import {DEFAULT_STATS} from '../dist/config.js';
export class Duel extends ArenaDuel {
 constructor(seed,swap,pair,stats={},teams=null){const neutral={dodgeChance:0,blinkChance:0,critChance:0,blockChance:0,damageReduction:0,aggression:100,reactionChance:100};super(seed,swap,pair,Object.fromEntries(Object.entries(DEFAULT_STATS).map(([id,cfg])=>[id,{...cfg,...stats[id],...neutral}])),teams);}
}
