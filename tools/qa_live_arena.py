"""Headless browser smoke/visual captures of the local game only."""
from pathlib import Path
import json,mimetypes,sys
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 print('Launching browser',flush=True)
 browser=p.chromium.launch(headless=True,timeout=15000)
 page=browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1)
 if '--offline' in sys.argv:
  from urllib.parse import urlparse,unquote
  def serve(route):
   path=(root/'dist'/unquote(urlparse(route.request.url).path).lstrip('/')).resolve()
   if path==(root/'dist').resolve():path=path/'index.html'
   if not path.is_relative_to((root/'dist').resolve()) or not path.is_file():route.fulfill(status=404,body='Not found');return
   route.fulfill(body=path.read_bytes(),content_type=mimetypes.guess_type(path)[0] or 'application/octet-stream')
  page.route('**/*',serve)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 print('Loading game',flush=True)
 page.goto('http://127.0.0.1:8766/?build=live-arena-1',wait_until='networkidle',timeout=15000)
 page.evaluate('async()=>await window.arena.ready')
 assert page.locator('#buildVersion').inner_text().startswith('LIVE ARENA')
 page.select_option('#mode','live')
 page.evaluate('async()=>await window.arena.ready')
 page.click('#liveStart')
 page.wait_for_function("window.arena.tournament.phase==='intro'",timeout=30000)
 page.wait_for_timeout(500)
 assert page.locator('body').evaluate("e=>e.classList.contains('live-view')")
 assert page.locator('#livePanel').is_hidden()
 box=page.locator('#arena').bounding_box();assert abs(box['width']/box['height']-16/9)<.001
 page.screenshot(path=str(root/'docs/live-arena-intro.png'))
 page.wait_for_function("window.arena.tournament.phase==='battle'",timeout=10000)
 page.keyboard.press('Space');assert page.evaluate('window.arena.tournament.paused')
 tick=page.evaluate('window.arena.simulation.tick');page.wait_for_timeout(350);assert page.evaluate('window.arena.simulation.tick')==tick
 page.keyboard.press('Space');assert not page.evaluate('window.arena.tournament.paused')
 page.wait_for_timeout(3000)
 page.screenshot(path=str(root/'docs/live-arena-battle.png'))
 page.evaluate("()=>{const d=window.arena.simulation;d.fighters.filter(f=>f.team==='B').forEach(f=>f.hp=0);d.result='teamA';}")
 page.wait_for_timeout(1500)
 page.screenshot(path=str(root/'docs/live-arena-victory.png'))
 page.wait_for_function("window.arena.tournament.phase==='waiting'",timeout=10000)
 page.screenshot(path=str(root/'docs/live-arena-bracket.png'))
 page.keyboard.press('Escape')
 assert not page.locator('body').evaluate("e=>e.classList.contains('live-view')")
 assert page.locator('#livePanel').is_visible()
 page.click('#liveStop')
 assert not page.evaluate('window.arena.tournament.active')
 assert not errors,errors
 (root/'docs/live-arena-browser-results.json').write_text(json.dumps({'browser':'Chromium headless','source':'intercepted local files' if '--offline' in sys.argv else 'localhost server','viewport':'1920x1080','checks':['version','real asset load','clean16:9 intro','Space pause/resume','battle','victory','next bracket','Esc operator controls','stop'],'pageErrors':errors,'listeningQA':False},indent=2),encoding='utf-8')
 browser.close()
print('Browser PASS: real assets, clean16:9, intro/battle/victory/bracket, pause/resume/Esc/stop; no page errors. Listening unverified.')
