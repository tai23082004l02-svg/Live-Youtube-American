"""Extract Luffy using source alpha; six-column body and large VFX atlases."""
from pathlib import Path
from PIL import Image,ImageDraw
from scipy import ndimage
import numpy as np,json
R=Path(__file__).resolve().parents[1];base=Image.open(R/'art/sources/luffy.png').convert('RGBA')
source=R/'art/sources/luffy_skills.png'
if not source.exists():source=R/'art/sources/luffy_skill.png'
skill=Image.open(source).convert('RGBA')
assert base.size==(1086,1448) and skill.size==(1448,1086)
out=R/'art/frames/luffy';out.mkdir(parents=True,exist_ok=True);vout=R/'art/frames/luffy_vfx';vout.mkdir(parents=True,exist_ok=True);runtime=R/'dist/assets/characters/luffy';runtime.mkdir(parents=True,exist_ok=True);(R/'art/atlases').mkdir(exist_ok=True)
by=[0,186,366,552,731,914,1096,1284,1448];sy=[0,181,350,519,688,787,893,997,1086]
bx=[0,181,362,543,724,905,1086];sx=[0,235,471,711,987,1237,1448]
names=['idle','run','melee','dash','kick','guard','hurt','defeat','pistol','gatling','redhawk','gear2']
atlas=Image.new('RGBA',(1920,2688));contact=Image.new('RGB',(960,1344),'#38554a');draw=ImageDraw.Draw(contact);meta={'frameSize':[320,224],'pivot':[160,192],'animations':{}}
for row,name in enumerate(names):
 src=base if row<8 else skill;sr=row if row<8 else row-8;ys=by if row<8 else sy;xs=bx if row<8 else sx
 for col in range(6):
  # The generated extended-arm poses overlap their neighboring actor. Hold anticipation,
  # then render the complete rubber arm independently from the VFX atlas in the game.
  sc=1 if (row==2 and col in [2,3]) or (row in [8,10] and col in [2,3]) else col
  crop=src.crop((xs[sc],ys[sr],xs[sc+1]+(35 if row==4 and col==3 else 0),ys[sr+1]));a=np.array(crop);h,w=a.shape[:2]
  labels,n=ndimage.label(a[:,:,3]>40);sizes=np.bincount(labels.ravel());sizes[0]=0
  if n:a[:,:,3]=np.where(ndimage.binary_dilation(labels==sizes.argmax(),iterations=3),a[:,:,3],0)
  yy,xx=np.indices((h,w));hat=(a[:,:,0]>125)&(a[:,:,1]>70)&(a[:,:,2]<130)&(a[:,:,3]>150)&(yy<h*.4)&(xx>w*.15)&(xx<w*.8)
  hx=float(np.median(xx[hat])) if hat.any() else w/2;feet=(a[:,:,3]>150)&(yy>h*.65)&(abs(xx-hx)<w*.4)
  fy=int(yy[feet].max()+1) if feet.any() else h
  scale=.81
  crop=Image.fromarray(a).resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS)
  frame=Image.new('RGBA',(320,224));frame.alpha_composite(crop,(160-round(hx*scale),192-round(fy*scale)))
  frame.save(out/f'{name}_{col:02}.png');atlas.alpha_composite(frame,(col*320,row*224));thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb);draw.text((col*160,row*112),f'{name} {col}',fill='white')
 meta['animations'][name]={'row':row,'frames':6}
atlas.save(R/'art/atlases/luffy.png');atlas.save(runtime/'luffy.webp',lossless=True,method=6);contact.save(out/'contact.png');(out/'atlas.json').write_text(json.dumps(meta,indent=2))
vfx=Image.new('RGBA',(3072,1536));contact=Image.new('RGB',(1152,576),'#38554a')
vx=[0,209,435,720,969,1232,1448]
for row,name in enumerate(['pistol','gatling','redhawk','gear2']):
 for col in range(6):
  crop=skill.crop((vx[col],sy[row+4],vx[col+1],sy[row+5]));frame=Image.new('RGBA',(512,384));frame.alpha_composite(crop,((512-crop.width)//2,(384-crop.height)//2));frame.save(vout/f'{name}_{col:02}.png');vfx.alpha_composite(frame,(col*512,row*384));thumb=frame.resize((192,144));contact.paste(thumb,(col*192,row*144),thumb)
vfx.save(R/'art/atlases/luffy_vfx.png');vfx.save(runtime/'luffy_vfx.webp',lossless=True,method=6);contact.save(vout/'contact.png');(vout/'atlas.json').write_text(json.dumps({'frameSize':[512,384],'pivot':[256,192],'sourceAlphaPreserved':True,'animations':{n:{'row':i,'frames':6} for i,n in enumerate(['pistol','gatling','redhawk','gear2'])}},indent=2))
print('Luffy:72 body frame slots,24 VFX frames. Extended arms use independent VFX; alpha retained.')
