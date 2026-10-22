import assert from 'node:assert/strict';
import {setupModeMenu} from '../dist/src/mode-menu.js';
const elements={},classes=new Set();let stopped=0,changes=0;
const $=id=>elements[id]??={hidden:false,focus(){this.focused=true;}};
$('mode').options=['duel','pvp','teams','tournament','live','live_vertical','live_vote'].map(value=>({value}));
$('mode').onchange=()=>{changes++;};
setupModeMenu({$,body:{classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}},stop:()=>stopped++});
assert(classes.has('mode-home'));assert($('appMain').inert);assert($('liveChoices').hidden);
$('chooseLive').onclick();assert($('modeChoices').hidden);assert(!$('liveChoices').hidden);assert.equal(changes,0);
$('modeMenuBack').onclick();assert(!$('modeChoices').hidden);assert($('liveChoices').hidden);
for(const [button,mode,family] of [['chooseVote','live_vote',['live','live_vertical','live_vote']],['chooseBattle','duel',['duel','pvp','teams']],['chooseCup','tournament',['tournament']],['chooseVertical','live_vertical',['live','live_vertical','live_vote']],['chooseHorizontal','live',['live','live_vertical','live_vote']]]){
 $(button).onclick();assert.equal($('mode').value,mode);assert($('modeHome').hidden);assert(!classes.has('mode-home'));assert(!$('appMain').inert);assert(!$('appHeader').inert);
 assert.deepEqual($('mode').options.filter(o=>!o.hidden&&!o.disabled).map(o=>o.value).sort(),family.sort());
 $('openModeMenu').onclick();assert(classes.has('mode-home'));assert(!$('modeHome').hidden);assert($('appMain').inert);assert(!$('modeChoices').hidden);assert($('liveChoices').hidden);
}
assert.equal(stopped,5);assert.equal(changes,5);
console.log('Mode menu passed: initial screen, Live aspect submenu/back, all mode routes, isolated mode families, stop on return, inert/focus controls.');
