from playwright.sync_api import sync_playwright
import shutil,json
from pathlib import Path
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8767/',wait_until='networkidle');page.evaluate('async()=>await window.arena.ready');page.click('#chooseBattle');page.select_option('#pick0','naruto_v2');page.select_option('#pick1','ichigo');page.evaluate('async()=>await window.arena.ready')
 report=page.evaluate('''()=>{const d=window.arena.simulation;while(d.introRemaining)d.step();for(const f of d.fighters){f.rage=0;f.state='idle';f.think=999;f.critChance=f.blockChance=f.dodgeChance=f.blinkChance=f.reactionChance=0;f.y=270;}const [f,t]=d.fighters;f.x=250;t.x=700;d.act(f,'v2rasengan',450,0);const arrival={x:f.x,y:f.y,age:f.age,blink:f.v2Blink};for(let i=0;i<25&&!t.stunUntil;i++)d.step();const stun={tick:d.tick,until:t.stunUntil,duration:(t.stunUntil-d.tick)/60,state:t.state};const point=[t.x,t.y];for(let i=0;i<29;i++)d.step();const held=[t.x,t.y];const remaining=t.stunUntil-d.tick;d.step();return {arrival,stun,point,held,remaining,released:d.tick===t.stunUntil,teleports:d.events.filter(e=>e.type==='teleported'&&e.skill==='v2rasengan').length};}''')
 assert report['arrival']['x']==635 and report['arrival']['blink'];assert report['stun']['duration']==.5;assert report['point']==report['held'];assert report['remaining']==1 and report['released'];assert report['teleports']==1
 page.wait_for_timeout(100);assert not errors,errors
 out=Path('docs/naruto-v2-qa/rasengan-stun.json');out.write_text(json.dumps({'checks':report,'pageErrors':errors,'browser':'Chromium'},indent=2)+'\n');print(json.dumps(report));b.close()
