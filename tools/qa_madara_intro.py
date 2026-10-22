"""Capture the black-to-rising Madara entrance. Serve dist at127.0.0.1:8767."""
from pathlib import Path
import shutil,json
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[1]/'docs/madara-qa';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8767/',wait_until='networkidle');page.evaluate('async()=>await window.arena.ready');page.click('#chooseBattle');page.select_option('#pick0','madara');page.select_option('#pick1','gojo');page.evaluate('async()=>await window.arena.ready');page.click('#start');page.click('#start')
 samples=[]
 for name,age in [('intro-black',.2),('intro-rising',.8),('intro-reveal',1.55),('intro-ready',2.3)]:
  page.evaluate('age=>{const d=window.arena.simulation;d.introRemaining=Math.max(1,150-Math.floor(age*60));for(const f of d.fighters)f.introAge=age;}',age);page.wait_for_timeout(100);page.locator('#game').screenshot(path=str(OUT/(name+'.png')))
  sample=page.evaluate('''()=>{const canvas=document.querySelector('#game'),d=window.arena.simulation;return {tick:d.tick,pixel:Array.from(canvas.getContext('2d').getImageData(480,270,1,1).data)};}''');samples.append({'age':age,**sample})
 assert samples[0]['pixel']==[0,0,0,255],samples
 assert all(s['tick']==0 for s in samples)
 assert not errors,errors
 (OUT/'intro-results.json').write_text(json.dumps({'checks':['solid black opening','translucent rise from below','arena and body gradually revealed','combat remains frozen'],'samples':samples,'pageErrors':errors},indent=2)+'\n');print(json.dumps(samples));b.close()
