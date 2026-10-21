"""Rebuild normal Naruto + the three used VFX rows from user-supplied sheets."""
from pathlib import Path
from PIL import Image, ImageDraw
from scipy import ndimage
import numpy as np
import json

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'art/sources'
xs=[0,180,355,530,708,875,1024]
ys=[0,160,310,474,637,783,945,1115,1278,1420,1536]
# Engine-compatible first eight rows, plus dedicated kick and shuriken poses.
mapping=[('idle',0),('run',1),('melee',2),('dash',4),('rasengan',6),('clones',5),('hurt',8),('defeat',9),('kick',3),('shuriken',7)]
source=Image.open(SOURCE/'naruto.png').convert('RGBA')
out=ROOT/'art/frames/naruto';out.mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(1920,2240));meta={'frameSize':[320,224],'pivot':[160,192],'animations':{}}
contact=Image.new('RGB',(1200,1500),'#202b3b');draw=ImageDraw.Draw(contact)
for row,(name,sr) in enumerate(mapping):
    entries=[]
    for col in range(6):
        sc=[0,1,2,3,3,3][col] if name=='defeat' else col
        left=xs[sc]-(25 if (sr==9 and sc==2) or (sr==2 and sc==3) else 0)
        right=xs[sc+1]+(20 if sr==3 and sc==1 else 0)
        crop=source.crop((left,ys[sr],right,ys[sr+1]))
        a=np.array(crop);labels,_=ndimage.label(a[:,:,3]>50);sizes=np.bincount(labels.ravel());sizes[0]=0
        mask=ndimage.binary_dilation(labels==sizes.argmax(),iterations=1)
        # Alpha already exists: discard stray source background RGB and tiny neighboring fragments.
        a[~mask]=0;a[a[:,:,3]<8]=0
        crop=Image.fromarray(a)
        solid=a[:,:,3]>180
        yy,xx=np.where(solid)
        hair=(a[:,:,0]>180)&(a[:,:,1]>140)&(a[:,:,2]<120)&solid
        hy,hx=np.where(hair)
        pivot=int(np.median(hx)) if len(hx) else int(np.median(xx))
        bottom=int(yy.max()+1)
        frame=Image.new('RGBA',(320,224));frame.alpha_composite(crop,(160-pivot,192-bottom))
        file=f'{name}_{col:02d}.png';frame.save(out/file);atlas.alpha_composite(frame,(col*320,row*224))
        entries.append({'file':file,'rect':[col*320,row*224,320,224],'anchor':[160,192]})
        thumb=frame.resize((200,140));contact.paste(thumb,(col*200,row*150+10),thumb);draw.text((col*200+2,row*150),f'{name} {col}',fill='white')
    meta['animations'][name]=entries
atlas.save(ROOT/'art/atlases/naruto.png');atlas.save(ROOT/'dist/assets/characters/naruto/naruto.webp',lossless=True,method=6)
(out/'atlas.json').write_text(json.dumps(meta,indent=2));contact.save(out/'contact.png')
source=Image.open(SOURCE/'naruto_vfx.png').convert('RGBA');vx=[0,195,405,666,918,1145];vy=[0,250,490,709]
out=ROOT/'art/frames/naruto_vfx';out.mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(1600,672));meta={'frameSize':[320,224],'animations':{}}
for row,name in enumerate(['rasengan','shuriken','smoke']):
    entries=[]
    for col in range(5):
        crop=source.crop((vx[col],vy[row],vx[col+1],vy[row+1]));a=np.array(crop);a[a[:,:,3]<12]=0
        crop=Image.fromarray(a);crop=crop.crop(crop.getbbox());crop.thumbnail((306,210),Image.Resampling.LANCZOS)
        frame=Image.new('RGBA',(320,224));frame.alpha_composite(crop,((320-crop.width)//2,(224-crop.height)//2))
        frame.save(out/f'{name}_{col:02d}.png');atlas.alpha_composite(frame,(col*320,row*224));entries.append({'rect':[col*320,row*224,320,224],'anchor':[160,112]})
    meta['animations'][name]=entries
atlas.save(ROOT/'art/atlases/naruto_vfx.png');atlas.save(ROOT/'dist/assets/characters/naruto/naruto_vfx.webp',lossless=True,method=6)
(out/'atlas.json').write_text(json.dumps(meta,indent=2))
print('Naruto: 60 normal-form RGBA frames, 15 used VFX frames, PNG source atlases + lossless runtime WebP. Transformation VFX excluded.')
