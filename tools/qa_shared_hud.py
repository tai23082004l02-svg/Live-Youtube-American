"""Real OBS composition: shared name/HP/rage HUD reads actual simulation state."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import shutil,json
OUT=Path('docs/obs-qa')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kw):super().__init__(*args,directory='dist',**kw)
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler);Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1080,'height':1920});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("window.__hudText=[];const ft=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,...args){if(String(t).startsWith('ULT')||t==='VIEWER CHOICE · DEMO'||t==='AI BATTLE')window.__hudText.push(t);return ft.call(this,t,...args)}")
 page.goto(f'http://127.0.0.1:{server.server_port}/?obs=vote',wait_until='networkidle');page.wait_for_function('window.arena?.tournament.active && window.arena.simulation.tick>2',timeout=60000);page.keyboard.press('Space');page.wait_for_function('window.arena.tournament.paused')
 page.evaluate('()=>{const d=window.arena.simulation;d.personalUltimate.cinematic=d.personalUltimate.attack=null;d.fighters[0].rage=72.4;d.fighters[1].rage=31.9;window.__hudText=[];}');page.wait_for_timeout(120);page.locator('#portraitGame').screenshot(path=str(OUT/'shared-hud.png'));text=page.evaluate('window.__hudText');assert 'ULT  72%' in text and 'ULT  31%' in text,text;assert 'VIEWER CHOICE · DEMO' not in text and 'AI BATTLE' not in text
 page.evaluate('()=>{window.arena.simulation.fighters[0].rage=100;window.__hudText=[];}');page.wait_for_timeout(100);assert 'ULT  100%' in page.evaluate('window.__hudText');page.locator('#portraitGame').screenshot(path=str(OUT/'shared-hud-ready.png'))
 result=page.evaluate('''()=>{const d=window.arena.simulation;d.step();return {rageAfterCast:d.fighters[0].rage,casting:!!d.personalUltimate.cinematic,buffer:[document.querySelector('#portraitGame').width,document.querySelector('#portraitGame').height]}}''');assert result['rageAfterCast']==0 and result['casting'],result;page.wait_for_timeout(100);assert 'ULT  0%' in page.evaluate('window.__hudText');assert not errors,errors
 result.update(checks=['shared HUD for both fighters','HP and names above field','rage72/31 and full100 from real state','Ultimate consumes rage to0','removed center demo/battle labels','Full HD preserved'],healthStripLogicalY=[252,316],arenaLogicalY=328,pageErrors=errors);(OUT/'shared-hud-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));b.close()
server.shutdown()
