from pathlib import Path
from PIL import Image,ImageDraw
from scipy import ndimage
import numpy as np,json
R=Path(__file__).resolve().parents[1];base=Image.open(R/'art/sources/gaara.png').convert('RGBA');skills=Image.open(R/'art/sources/gaara_skills.png').convert('RGBA');assert base.size==skills.size==(1024,1536)
out=R/'art/frames/gaara';out.mkdir(parents=True,exist_ok=True);vout=R/'art/frames/gaara_vfx';vout.mkdir(parents=True,exist_ok=True);runtime=R/'dist/assets/characters/gaara';runtime.mkdir(parents=True,exist_ok=True)
by=[0,194,383,579,765,958,1155,1345,1536];sy=[0,202,397,601,803,962,1150,1335,1536];names=['idle','run','melee','dash','kick','guard','hurt','defeat','sandstream','coffin','sandshield','quicksand'];atlas=Image.new('RGBA',(1920,2688));contact=Image.new('RGB',(960,1344),'#38554a');draw=ImageDraw.Draw(contact)
for row,name in enumerate(names):
 for col in range(6):
  src=base if row<8 else skills;sr=row if row<8 else row-8;ys=by if row<8 else sy;left=round(col*1024/6);right=round((col+1)*1024/6)+(20 if row==4 and col==2 else 0);crop=src.crop((left,ys[sr],right,ys[sr+1]));a=np.array(crop);h,w=a.shape[:2];labels,n=ndimage.label(a[:,:,3]>40);sizes=np.bincount(labels.ravel());sizes[0]=0
  if n:a[:,:,3]=np.where(ndimage.binary_dilation(labels==sizes.argmax(),iterations=3),a[:,:,3],0)
  yy,xx=np.indices((h,w));hair=(a[:,:,0]>a[:,:,1]*1.3)&(a[:,:,0]>70)&(a[:,:,3]>150)&(yy<h*.4);hx=float(np.median(xx[hair])) if hair.any() else w*.6;feet=(a[:,:,3]>150)&(yy>h*.65)&(abs(xx-hx)<80);fy=int(yy[feet].max()+1) if feet.any() else h;scale=.79;cut=Image.fromarray(a).resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS);frame=Image.new('RGBA',(320,224));frame.alpha_composite(cut,(160-round(hx*scale),192-round(fy*scale)));frame.save(out/f'{name}_{col:02}.png');atlas.alpha_composite(frame,(col*320,row*224));thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb);draw.text((col*160,row*112),f'{name} {col}',fill='white')
atlas.save(R/'art/atlases/gaara.png');atlas.save(runtime/'gaara.webp',lossless=True,method=6);contact.save(out/'contact.png');(out/'atlas.json').write_text(json.dumps({'frameSize':[320,224],'pivot':[160,192],'animations':{n:{'row':i,'frames':6} for i,n in enumerate(names)}},indent=2))
vfx=Image.new('RGBA',(3072,1536));contact=Image.new('RGB',(1152,576),'#38554a')
for row,name in enumerate(names[8:]):
 for col in range(6):
  crop=skills.crop((round(col*1024/6),sy[row+4],round((col+1)*1024/6),sy[row+5]));frame=Image.new('RGBA',(512,384));frame.alpha_composite(crop,((512-crop.width)//2,(384-crop.height)//2));frame.save(vout/f'{name}_{col:02}.png');vfx.alpha_composite(frame,(col*512,row*384));thumb=frame.resize((192,144));contact.paste(thumb,(col*192,row*144),thumb)
vfx.save(R/'art/atlases/gaara_vfx.png');vfx.save(runtime/'gaara_vfx.webp',lossless=True,method=6);contact.save(vout/'contact.png');(vout/'atlas.json').write_text(json.dumps({'frameSize':[512,384],'sourceAlphaPreserved':True},indent=2));print('Gaara:72 body frames,24 separate VFX, source alpha preserved.')
