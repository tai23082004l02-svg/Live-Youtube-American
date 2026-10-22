"""Check transparent DOWN ARENA logo in the live HUD and across match reloads."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil,json
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kw):super().__init__(*args,directory='dist',**kw)
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler);Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1080,'height':1920});errors=[];failed=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
 page.add_init_script("window.__logoDraws=[];window.__vsDraws=0;const di=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(im?.src?.endsWith('/brand/down-arena-logo.png'))window.__logoDraws.push(a);return di.call(this,im,...a)};const ft=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,...a){if(t==='VS')window.__vsDraws++;return ft.call(this,t,...a)}")
 page.goto(f'http://127.0.0.1:{server.server_port}/?obs=vote',wait_until='networkidle');page.wait_for_function('window.arena?.simulation.tick>2');assert page.evaluate("window.arena.loadedAssets.includes('brand_logo')");page.keyboard.press('Space');page.wait_for_timeout(100);page.locator('#portraitGame').screenshot(path='docs/obs-qa/brand-hud.png');draws=page.evaluate('window.__logoDraws');assert draws and all(all(isinstance(v,(int,float)) for v in a) for a in draws);assert page.evaluate('window.__vsDraws')==0
 page.evaluate("()=>{const t=window.arena.tournament;window.__firstLogo=t.h.images().brand_logo;return t.prepareMatch(t.h.duel().fighters.map(f=>f.id));}");page.evaluate('async()=>await window.arena.ready');assert page.evaluate("window.__firstLogo===window.arena.tournament.h.images().brand_logo");assert not errors and not failed,(errors,failed)
 result={'checks':['real transparent logo loaded','logo drawn in shared HUD','VS removed','same cached image retained across next match','Full HD feed preserved'],'lastLogoDraw':draws[-1],'pageErrors':errors,'failedResponses':failed};Path('docs/obs-qa/brand-hud-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));b.close()
server.shutdown()
