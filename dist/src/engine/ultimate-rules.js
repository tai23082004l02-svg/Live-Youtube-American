import {MADARA_VOICE_STEPS} from './madara-voice.js';
export const MADARA_ULTIMATE_CINEMATIC_STEPS=MADARA_VOICE_STEPS;
import {VOICE_STEPS as NARUTO_V2_KCM_STEPS} from './naruto-v2-kcm-voice.js';
import {VOICE_STEPS as NARUTO_V2_BARYON_STEPS} from './naruto-v2-baryon-voice.js';
export {NARUTO_V2_KCM_STEPS,NARUTO_V2_BARYON_STEPS};
import {RENGOKU_VOICE_STEPS} from './rengoku-voice.js';
export const RENGOKU_ULTIMATE_CINEMATIC_STEPS=RENGOKU_VOICE_STEPS;
export const ULTIMATE_CINEMATIC_STEPS=120;
export const ULTIMATE_DAMAGE_MULTIPLIER=2;

export const ULTRA_ULTIMATE_VOICE_SECONDS=4;
export const ULTRA_ULTIMATE_CINEMATIC_STEPS=Math.ceil(ULTRA_ULTIMATE_VOICE_SECONDS*60);
export function cinematicSteps(c){return c?.durationSteps??ULTIMATE_CINEMATIC_STEPS;}

export const ICHIGO_ULTIMATE_CINEMATIC_STEPS=Math.ceil(3.04*60);

export const SABER_ULTIMATE_CINEMATIC_STEPS=125;
export const TEAM_VOICE_STEPS={madara:MADARA_VOICE_STEPS,naruto_v2:NARUTO_V2_KCM_STEPS,rengoku:RENGOKU_VOICE_STEPS,sukuna:245,goku_ultra:240,ichigo:183,sung_jinwoo:120,saber:125,tatsumaki:149,boa_hancock:135,gojo:197};

export const TATSUMAKI_ULTIMATE_CINEMATIC_STEPS=149;
export const BOA_ULTIMATE_CINEMATIC_STEPS=135;

export const GOJO_ULTIMATE_CINEMATIC_STEPS=197;

export const SUKUNA_ULTIMATE_CINEMATIC_STEPS=245;
