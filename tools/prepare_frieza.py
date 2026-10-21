from pathlib import Path
from PIL import Image,ImageDraw
from scipy import ndimage
import numpy as np,json
R=Path(__file__).resolve().parents[1];base=Image.open(R/'art/sources/frieza.png').convert('RGBA');p=R/'art/sources/frieza_skills.png';p=p if p.exists() else R/'art/sources/frieza_skill.png';skill=Image.open(p).convert('RGBA')
assert base.size==(1536,1024) and skill.size==(1024,1536)
out=R/'art/frames/frieza';out.mkdir(parents=True,exist_ok=True);vout=R/'art/frames/frieza_vfx';vout.mkdir(parents=True,exist_ok=True);runtime=R/'dist/assets/characters/frieza';runtime.mkdir(parents=True,exist_ok=True);(R/'art/atlases').mkdir(exist_ok=True)
by=[0,147,267,408,558,692,827,981];sy=[0,205,407,640,852,1009,1145,1329,1536]
names=['idle','run','melee','kick','tail','guard','hurt','defeat','deathbeam','saucers','supernova','golden']
atlas=Image.new('RGBA',(2560,2688));contact=Image.new('RGB',(1280,1344),'#38554a');draw=ImageDraw.Draw(contact)
for row,name in enumerate(names):
 for col in range(8):
  if row<8:
   sr=row if row<6 else 6;sc=col if row<6 else ([0,1,2,3,4,5,5,5] if row==6 else [3,4,5,6,6,7,7,7])[col];left=max(0,sc*192-65);right=min(1536,(sc+1)*192+12);ys=by;src=base
  else:sr=row-8;sc=[0,1,2,3,4,4,5,5][col];left=round(sc*1024/6);right=round((sc+1)*1024/6);ys=sy;src=skill
  crop=src.crop((left,ys[sr],right,ys[sr+1]));a=np.array(crop);h,w=a.shape[:2];labels,n=ndimage.label(a[:,:,3]>35);sizes=np.bincount(labels.ravel());sizes[0]=0
  if n:a[:,:,3]=np.where(ndimage.binary_dilation(labels==sizes.argmax(),iterations=3),a[:,:,3],0)
  yy,xx=np.indices((h,w));head=(a[:,:,2]>a[:,:,1]+15)&(a[:,:,0]>45)&(a[:,:,3]>150)&(yy<h*.5)&(xx>w*.25)
  hx=float(np.median(xx[head])) if head.any() else w*.6;feet=(a[:,:,3]>150)&(yy>h*.6)&(abs(xx-hx)<w*.45);fy=int(yy[feet].max()+1) if feet.any() else h
  scale=1.02 if row<8 else .79
  frame=Image.new('RGBA',(320,224));cut=Image.fromarray(a).resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS);frame.alpha_composite(cut,(160-round(hx*scale),192-round(fy*scale)));frame.save(out/f'{name}_{col:02}.png');atlas.alpha_composite(frame,(col*320,row*224));thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb);draw.text((col*160,row*112),f'{name} {col}',fill='white')
atlas.save(R/'art/atlases/frieza.png');atlas.save(runtime/'frieza.webp',lossless=True,method=6);contact.save(out/'contact.png')
a=np.array(atlas);rgb=a[:,:,:3].astype(float);neutral=(rgb.max(axis=2)-rgb.min(axis=2)<52)&(rgb[:,:,1]>45)&(a[:,:,3]>0);lum=rgb.mean(axis=2);gold=np.stack([np.minimum(255,lum*1.15+24),np.minimum(235,lum*.91+10),lum*.32],axis=2);a[:,:,:3]=np.where(neutral[:,:,None],gold,rgb).astype('uint8');Image.fromarray(a).save(R/'art/atlases/frieza_golden.png');Image.fromarray(a).save(runtime/'frieza_golden.webp',lossless=True,method=6)
(out/'atlas.json').write_text(json.dumps({'frameSize':[320,224],'pivot':[160,192],'columns':8,'animations':{n:{'row':i,'frames':8} for i,n in enumerate(names)},'note':'hurt/defeat mapped from combined source row; six-frame casts held/resampled to eight'},indent=2))
vfx=Image.new('RGBA',(3072,1536));contact=Image.new('RGB',(1152,576),'#38554a')
for row,name in enumerate(['deathbeam','saucers','supernova','golden']):
 for col in range(6):
  crop=skill.crop((round(col*1024/6),sy[row+4],round((col+1)*1024/6),sy[row+5]));frame=Image.new('RGBA',(512,384));frame.alpha_composite(crop,((512-crop.width)//2,(384-crop.height)//2));frame.save(vout/f'{name}_{col:02}.png');vfx.alpha_composite(frame,(col*512,row*384));thumb=frame.resize((192,144));contact.paste(thumb,(col*192,row*144),thumb)
vfx.save(R/'art/atlases/frieza_vfx.png');vfx.save(runtime/'frieza_vfx.webp',lossless=True,method=6);contact.save(vout/'contact.png');(vout/'atlas.json').write_text(json.dumps({'frameSize':[512,384],'columns':6,'sourceAlphaPreserved':True},indent=2))
print('Frieza:96 body slots, gold variant,24 VFX; source alpha retained.')
