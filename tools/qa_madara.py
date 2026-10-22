"""Chromium QA of real Madara assets/audio and public app flows. Serve dist at port8767."""
from pathlib import Path
import json,shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/madara-qa';OUT.mkdir(exist_ok=True)
voice=json.loads((ROOT/'dist/assets/audio/voices/madara_ultimate_ja.json').read_text())['duration']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required']);page=b.new_page(viewport={'width':1600,'height':1000});errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
 page.add_init_script('window.__madaraVoiceDuration='+str(voice)+''';window.__madaraVoices=[];const old=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){if(Math.abs((this.buffer?.duration||0)-window.__madaraVoiceDuration)<.01)window.__madaraVoices.push({duration:this.buffer.duration,offset:a[1]||0});return old.apply(this,a);};''')
 page.goto('http://127.0.0.1:8767/',wait_until='networkidle');page.evaluate('async()=>await window.arena.ready');page.click('#chooseBattle');page.select_option('#pick0','madara');page.select_option('#pick1','gojo');page.evaluate('async()=>await window.arena.ready')
 page.select_option('#statCharacter','madara',force=True);assert not page.locator('#statPanel_madara').evaluate('e=>e.hidden');assert page.locator('#stat_madara_hp').input_value()=='1350'
 page.click('#start');page.wait_for_timeout(900);page.locator('#game').screenshot(path=str(OUT/'intro.png'));page.wait_for_function('window.arena.simulation.tick>2');page.click('#start')
 def setup():
  page.evaluate("()=>{const d=window.arena.simulation;d.personalUltimate.cinematic=d.personalUltimate.attack=null;d.shots=[];for(const f of d.fighters){f.think=999;f.rage=0;f.state='idle';f.age=0;f.x=f.id==='madara'?300:650;f.y=280;f.hp=f.max=10000;f.critChance=f.blockChance=f.dodgeChance=f.blinkChance=f.reactionChance=0;if(f.id==='gojo')f.infinityChance=0;if(f.id==='madara')f.limboShadows=[];}}")
 setup();page.wait_for_timeout(100);page.locator('#game').screenshot(path=str(OUT/'battle.png'))
 for skill in ['truthorbs','lightfang','limbo']:
  setup();page.evaluate("skill=>{const d=window.arena.simulation;d.act(d.fighters[0],skill,1,0);}",skill);page.click('#start')
  if skill=='truthorbs':page.wait_for_function('window.arena.simulation.shots.length>=2')
  elif skill=='lightfang':page.wait_for_function("window.arena.simulation.shots.some(s=>s.kind==='lightfang'&&s.x>window.arena.simulation.fighters[0].x+220)")
  else:page.wait_for_function('window.arena.simulation.fighters[0].limboShadows.length===1')
  page.click('#start');page.locator('#game').screenshot(path=str(OUT/(skill+'.png')))
 setup();page.evaluate('()=>window.arena.simulation.fighters[0].rage=100');page.click('#start');page.wait_for_function("window.arena.simulation.personalUltimate.cinematic?.kind==='meteor'");page.wait_for_timeout(250);page.locator('#game').screenshot(path=str(OUT/'cinematic.png'));page.click('#start');elapsed=page.evaluate('window.arena.simulation.personalUltimate.cinematic.elapsed');page.wait_for_timeout(300);assert page.evaluate('window.arena.simulation.personalUltimate.cinematic.elapsed')==elapsed;page.click('#start')
 page.wait_for_function("window.arena.simulation.personalUltimate.attack?.phase==='warning'");page.locator('#game').screenshot(path=str(OUT/'warning.png'));page.wait_for_function("window.arena.simulation.personalUltimate.attack?.phase==='travel'");page.wait_for_timeout(320);page.locator('#game').screenshot(path=str(OUT/'meteor.png'));page.wait_for_function("window.arena.simulation.events.some(e=>e.type==='madaraMeteorImpact')");page.locator('#game').screenshot(path=str(OUT/'impact.png'));page.click('#start')
 calls=page.evaluate('window.__madaraVoices');assert len(calls)>=2 and any(c['offset']>.1 for c in calls),calls
 page.select_option('#mode','teams');page.select_option('#teamPickA0','madara');page.evaluate('async()=>await window.arena.ready');page.click('#start');page.wait_for_function('window.arena.simulation.tick>1');page.click('#start');page.evaluate("()=>{const d=window.arena.simulation;for(const f of d.fighters){f.rage=0;f.think=999;f.state='idle';}d.fighters[0].damage=999;d.teamUltimate.teams.A.rage=100;}");page.click('#start');page.wait_for_function("window.arena.simulation.teamUltimate.cinematic?.style.name==='United Tengai Shinsei'");page.wait_for_timeout(250);page.locator('#game').screenshot(path=str(OUT/'team-cinematic.png'));page.wait_for_function("window.arena.simulation.teamUltimate.attack?.phase==='travel'");page.wait_for_timeout(300);page.locator('#game').screenshot(path=str(OUT/'team-meteor.png'));page.click('#start')
 page.click('#openModeMenu');page.click('#chooseLive');page.click('#chooseVote');page.evaluate('async()=>await window.arena.ready');page.click('#liveStart');page.wait_for_timeout(3200);page.locator('#portraitGame').screenshot(path=str(OUT/'live-vote.png'));page.keyboard.press('Escape');page.click('#liveStop')
 print('Errors',errors,'Failed assets',failed,'Voice calls',calls,flush=True);assert not errors and not failed
 (OUT/'results.json').write_text(json.dumps({'checks':['real assets','stats panel','2.5s entrance','orb barrage','Light Fang beam','Limbo phantom','personal meteor cinematic/warning/fall/impact','real MP3 decode and scheduling','pause/resume','team cinematic/meteor','Live voting startup'],'voiceSources':calls,'pageErrors':errors,'failedResponses':failed,'subjectiveListening':False},indent=2)+'\n');b.close()
