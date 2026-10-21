"""Preserve source alpha and soft skill glow; do not key out or threshold VFX."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
from scipy import ndimage
R=Path(__file__).resolve().parents[1]
base=Image.open(R/'art/sources/sasuke.png').convert('RGBA');skill=Image.open(R/'art/sources/sasuke_skills.png').convert('RGBA')
assert base.size==skill.size==(1086,1448),'Review source coordinates for a different sheet size'
xs=[0,195,373,551,730,913,1086]
by=[0,190,371,557,742,927,1116,1300,1448]
sy=[0,229,417,620,821,966,1128,1261,1448]
names=['idle','run','melee','dash','kick','guard','hurt','defeat','chidori','fireball','amaterasu','susanoo']
out=R/'art/frames/sasuke';out.mkdir(parents=True,exist_ok=True)
runtime=R/'dist/assets/characters/sasuke';runtime.mkdir(parents=True,exist_ok=True)
(R/'art/atlases').mkdir(exist_ok=True)
atlas=Image.new('RGBA',(1920,2688));contact=Image.new('RGB',(960,1344),'#38554a');draw=ImageDraw.Draw(contact);meta={'frameSize':[320,224],'pivot':[160,192],'animations':{}}
scale=.86
for row,name in enumerate(names):
 source=base if row<8 else skill;sr=row if row<8 else row-8;ys=by if row<8 else sy
 for col in range(6):
  bounds=xs if row<8 else ([0,185,365,525,675,940,1086] if sr==1 else [0,190,375,550,730,930,1086])
  crop=source.crop((bounds[col],ys[sr],bounds[col+1],ys[sr+1]));a=np.array(crop);h,w=a.shape[:2]
  labels,count=ndimage.label(a[:,:,3]>40);sizes=np.bincount(labels.ravel());sizes[0]=0
  if count:
   primary=labels==sizes.argmax();near=ndimage.binary_dilation(primary,iterations=3);a[:,:,3]=np.where(near,a[:,:,3],0);crop=Image.fromarray(a)
  yy,xx=np.indices((h,w));hair=(a[:,:,0]<65)&(a[:,:,1]<75)&(a[:,:,2]>15)&(a[:,:,2]<110)&(a[:,:,3]>190)&(yy<h*.55)&(xx>w*.15)&(xx<w*.85)
  hx=float(np.median(xx[hair])) if hair.any() else w/2
  feet=(a[:,:,3]>190)&(yy>h*.65)&(abs(xx-hx)<75)&(a[:,:,:3].max(axis=2)<150)
  fy=int(yy[feet].max()+1) if feet.any() else (crop.getbbox() or (0,0,w,h))[3]
  crop=crop.resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS)
  frame=Image.new('RGBA',(320,224));frame.alpha_composite(crop,(160-round(hx*scale),192-round(fy*scale)))
  frame.save(out/f'{name}_{col:02}.png');atlas.alpha_composite(frame,(col*320,row*224));thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb);draw.text((col*160,row*112),f'{name} {col}',fill='white')
 meta['animations'][name]={'row':row,'frames':6}
atlas.save(R/'art/atlases/sasuke.png');atlas.save(runtime/'sasuke.webp',lossless=True,method=6);contact.save(out/'contact.png');(out/'atlas.json').write_text(json.dumps(meta,indent=2))
vout=R/'art/frames/sasuke_vfx';vout.mkdir(exist_ok=True)
vfx=Image.new('RGBA',(3072,1536));contact=Image.new('RGB',(1152,576),'#38554a')
# Hand-reviewed bounds give the larger fireballs and avatars room beyond nominal column lines.
vxs=[[0,146,344,535,735,929,1086],[0,148,314,535,734,929,1086],[0,161,336,535,735,929,1086],[0,168,341,548,743,929,1086]]
for row,name in enumerate(['chidori','fireball','amaterasu','susanoo']):
 for col in range(6):
  crop=skill.crop((vxs[row][col],sy[row+4],vxs[row][col+1],sy[row+5]))
  frame=Image.new('RGBA',(512,384));frame.alpha_composite(crop,((512-crop.width)//2,(384-crop.height)//2))
  frame.save(vout/f'{name}_{col:02}.png');vfx.alpha_composite(frame,(col*512,row*384));thumb=frame.resize((192,144));contact.paste(thumb,(col*192,row*144),thumb)
vfx.save(R/'art/atlases/sasuke_vfx.png');vfx.save(runtime/'sasuke_vfx.webp',lossless=True,method=6);contact.save(vout/'contact.png')
(vout/'atlas.json').write_text(json.dumps({'frameSize':[512,384],'pivot':[256,192],'sourceAlphaPreserved':True,'animations':{n:{'row':i,'frames':6} for i,n in enumerate(['chidori','fireball','amaterasu','susanoo'])}},indent=2))
print('Sasuke: 72 character frames, 24 VFX frames. Original alpha retained, VFX cells512x384.')
