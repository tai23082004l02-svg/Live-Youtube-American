"""Read existing runtime alpha to align idle sprites. Does not modify artwork."""
import json,re
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
render=root/'dist/src/render'
def meta(name):
 text=(render/name).read_text(encoding='utf-8')
 return json.loads(text.split('=',1)[1].strip().rstrip(';'))
special={}
for name in ['madara-meta.js','naruto-v2-meta.js','rengoku-meta.js','beerus-meta.js','boa-meta.js','tatsumaki-meta.js','saber-meta.js','ultra-meta.js','jinwoo-meta.js','ichigo-meta.js','gojo-v2-meta.js','sukuna-meta.js']:
 special.update(meta(name))
special['gojo']=special['gojo_v2']
manifest=(root/'dist/src/engine/assets.js').read_text(encoding='utf-8')
mapping=dict(re.findall(r"(?:^|[,\{])([a-z0-9_]+):'([^']+)'",manifest))
mapping['gojo']=mapping['gojo_v2']
ids=['madara','naruto_v2','rengoku','sukuna','goku','vegeta','broly','piccolo','naruto','gojo','sasuke','gogeta','luffy','frieza','gaara','yugi','goku_blue','beerus','ichigo','sung_jinwoo','goku_ultra','saber','tatsumaki','boa_hancock']
out={}
for id in ids:
 cols=special.get(id,{}).get('columns',8 if id in ['gogeta','frieza'] else 6)
 w,h=special.get(id,{}).get('frameSize',[320,224])
 im=Image.open(root/'dist'/mapping[id]).convert('RGBA')
 boxes=[]
 for i in range(cols):
  alpha=im.getchannel('A').crop((i*w,0,(i+1)*w,h))
  box=alpha.point(lambda a:255 if a>=64 else 0).getbbox()
  if box is None:raise ValueError('Empty idle frame '+id)
  boxes.append(list(box))
 out[id]={'frameSize':[w,h],'columns':cols,'height':max(b[3]-b[1] for b in boxes),'width':max(b[2]-b[0] for b in boxes),'bounds':boxes}
(render/'spectator-meta.js').write_text('// Generated from runtime idle alpha; full source cells are always rendered.\nexport const SPECTATOR_META='+json.dumps(out,separators=(',',':'))+';\n',encoding='utf-8')
print('Measured foot anchors for',len(out),'characters; artwork unchanged.')
