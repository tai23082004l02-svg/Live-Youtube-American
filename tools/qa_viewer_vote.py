"""Real-browser voting QA. Start a static server on port8767 first.
Requires Playwright and Chromium. Fixtures accelerate voting and match completion.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path(__file__).resolve().parents[1]/'docs/viewer-vote-qa';out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1080,'height':1920})
 errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
 page.goto('http://127.0.0.1:8767/',wait_until='networkidle')
 page.click('#chooseLive');page.click('#chooseVote');page.evaluate('async()=>await window.arena.ready')
 assert page.locator('#voteControls').is_visible()
 page.uncheck('#voteDemoAuto');page.click('#liveStart');page.evaluate('async()=>await window.arena.ready')
 page.wait_for_timeout(700)
 print('started',page.evaluate('({mode:document.getElementById("mode").value,phase:window.arena.tournament.phase,ballot:window.arena.tournament.ballot?.ids,loaded:window.arena.loadedAssets})'),flush=True)
 assert page.evaluate('window.arena.tournament.ballot.ids.length')==6
 box=page.locator('#portraitGame').bounding_box();assert abs(box['width']/box['height']-9/16)<.001,box
 assert page.evaluate('window.arena.simulation.arena.layout')!='portrait'
 page.locator('#portraitGame').screenshot(path=str(out/'broadcast.png'))
 page.set_viewport_size({'width':393,'height':852})
 box=page.locator('#portraitGame').bounding_box();assert box['width']<=393 and box['height']<=852
 page.screenshot(path=str(out/'phone.png'))
 page.set_viewport_size({'width':1080,'height':1920})
 # Operator preview applies one mutable vote per viewer.
 page.keyboard.press('Escape');page.fill('#voteTestViewer','alice');page.select_option('#voteTestNumber','1');page.click('#voteTestCast');page.select_option('#voteTestNumber','2');page.click('#voteTestCast')
 assert page.evaluate('window.arena.tournament.ballot.votes.size')==1
 assert page.evaluate('window.arena.tournament.ballot.rows[1].count')==1
 # Pause freezes both timer and battle.
 page.click('#liveStart');before=page.evaluate('window.arena.tournament.ballot.remaining');page.wait_for_timeout(350);assert page.evaluate('window.arena.tournament.ballot.remaining')==before
 page.click('#liveStart')
 page.wait_for_function('window.arena.tournament.phase==="battle"',timeout=10000)
 page.evaluate("()=>{const u=window.arena.tournament;u.ballot.cast('bob',3);u.ballot.cast('charlie',3);u.ballot.remaining=.1;}")
 page.wait_for_function('window.arena.tournament.ballot.locked')
 winners=page.evaluate('window.arena.tournament.ballot.winners')
 assert page.evaluate('window.arena.tournament.matchNumber')==1
 page.evaluate("()=>{const d=window.arena.simulation;d.fighters.filter(f=>f.team==='B').forEach(f=>f.hp=0);d.result='teamA';}")
 page.wait_for_function('window.arena.tournament.matchNumber===2',timeout=15000);page.evaluate('async()=>await window.arena.ready')
 assert page.evaluate('window.arena.simulation.fighters.map(f=>f.id)')==winners
 assert not page.evaluate('window.arena.tournament.ballot.locked')
 assert page.evaluate('window.arena.tournament.voteRound')==2
 page.keyboard.press('Escape');page.click('#liveStop');page.evaluate('async()=>await window.arena.ready')
 # Return to a normal mode; no broadcast styling or queued match persists.
 page.click('#openModeMenu');page.click('#chooseBattle');page.evaluate('async()=>await window.arena.ready')
 assert not page.evaluate('document.body.classList.contains("vote-view")')
 assert not page.locator('#game').evaluate('e=>e.hidden')
 print('errors',errors,'failed',failed,flush=True)
 assert not errors and not failed
 (out/'results.json').write_text(json.dumps({'checks':['real assets','portrait frame/horizontal arena','operator vote replacement','pause timer','lock retains current match','top-two next match','new round','stop and mode cleanup'],'pageErrors':errors,'failedResponses':failed},indent=2))
 mobile=browser.new_context(viewport={'width':393,'height':852},is_mobile=True,has_touch=True,device_scale_factor=1)
 phone=mobile.new_page();phone.on('pageerror',lambda e:errors.append(str(e)))
 phone.goto('http://127.0.0.1:8767/',wait_until='networkidle');phone.click('#chooseLive');phone.click('#chooseVote');phone.evaluate('async()=>await window.arena.ready');phone.click('#liveStart');phone.evaluate('async()=>await window.arena.ready')
 assert phone.locator('#voteTouchControls').is_visible()
 phone.screenshot(path=str(out/'phone-touch.png'))
 phone.locator('#voteTouchControls').tap();assert phone.locator('#voteControls').is_visible()
 assert not errors
 mobile.close()
 browser.close()
