"""Offline proof of actual JS image transforms; not a browser/listening QA substitute."""
from pathlib import Path
import subprocess,json
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageColor
ROOT=Path(__file__).resolve().parents[1];folder=ROOT/'art/frames/sukuna'
subprocess.run(['node','tools/qa_sukuna_render.mjs'],cwd=ROOT,check=True)
scenes=json.loads((folder/'runtime_proof_ops.json').read_text());proof=Image.new('RGB',(1440,930),'#17212b')
for i,scene in enumerate(scenes):
    canvas=Image.open(ROOT/'dist/assets/arenas/arena.webp').convert('RGBA').resize((960,540))
    for op in scene['ops']:
        a,b,c,d,e,f=op['matrix']
        if 'key' in op:
            sx,sy,sw,sh,x,y,w,h=op['args'];im=Image.open(ROOT/'dist/assets/characters/sukuna'/(op['key']+'.webp')).convert('RGBA').crop((sx,sy,sx+sw,sy+sh))
            matrix=np.array([[a*w/sw,c*h/sh,a*x+c*y+e],[b*w/sw,d*h/sh,b*x+d*y+f],[0,0,1.]])
            inv=np.linalg.inv(matrix);layer=im.transform((960,540),Image.Transform.AFFINE,tuple(inv[:2].ravel()),Image.Resampling.BICUBIC)
            layer.putalpha(layer.getchannel('A').point(lambda p:round(p*op['alpha'])));canvas.alpha_composite(layer)
        elif 'path' in op:
            layer=Image.new('RGBA',(960,540));draw=ImageDraw.Draw(layer)
            if isinstance(op.get('fill'),dict):
                g=op['fill'];x0,y0,r0,x1,y1,r=g['args'];cx=a*x1+c*y1+e;cy=b*x1+d*y1+f;rr=r*max(abs(a),abs(d));yy,xx=np.indices((540,960));t=np.clip(np.hypot(xx-cx,yy-cy)/max(1,rr),0,1);stops=sorted(g['stops']);colors=[ImageColor.getcolor(color,'RGBA') for _,color in stops];rgba=np.zeros((540,960,4),np.uint8)
                for channel in range(4):rgba[:,:,channel]=np.interp(t,[v[0] for v in stops],[v[channel] for v in colors]).astype(np.uint8)
                layer=Image.fromarray(rgba)
            elif op.get('fill') and len(op['path'])>2:draw.polygon([tuple(p) for p in op['path']],fill=op['fill'])
            elif op.get('stroke') and len(op['path'])>1:draw.line([tuple(p) for p in op['path']],fill=op['stroke'],width=max(1,round(op['width'])))
            layer.putalpha(layer.getchannel('A').point(lambda p:round(p*max(0,min(1,op['alpha'])))));canvas.alpha_composite(layer)
        else:
            draw=ImageDraw.Draw(canvas);font=ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf',int(op['font'].split('px')[0].split()[-1]));draw.text((a*op['x']+c*op['y']+e,b*op['x']+d*op['y']+f),op['text'],font=font,fill=op['fill'],anchor='ls')
    canvas.save(folder/(scene['name']+'_runtime.png'));canvas.thumbnail((480,270));proof.paste(canvas,((i%3)*480,(i//3)*310+26));ImageDraw.Draw(proof).text(((i%3)*480+8,(i//3)*310+6),scene['name'],fill='white')
proof.save(folder/'runtime_proof.png')
print('Offline native renderer proof ready; browser QA remains separate.')
