from pathlib import Path
import base64,json,re
r=Path(__file__).resolve().parent/'dist'
h=(r/'index.html').read_text(encoding='utf-8-sig')
css=(r/'style.css').read_text(encoding='utf-8-sig')
sim=(r/'sim.js').read_text(encoding='utf-8-sig').replace('export const','const').replace('export class','class').replace("import {normalizeStats} from './config.js';",'')
audio=(r/'audio.js').read_text(encoding='utf-8-sig').replace('export class','class')
meta=(r/'broly-meta.js').read_text(encoding='utf-8').replace('export const','const')
app=(r/'app.js').read_text(encoding='utf-8-sig')
for line in ["import {DEFAULT_STATS,STAT_LIMITS,normalizeStats} from './config.js';","import {Duel,DT} from './sim.js';","import {ArenaAudio} from './audio.js';","import {BROLY_VFX_META} from './broly-meta.js';","import {AssetLoader,assetsForPair} from './assets.js';","import {BROLY_SPRITE,brolyCastFrame,brolyMuzzle,shotSocket,shotScreenPosition} from './presentation.js';"]:app=app.replace(line,'')
assets={n:'data:image/webp;base64,'+base64.b64encode((r/'assets'/f'{n}.webp').read_bytes()).decode() for n in ['goku','vegeta','broly','broly_vfx']}
asset_code=(r/'assets.js').read_text(encoding='utf-8-sig').replace('export const','const').replace('export function','function').replace('export class','class')
asset_code=asset_code.replace("goku:'assets/goku.webp',vegeta:'assets/vegeta.webp',broly:'assets/broly.webp',broly_vfx:'assets/broly_vfx.webp'","goku:EMBEDDED.goku,vegeta:EMBEDDED.vegeta,broly:EMBEDDED.broly,broly_vfx:EMBEDDED.broly_vfx")
presentation=(r/'presentation.js').read_text(encoding='utf-8-sig').replace('export const','const').replace('export function','function')
configuration=(r/'config.js').read_text(encoding='utf-8-sig').replace('export const','const').replace('export function','function')
code='try{\n'+configuration+'\n'+presentation+'\n'+meta+'\n'+sim+'\n'+audio+'\nconst EMBEDDED='+json.dumps(assets)+';\n'+asset_code+'\n'+app+'\n}catch(error){window.showArenaError(error.message);console.error(error);}'
h=h.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('<script type="module" src="app.js"></script>','<script>'+code+'</script>')
out=r.parent.parent/'outputs';(out/'Down_Arena_Play.html').write_text(h,encoding='utf-8')
(out/'standalone_check.js').write_text('\n'.join(re.findall(r'<script>(.*?)</script>',h,re.S)),encoding='utf-8')
print('HTML bytes:',len(h.encode('utf-8')))
