"""Exercise Madara AI through the browser's real simulation and renderer."""
from pathlib import Path
import json,shutil
from playwright.sync_api import sync_playwright
out=Path('docs/madara-qa')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8767/',wait_until='networkidle');page.evaluate('async()=>await window.arena.ready');page.click('#chooseBattle');page.select_option('#pick0','madara');page.select_option('#pick1','gojo');page.evaluate('async()=>await window.arena.ready');page.click('#start');page.click('#start')
 result=page.evaluate('''()=>{const d=window.arena.simulation;d.introRemaining=0;const [f,o]=d.fighters;for(const t of d.fighters){t.introAge=null;t.rage=0;t.state='idle';}Object.assign(f,d.clampPosition({x:-9999,y:-9999}));o.x=f.x+65;o.y=f.y+65;f.think=0;f.reactionChance=0;f.limboCd=10;const before={x:f.x,y:f.y,gap:Math.hypot(f.x-o.x,f.y-o.y)};d.step();const escape={x:f.x,y:f.y,gap:Math.hypot(f.x-o.x,f.y-o.y),cooldown:f.madaraEscapeCd};for(let i=0;i<600&&!d.result;i++)d.step();return {before,escape,tick:d.tick,skills:f.skillUses,finite:d.fighters.every(t=>Number.isFinite(t.x)&&Number.isFinite(t.y)&&Number.isFinite(t.hp))};}''')
 page.wait_for_timeout(150);page.locator('#game').screenshot(path=str(out/'ranged-ai.png'));assert result['escape']['cooldown']==8,result;assert result['escape']['gap']>result['before']['gap']+80,result;assert result['finite'];assert not errors,errors
 (out/'ranged-ai-results.json').write_text(json.dumps({'result':result,'pageErrors':errors},indent=2)+'\n');print(json.dumps(result));b.close()
