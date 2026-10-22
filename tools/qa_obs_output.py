"""Check OBS Browser Source autostart and native Full HD raster size."""
from pathlib import Path
import json,shutil
from playwright.sync_api import sync_playwright
out=Path('docs/obs-qa');out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for mode in ['vote','vertical']:
  page.goto('http://127.0.0.1:8768/?obs='+mode,wait_until='networkidle');page.wait_for_function('window.arena?.tournament.active && window.arena.simulation.tick>2',timeout=60000)
  data=page.evaluate('''()=>{const c=document.querySelector('#portraitGame'),r=c.getBoundingClientRect(),m=c.getContext('2d').getTransform();return {buffer:[c.width,c.height],display:[r.width,r.height],scale:[m.a,m.d],active:window.arena.tournament.active,paused:window.arena.tournament.paused,tick:window.arena.simulation.tick,body:document.body.className};}''');assert data['buffer']==[1080,1920],data;assert data['display']==[1080,1920],data;assert data['scale']==[2,2],data;assert not data['paused'],data
  page.locator('#portraitGame').screenshot(path=str(out/(mode+'.png')));results.append({'mode':mode,**data})
 assert not errors,errors
 (out/'results.json').write_text(json.dumps({'checks':results,'pageErrors':errors},indent=2)+'\n');print(json.dumps(results));b.close()
