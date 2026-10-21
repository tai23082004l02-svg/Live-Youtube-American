"""Browser QA with real assets/audio. Run the server first; requires Playwright + Chromium.
Forces Ultimate readiness to exercise its complete lifecycle without a long match.
"""
from pathlib import Path
import shutil,os
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'docs'/'rengoku-qa'
OUTPUT.mkdir(parents=True,exist_ok=True)
from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
 page=b.new_page(viewport={'width':1600,'height':1000})
 page.add_init_script('''window.__rengokuSpeechStarts=[];const original=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer?.duration>4.5&&this.buffer.duration<4.7)window.__rengokuSpeechStarts.push({offset:args[1]||0,duration:this.buffer.duration});return original.apply(this,args);};''')
 errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
 page.goto('http://127.0.0.1:8766/',wait_until='networkidle')
 page.evaluate('async()=>await window.arena.ready')
 print('Loaded',errors,flush=True)
 page.click('#chooseBattle')
 page.evaluate('async()=>await window.arena.ready')
 page.select_option('#pick0','rengoku')
 page.evaluate('async()=>await window.arena.ready')
 page.select_option('#statCharacter','rengoku',force=True)
 assert not page.locator('#statPanel_rengoku').evaluate('e=>e.hidden')
 assert page.locator('#stat_rengoku_hp').input_value()=='1300'
 page.click('#start')
 page.wait_for_function('window.arena.simulation.tick>60',timeout=15000)
 page.locator('#game').screenshot(path=str(OUTPUT/'battle.png'))
 page.evaluate("()=>{const d=window.arena.simulation;d.fighters.forEach(f=>{f.rage=0;f.think=999;f.state='idle'});d.fighters[0].rage=100;}")
 page.wait_for_function("window.arena.simulation.personalUltimate.cinematic?.kind==='purgatory'")
 page.wait_for_timeout(1800)
 page.locator('#game').screenshot(path=str(OUTPUT/'cinematic.png'))
 page.click('#start')
 elapsed=page.evaluate('window.arena.simulation.personalUltimate.cinematic.elapsed')
 page.wait_for_timeout(400)
 assert page.evaluate('window.arena.simulation.personalUltimate.cinematic.elapsed')==elapsed
 page.click('#start')
 page.wait_for_function("window.arena.simulation.personalUltimate.attack?.phase==='travel'",timeout=10000)
 page.locator('#game').screenshot(path=str(OUTPUT/'ultimate.png'))
 speech=page.evaluate('window.__rengokuSpeechStarts')
 assert len(speech)>=2 and speech[-1]['offset']>1,speech
 print('Real MP3 decoded / playback / pause / resume',speech,flush=True)
 print('Battle / cinematic / ultimate verified',flush=True)
 page.click('#openModeMenu')
 page.click('#chooseLive')
 page.click('#chooseVertical')
 page.evaluate('async()=>await window.arena.ready')
 page.click('#liveStart')
 page.wait_for_timeout(4000)
 page.locator('#portraitGame').screenshot(path=str(OUTPUT/'vertical.png'))
 page.keyboard.press('Escape')
 page.click('#liveStop')
 print('Vertical Live startup verified',flush=True)
 print('Errors',errors,'Failed assets',failed,flush=True)
 assert not errors and not failed
 (OUTPUT/'results.json').write_text(json.dumps({'browser':'Chromium headless','checks':['real asset loading','Rengoku selection and stats','battle','Ultimate cinematic','real MP3 decode and playback scheduling','pause/resume','Ultimate dash','vertical Live startup and stop'],'pageErrors':errors,'failedResponses':failed,'speechStarts':speech,'subjectiveListening':False},indent=2)+'\n')
 b.close()
