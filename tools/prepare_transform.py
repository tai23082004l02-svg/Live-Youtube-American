"""Cut the user's six-pose charging strip into engine-sized aligned frames."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
ROOT=Path(__file__).resolve().parents[1]
source=Image.open(ROOT/'art/sources/naruto_transform.png').convert('RGBA')
out=ROOT/'art/frames/naruto_transform';out.mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(1920,224));preview=Image.new('RGB',(1200,160),'#202b3b');draw=ImageDraw.Draw(preview)
# Identical scaling across poses; body feet and forehead protector anchor each pose.
scale=.27
entries=[]
for i in range(6):
    left=round(source.width*i/6);right=round(source.width*(i+1)/6)
    crop=source.crop((left,0,right,source.height));a=np.array(crop)
    a[a[:,:,3]<12]=0
    # Brown sandals / dark trouser outlines stop the golden aura changing the foot baseline.
    yy,xx=np.indices(a.shape[:2]);solid=a[:,:,3]>180
    feet=solid&(yy>source.height*.65)&(a[:,:,2]<130)&(a[:,:,0]<170)
    fy,fx=np.where(feet);base=int(np.percentile(fy,98)) if len(fy) else int(np.where(solid)[0].max())
    face=solid&(yy>source.height*.25)&(yy<source.height*.5)&(a[:,:,2]>80)&(a[:,:,2]<220)&(a[:,:,0]>150)
    py,px=np.where(face);pivot=int(np.median(px)) if len(px) else crop.width//2
    tile=Image.fromarray(a).resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
    frame=Image.new('RGBA',(320,224));frame.alpha_composite(tile,(160-round(pivot*scale),192-round(base*scale)))
    frame.save(out/f'transform_{i:02d}.png');atlas.alpha_composite(frame,(i*320,0));entries.append({'rect':[i*320,0,320,224],'anchor':[160,192]})
    thumb=frame.resize((200,140));preview.paste(thumb,(i*200,18),thumb);draw.text((i*200+3,2),str(i),fill='white')
atlas.save(ROOT/'art/atlases/naruto_transform.png');atlas.save(ROOT/'dist/assets/characters/naruto/naruto_transform.webp',lossless=True,method=6)
preview.save(out/'contact.png');(out/'atlas.json').write_text(json.dumps({'frameSize':[320,224],'animations':{'transform':entries}},indent=2))
print('6 aligned charging frames prepared.')
