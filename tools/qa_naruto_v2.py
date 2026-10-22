"""Real Chromium QA; serve dist on port 8767 before running."""
from pathlib import Path
import json,os,shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/naruto-v2-qa';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
 page=b.new_page(viewport={'width':1600,'height':1000});errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
 page.add_init_script('''window.__voices=[];const old=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){if(this.buffer?.duration>1)window.__voices.push({duration:this.buffer.duration,offset:a[1]||0});return old.apply(this,a);};''')
 page.goto('http://127.0.0.1:8767/',wait_until='networkidle');page.evaluate('async()=>await window.arena.ready')
 page.click('#chooseBattle');page.select_option('#pick0','naruto_v2');page.select_option('#pick1','gojo');page.evaluate('async()=>await window.arena.ready')
 page.select_option('#statCharacter','naruto_v2',force=True);assert not page.locator('#statPanel_naruto_v2').evaluate('e=>e.hidden');assert page.locator('#stat_naruto_v2_hp').input_value()=='1400'
 page.click('#start');page.wait_for_timeout(700);page.locator('#game').screenshot(path=str(OUT/'sage-to-kcm.png'))
 page.wait_for_function('window.arena.simulation.tick>2');page.click('#start')
 page.evaluate("()=>{const d=window.arena.simulation;d.fighters.forEach(f=>{f.think=999;f.rage=0;f.state='idle';f.x=f.id==='naruto_v2'?300:600;f.y=280;});}")
 page.locator('#game').screenshot(path=str(OUT/'kcm.png'))
 page.evaluate("()=>{const d=window.arena.simulation;d.fighters[1].hp=d.fighters[1].max=10000;d.fighters[0].rage=100;}");page.click('#start')
 page.wait_for_function("window.arena.simulation.personalUltimate.cinematic?.kind==='kuramarasengan'");page.wait_for_timeout(700);page.locator('#game').screenshot(path=str(OUT/'kcm-ultimate.png'))
 page.wait_for_function('!window.arena.simulation.personalUltimate.cinematic&&!window.arena.simulation.personalUltimate.attack',timeout=15000)
 page.evaluate("()=>{const e=document.querySelector('#speed');e.add(new Option('QA 4x','4'));e.value='4';}");page.evaluate("()=>{const d=window.arena.simulation;d.fighters[0].hp=650;d.fighters.forEach(f=>{f.think=999;f.state='idle';f.rage=0;});}")
 page.wait_for_function('!!window.arena.simulation.narutoV2Transform');page.wait_for_timeout(500);page.click('#start');elapsed=page.evaluate('window.arena.simulation.narutoV2Transform.elapsed');tick=page.evaluate('window.arena.simulation.tick');page.wait_for_timeout(300);assert page.evaluate('window.arena.simulation.narutoV2Transform.elapsed')==elapsed
 page.locator('#game').screenshot(path=str(OUT/'transform.png'));page.click('#start');page.wait_for_timeout(250);assert page.evaluate('window.arena.simulation.narutoV2Transform.elapsed')<elapsed+30,'transformation is wall-clock timed at4x'
 page.wait_for_function('window.arena.simulation.fighters[0].baryon',timeout=10000);assert page.evaluate('window.arena.simulation.fighters[0].hp')==650
 page.click('#start');page.locator('#game').screenshot(path=str(OUT/'baryon.png'));page.evaluate('()=>window.arena.simulation.fighters[0].rage=100');page.click('#start');page.wait_for_function("window.arena.simulation.personalUltimate.cinematic?.kind==='finalimpact'");page.wait_for_timeout(800);page.locator('#game').screenshot(path=str(OUT/'baryon-ultimate.png'))
 page.wait_for_function("window.arena.simulation.personalUltimate.attack?.phase==='travel'",timeout=10000)
 page.locator('#game').screenshot(path=str(OUT/'final-impact.png'));page.click('#start')
 # Exercise the actual projectile and clones render paths after returning to KCM.
 page.evaluate("()=>{const d=window.arena.simulation,f=d.fighters[0];d.personalUltimate.attack=null;f.baryon=false;f.think=999;d.act(f,'rasenshuriken',1,0);}")
 page.click('#start');page.wait_for_timeout(300);page.click('#start')
 page.evaluate("()=>{const d=window.arena.simulation;d.act(d.fighters[0],'shadowassault',1,0);}");page.click('#start');page.wait_for_function('window.arena.simulation.clones.length===2',timeout=5000);page.click('#start');page.locator('#game').screenshot(path=str(OUT/'clones.png'))
 page.click('#openModeMenu');page.click('#chooseLive');page.click('#chooseVote');page.evaluate('async()=>await window.arena.ready');page.click('#liveStart');page.wait_for_timeout(3500);page.locator('#portraitGame').screenshot(path=str(OUT/'live-vote.png'));page.keyboard.press('Escape');page.click('#liveStop')
 print('Errors',errors,'Failed',failed,flush=True);assert not errors and not failed
 voices=page.evaluate('window.__voices');assert all(any(abs(v['duration']-seconds)<.01 for v in voices) for seconds in [2.88,2.4,1.68]);assert any(abs(v['duration']-2.4)<.01 and v['offset']>.3 for v in voices);print('Voice sources',voices,flush=True)
 (OUT/'results.json').write_text(json.dumps({'checks':['real asset loading','stats panel','Sage to KCM intro','KCM Ultimate','Baryon threshold and unchanged HP','transformation wall-clock timing at4x','pause/resume','Baryon Ultimate','projectile and clones renderer','Live voting startup'],'pageErrors':errors,'failedResponses':failed,'voiceSources':voices,'subjectiveListening':False},indent=2)+'\n');b.close()
