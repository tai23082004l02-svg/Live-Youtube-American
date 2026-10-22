"""Exercise the Pages-backed wrapper using a mocked remote Pages deployment."""
import importlib.util
import io
import json
import mimetypes
import shutil
import threading
from pathlib import Path
from urllib.parse import urlparse, unquote
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('bridge',ROOT/'tools/youtube-chat/bridge.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
m.urlopen=lambda *args,**kwargs:io.BytesIO((ROOT/'dist/index.html').read_bytes())
server=m.ThreadingHTTPServer(('127.0.0.1',8765),m.Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
  page=browser.new_page();errors=[];remote=[];responses=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:responses.append(r.json()) if r.url.endswith('/api/votes') and r.status==200 else None)
  def asset(route):
   rel=unquote(urlparse(route.request.url).path).removeprefix('/Live-Youtube-American/dist/')
   file=(ROOT/'dist'/rel).resolve()
   assert file.is_relative_to((ROOT/'dist').resolve())
   remote.append(rel)
   route.fulfill(status=200 if file.is_file() else 404,body=file.read_bytes() if file.is_file() else b'',content_type=mimetypes.guess_type(file)[0] or 'application/octet-stream',headers={'Access-Control-Allow-Origin':'*'})
  page.route(m.GAME_ORIGIN+'/Live-Youtube-American/dist/**',asset)
  page.add_init_script("window.titleDraws=[];const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(im?.src?.includes('/ko.webp'))window.titleDraws.push(im.src);return draw.call(this,im,...args)};window.voteText=[];const fill=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,...args){if(String(t).startsWith('SUBSCRIBE'))window.voteText.push({text:t,font:this.font,y:args[1]});return fill.call(this,t,...args)};")
  page.add_init_script("localStorage.setItem('down-arena-hp-multiplier-v1','10');localStorage.setItem('down-arena-hp-x10-enabled-v1','1');")
  page.goto(m.BASE+'/online/?obs=vote&chat=1')
  page.wait_for_function('window.arena?.simulation?.fighters.length===2',timeout=60000)
  page.wait_for_timeout(2500)
  assert page.locator('#globalHpMultiplier').input_value()=='5'
  assert page.evaluate('window.arena.simulation.fighters.every(f=>f.max===window.arena.stats[f.id].hp*5)')
  assert m.BRIDGE.votes.open
  assert m.BRIDGE.votes.choices==10
  m.BRIDGE.votes.receive({'snippet':{'type':'textMessageEvent','authorChannelId':'remote-qa','publishedAt':datetime.now(timezone.utc).isoformat(),'textMessageDetails':{'messageText':'2'}}})
  page.wait_for_timeout(1800)
  assert any(any(v['viewer']=='remote-qa' for v in r.get('votes',[])) for r in responses)
  assert 'src/app.js' in remote and any(x.startswith('assets/') for x in remote)
  assert page.evaluate('document.baseURI')==m.GAME_ORIGIN+'/Live-Youtube-American/dist/'
  assert page.evaluate("window.voteText.some(x=>x.text==='SUBSCRIBE TO THE CHANNEL TO CHAT & VOTE' && x.font.includes('Times New Roman') && x.y===801)"), 'Subscriber instruction not rendered'
  assert not errors,errors
  for origin,code in [(m.GAME_ORIGIN,204),('https://evil.example',403)]:
   assert page.request.fetch(m.BASE+'/api/votes',method='OPTIONS',headers={'Origin':origin,'Access-Control-Request-Method':'POST'}).status==code
  assert page.request.post(m.BASE+'/api/connect',headers={'Origin':m.GAME_ORIGIN},data='{}').status==403
  page.evaluate("window.previousMatch=window.arena.simulation;window.arena.simulation.fighters[1].hp=0;window.arena.simulation.result='teamA'")
  page.wait_for_function('window.titleDraws.length>0',timeout=10000)
  page.wait_for_function('window.arena.simulation!==window.previousMatch',timeout=3500)
  print(json.dumps({'remote_assets':len(remote),'live_ballot':True,'vote_delivered':True,'errors':errors,'cors_and_credential_isolation':'PASS'}))
  browser.close()
finally:
 server.shutdown()
