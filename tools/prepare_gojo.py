"""Extract Gojo's replacement six-column sheets into pivot-aligned RGBA atlases."""
from pathlib import Path
import json
import cv2
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art/frames/gojo';OUT.mkdir(parents=True,exist_ok=True)
RUNTIME=ROOT/'dist/assets/characters/gojo';RUNTIME.mkdir(parents=True,exist_ok=True)
(ROOT/'art/atlases').mkdir(exist_ok=True)
base=Image.open(ROOT/'art/sources/gojo.png').convert('RGB').resize((1536,1024))
skills=Image.open(ROOT/'art/sources/gojo_skills.png').convert('RGB').resize((1536,1024))
# Row boundaries follow the illustrations rather than assuming a uniform source grid.
base_y=[0,145,276,411,524,659,792,915,1024]
skill_y=[0,147,286,425,575,688,799,905,1024]
xs=[0,281,534,785,1042,1292,1536]
base_names=['idle','run','melee','dash','kick','guard','hurt','defeat']

def body(crop):
 a=np.array(crop)
 # The source has closed ink contours. Flood the smooth backdrop up to these contours,
 # preserving the enclosed hair, blindfold and dark clothes as a single silhouette.
 edges=cv2.Canny(a,35,80)
 barrier=ndimage.binary_dilation(edges>0,iterations=1)
 seed=np.zeros(barrier.shape,bool);seed[0]=True;seed[-1]=True;seed[:,0]=True;seed[:,-1]=True
 background=ndimage.binary_propagation(seed,mask=~barrier)
 solid=ndimage.binary_opening(~background,iterations=1)
 labels,n=ndimage.label(solid);sizes=np.bincount(labels.ravel());sizes[0]=0
 if n: solid=labels==sizes.argmax()
 alpha=np.uint8(ndimage.gaussian_filter(solid.astype(float),.45)*255)
 result=Image.fromarray(np.dstack([a,alpha]));box=result.getbbox()
 return result.crop(box) if box else result

atlas=Image.new('RGBA',(1920,2688));meta={'frameSize':[320,224],'pivot':[160,192],'animations':{}}
contact=Image.new('RGB',(960,1344),'#3c6859');draw=ImageDraw.Draw(contact)
for row,name in enumerate(base_names+['blue','red','purple','domain']):
 source=base if row<8 else skills;sr=row if row<8 else row-8;ys=base_y if row<8 else skill_y
 for col in range(6):
  # Skills column 1 contains small orbs beside the body: restrict extraction to its central body.
  edges=ys
  crop=source.crop((xs[col],edges[sr],xs[col+1],edges[sr+1]))
  cut=body(crop)
  # The common scale is set from the standing body, never resize wide punches to fit height independently.
  if row==0 and col==0: scale=145/cut.height
  cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS)
  frame=Image.new('RGBA',(320,224));frame.alpha_composite(cut,(160-cut.width//2,192-cut.height))
  frame.save(OUT/f'{name}_{col:02}.png');atlas.alpha_composite(frame,(col*320,row*224))
  thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb);draw.text((col*160,row*112),f'{name} {col}',fill='white')
 meta['animations'][name]={'row':row,'frames':6}
atlas.save(ROOT/'art/atlases/gojo.png');atlas.save(RUNTIME/'gojo.webp',lossless=True,method=6);contact.save(OUT/'contact.png')
(OUT/'atlas.json').write_text(json.dumps(meta,indent=2))
vout=ROOT/'art/frames/gojo_vfx';vout.mkdir(exist_ok=True)
vfx=Image.new('RGBA',(1920,896));contact=Image.new('RGB',(960,448),'#3c6859')
for row,name in enumerate(['blue','red','purple','domain']):
 for col in range(6):
  crop=np.array(skills.crop((xs[col],skill_y[row+4],xs[col+1],skill_y[row+5]))).astype(float)
  # High frequency light isolates emissive effects from baked smooth colored glow/backdrop.
  background=cv2.GaussianBlur(crop,(0,0),13)
  light=np.maximum(0,crop-background+np.maximum(0,crop-175)*.45)
  intensity=light.max(axis=2)
  alpha=np.clip((intensity-20)*3.5,0,255)
  alpha[:3]=0;alpha[-3:]=0;alpha[:,:3]=0;alpha[:,-3:]=0
  rgba=np.dstack([np.clip(crop,0,255),alpha]).astype('uint8');cut=Image.fromarray(rgba)
  frame=Image.new('RGBA',(320,224));frame.alpha_composite(cut,((320-cut.width)//2,(224-cut.height)//2))
  frame.save(vout/f'{name}_{col:02}.png');vfx.alpha_composite(frame,(col*320,row*224));thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb)
vfx.save(ROOT/'art/atlases/gojo_vfx.png');vfx.save(RUNTIME/'gojo_vfx.webp',lossless=True,method=6);contact.save(vout/'contact.png')
(vout/'atlas.json').write_text(json.dumps({'frameSize':[320,224],'pivot':[160,112],'animations':{n:{'row':i,'frames':6} for i,n in enumerate(['blue','red','purple','domain'])}},indent=2))
print('Gojo: 72 character frames, 24 separate effect frames, RGBA PNG atlases and lossless WebP.')
