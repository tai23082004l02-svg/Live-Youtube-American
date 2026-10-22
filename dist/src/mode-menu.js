// Entry navigation only; battle and Live controllers retain their existing rules.
export function setupModeMenu({$,body,stop}){
 const home=$('modeHome'),choices=$('modeChoices'),live=$('liveChoices');
 function focus(id){$(id).focus?.();}
 function show(){stop();home.hidden=false;choices.hidden=false;live.hidden=true;body.classList.add('mode-home');$('appMain').inert=true;$('appHeader').inert=true;focus('chooseBattle');}
 function choose(mode){
  const family=mode.startsWith('live')?'live':mode==='tournament'?'cup':'battle';
  for(const option of $('mode').options||[]){const group=option.value.startsWith('live')?'live':option.value==='tournament'?'cup':'battle';option.hidden=group!==family;option.disabled=group!==family;}
  $('mode').value=mode;
  // Existing onchange cancels old loading/session state and opens the right setup.
  const task=$('mode').onchange();home.hidden=true;body.classList.remove('mode-home');$('appMain').inert=false;$('appHeader').inert=false;
  focus(family==='live'?'liveStart':family==='cup'?'cupCreate':'mode');return task;
 }
 $('chooseBattle').onclick=()=>choose('duel');$('chooseCup').onclick=()=>choose('tournament');
 $('chooseLive').onclick=()=>{choices.hidden=true;live.hidden=false;focus('chooseVertical');};
 $('modeMenuBack').onclick=()=>{choices.hidden=false;live.hidden=true;focus('chooseLive');};
 $('chooseVertical').onclick=()=>choose('live_vertical');$('chooseHorizontal').onclick=()=>choose('live');$('chooseVote').onclick=()=>choose('live_vote');
 $('openModeMenu').onclick=show;home.hidden=false;choices.hidden=false;live.hidden=true;body.classList.add('mode-home');$('appMain').inert=true;$('appHeader').inert=true;
 return {show,choose};
}
