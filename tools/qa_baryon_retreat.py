"""Check real app Baryon relocation; serve dist at127.0.0.1:8767."""
from playwright.sync_api import sync_playwright
import shutil,json
from pathlib import Path
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8767/',wait_until='networkidle');page.evaluate('async()=>await window.arena.ready');page.click('#chooseBattle');page.select_option('#pick0','naruto_v2');page.select_option('#pick1','ichigo');page.evaluate('async()=>await window.arena.ready')
 report=page.evaluate('''()=>{const d=window.arena.simulation;while(d.introRemaining)d.step();const [f,t]=d.fighters;f.x=460;t.x=510;f.y=t.y=270;f.hp=600;const from=[f.x,f.y],enemy=[t.x,t.y];d.step();const to=[f.x,f.y];for(let i=0;i<60;i++)d.step();return {from,to,enemy,clearance:Math.hypot(f.x-t.x,f.y-t.y),transform:d.narutoV2Transform?.kind,tick:d.tick,hp:f.hp,teleports:d.events.filter(e=>e.skill==='v2transform').length};}''')
 assert report['clearance']>250;assert report['transform']=='narutotransform';assert report['tick']==0 and report['hp']==600 and report['teleports']==1
 page.evaluate("document.querySelector('#overlay').style.display='none'");page.wait_for_timeout(120);page.locator('#game').screenshot(path='docs/naruto-v2-qa/baryon-retreat.png');assert not errors,errors
 Path('docs/naruto-v2-qa/baryon-retreat.json').write_text(json.dumps({'checks':report,'pageErrors':errors,'browser':'Chromium'},indent=2)+'\n');print(json.dumps(report));b.close()
